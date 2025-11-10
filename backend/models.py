from mongoengine import (
    Document,
    StringField,
    DateTimeField,
    FloatField,
    ReferenceField,
    CASCADE
)
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

# --- User Model ---
class User(Document):
    name = StringField(required=True)
    email = StringField(required=True, unique=True)
    password = StringField(required=True)

    def set_password(self, password: str):
        # Hashes the password securely
        self.password = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        # Checks the provided password against the stored hash
        return check_password_hash(self.password, password)

# --- Health Record Model (Prediction Data) ---
class HealthRecord(Document):
    user = ReferenceField(User, reverse_delete_rule=CASCADE, required=True) # Links the record to the User
    date_submitted = DateTimeField(default=datetime.utcnow)
    risk_score = FloatField(required=True)
    prediction_result = StringField(required=True)
    
    # Core input features required for prediction (e.g., from Cleveland Heart Disease dataset)
    age = FloatField(required=True)
    sex = FloatField(required=True)
    cp = FloatField(required=True)
    trestbps = FloatField(required=True)
    chol = FloatField(required=True)
    fbs = FloatField(required=True)
    thalach = FloatField(required=True)
    exang = FloatField(required=True)
    oldpeak = FloatField(required=True)
    
    def to_dict(self):
        # Helper for sending JSON responses
        return {
            'id': str(self.id),
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
            'oldpeak': self.oldpeak
        }