# db.py
from pymongo import MongoClient
import os

# --- IMPORTANT ---
# Make sure your MongoDB server is running.
# The default connection string is for a local MongoDB instance.
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
client = MongoClient(MONGO_URI)

# Select the database
db = client.goa_guild_hackathon

# Select the collections
guides_col = db.guides
experiences_col = db.experiences
reviews_col = db.reviews
bookings_col = db.bookings

print("MongoDB connected successfully!")