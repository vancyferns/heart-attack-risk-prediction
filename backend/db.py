# db.py
from pymongo import MongoClient
import os

# --- IMPORTANT ---
# Make sure your MongoDB server is running.
# The default connection string is for a local MongoDB instance.
MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)

# Select the database
db = client.heart_risk_prediction

# Select the collections
users_col = db.users