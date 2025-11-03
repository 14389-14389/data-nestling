import os
from pathlib import Path

def load_env_manually(env_path):
    """Load .env file manually"""
    with open(env_path, 'r') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                os.environ[key] = value
                print(f"Set {key} = {value}")

env_path = Path(".env")
print(f"🔍 .env file exists: {env_path.exists()}")

if env_path.exists():
    print("📖 Reading .env file manually...")
    load_env_manually(env_path)
    
    # Check variables
    print("🔧 Environment variables:")
    print(f"   - MONGODB_URI: '{os.getenv('MONGODB_URI')}'")
    print(f"   - DATABASE_NAME: '{os.getenv('DATABASE_NAME')}'")
    print(f"   - PORT: '{os.getenv('PORT')}'")
else:
    print("❌ .env file not found")
