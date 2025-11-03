import os
from dotenv import load_dotenv
from pathlib import Path

env_path = Path(".env")
print(f" .env file exists: {env_path.exists()}")
print(f" .env path: {env_path.absolute()}")

if env_path.exists():
    print(" Loading .env file...")
    load_dotenv(env_path)
    
    # Check all environment variables
    mongodb_uri = os.getenv("MONGODB_URI")
    database_name = os.getenv("DATABASE_NAME")
    port = os.getenv("PORT")
    
    print(f" Environment variables after loading:")
    print(f"   - MONGODB_URI: '{mongodb_uri}'")
    print(f"   - MONGODB_URI length: {len(mongodb_uri) if mongodb_uri else 0}")
    print(f"   - DATABASE_NAME: '{database_name}'")
    print(f"   - PORT: '{port}'")
    
    # Check if there are any hidden characters
    if mongodb_uri:
        print(f"   - MONGODB_URI bytes: {[ord(c) for c in mongodb_uri[:50]]}")
else:
    print("❌ .env file not found")
