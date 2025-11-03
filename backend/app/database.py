import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "data_nestling")

client = MongoClient(MONGODB_URI)
database = client[DATABASE_NAME]

def get_database():
    return database

def get_files_collection():
    return database["files"]
