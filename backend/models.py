from mongoengine import (
    Document,
    StringField,
    DateTimeField,
    FloatField,
    ReferenceField,
    CASCADE
)
from datetime import datetime
import hashlib
from werkzeug.security import generate_password_hash, check_password_hash


def _is_sha256_hex(value: str) -> bool:
    if not isinstance(value, str) or len(value) != 64:
        return False
    return all(ch in '0123456789abcdefABCDEF' for ch in value)


def _sha256_hex(value: str) -> str:
    return hashlib.sha256(value.encode('utf-8')).hexdigest()

# --- User Model ---
class User(Document):
    meta = {'collection': 'users'}
    name = StringField(required=True)
    email = StringField(required=True, unique=True)
    password = StringField(required=True)

    def set_password(self, password: str):
        # Normalize to SHA-256 first, then store as salted hash.
        normalized = password if _is_sha256_hex(password) else _sha256_hex(password)
        self.password = generate_password_hash(normalized)

    def check_password(self, password: str) -> bool:
        # Primary path: frontend already sends SHA-256.
        if check_password_hash(self.password, password):
            return True

        # Compatibility path for direct/plaintext clients.
        if not _is_sha256_hex(password):
            return check_password_hash(self.password, _sha256_hex(password))

        return False

# --- Health Record Model (Prediction Data) ---
class HealthRecord(Document):
    meta = {'collection': 'health_records'}
    user = ReferenceField(User, reverse_delete_rule=CASCADE, required=True) # Links the record to the User
    patient_name = StringField(required=False)
    date_submitted = DateTimeField(default=datetime.utcnow)
    risk_score = FloatField(required=True)
    prediction_result = StringField(required=True)
    
    # Core input features for prediction. Make optional so frontend can submit
    # minimal records (some fields may be unavailable for eye-scan based flow).
    age = FloatField(required=False)
    sex = FloatField(required=False)
    cp = FloatField(required=False)
    trestbps = FloatField(required=False)
    chol = FloatField(required=False)
    fbs = FloatField(required=False)
    thalach = FloatField(required=False)
    exang = FloatField(required=False)
    oldpeak = FloatField(required=False)
    # Optional image / metadata field
    image_url = StringField(required=False)
    
    def to_dict(self):
        # Helper for sending JSON responses
        return {
            'id': str(self.id),
            'patient_name': self.patient_name,
            'date_submitted': self.date_submitted.isoformat() if self.date_submitted else None,
            'risk_score': self.risk_score,
            'prediction_result': self.prediction_result,
            'age': self.age,
            'sex': self.sex,
            'cp': self.cp,
            'trestbps': self.trestbps,
            'chol': self.chol,
            'fbs': self.fbs,
            'thalach': self.thalach,
            'exang': self.exang,
            'oldpeak': self.oldpeak,
            'image_url': getattr(self, 'image_url', None)
        }