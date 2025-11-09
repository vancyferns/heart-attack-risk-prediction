from mongoengine import Document, StringField, FloatField, IntField, DateTimeField, ReferenceField
from flask_bcrypt import Bcrypt
from datetime import datetime

bcrypt = Bcrypt()

# --- User Model ---
class User(Document):
    name = StringField(max_length=100, required=True)
    email = StringField(max_length=120, required=True, unique=True)
    password = StringField(max_length=128, required=True)
    date = DateTimeField(default=datetime.utcnow)
    
    def set_password(self, password):
        # Hashes the password securely
        self.password = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        # Checks the provided password against the stored hash
        return bcrypt.check_password_hash(self.password, password)

# --- Health Record Model (Prediction Data) ---
class HealthRecord(Document):
    user = ReferenceField(User, required=True) # Links the record to the User
    
    # Core input features required for prediction (e.g., from Cleveland Heart Disease dataset)
    age = IntField(required=True)
    sex = IntField(required=True)  # 0: Female, 1: Male
    cp = IntField(required=True)   # Chest Pain Type 
    trestbps = IntField(required=True) # Resting Blood Pressure
    chol = IntField(required=True)     # Serum Cholestoral
    fbs = IntField(required=True)      # Fasting Blood Sugar
    thalach = IntField(required=True)  # Maximum Heart Rate achieved
    exang = IntField(required=True)    # Exercise Induced Angina (0=No, 1=Yes)
    oldpeak = FloatField(required=True)  # ST depression
    
    # Prediction Results
    risk_score = FloatField()          # The numerical probability (0.0 to 1.0)
    prediction_result = StringField()  # Final interpretation (e.g., "High Risk")
    date_submitted = DateTimeField(default=datetime.utcnow)
    
    def to_dict(self):
        # Helper for sending JSON responses
        return {
            '_id': str(self.id), # Use _id for MongoDB compatibility
            'age': self.age,
            'risk_score': self.risk_score,
            'prediction_result': self.prediction_result,
            'date_submitted': self.date_submitted.isoformat()
        }