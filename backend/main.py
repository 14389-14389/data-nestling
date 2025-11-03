from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
import os
from dotenv import load_dotenv
from bson import ObjectId
from datetime import datetime
import uuid
import shutil
from pathlib import Path
import asyncio
import json
from typing import List, Dict
import time

# Load environment variables FIRST
env_path = Path(".env")
print(f"🔍 Looking for .env file at: {env_path.absolute()}")

if env_path.exists():
    print("✅ .env file found, loading environment variables...")
    load_dotenv(env_path)
else:
    print("❌ .env file not found")

# Get environment variables
MONGODB_URI = os.getenv("MONGODB_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME", "data_nestling")
PORT = os.getenv("PORT", "8000")

print(f"🔧 Environment variables:")
print(f"   - MONGODB_URI: {'Set' if MONGODB_URI else 'Not set'}")
print(f"   - DATABASE_NAME: {DATABASE_NAME}")
print(f"   - PORT: {PORT}")

# Don't raise error at module level - let the app start and handle it in health checks
if not MONGODB_URI:
    print("⚠️  WARNING: MONGODB_URI not set. App will start but database operations will fail.")

app = FastAPI(
    title="Data Nestling API",
    description="Real-time Backend API for file uploads and management",
    version="2.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
UPLOAD_DIR = Path("uploads")
MAX_FILE_SIZE = 100 * 1024 * 1024  # 100MB

# Create uploads directory
UPLOAD_DIR.mkdir(exist_ok=True)

print(f"💾 Upload directory: {UPLOAD_DIR.absolute()}")

# WebSocket connections
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                self.disconnect(connection)

manager = ConnectionManager()

# Database variables - initialize as None
client = None
db = None
files_collection = None
database_connected = False

def initialize_database():
    """Initialize MongoDB connection"""
    global client, db, files_collection, database_connected
    
    if not MONGODB_URI:
        print("🚫 Skipping MongoDB initialization - MONGODB_URI not set")
        return False
    
    try:
        print("🔄 Attempting to connect to MongoDB...")
        client = MongoClient(
            MONGODB_URI, 
            serverSelectionTimeoutMS=10000,
            connectTimeoutMS=10000,
            socketTimeoutMS=10000
        )
        
        # Test connection
        client.admin.command('ping')
        db = client[DATABASE_NAME]
        files_collection = db.files
        
        # Create indexes
        files_collection.create_index("upload_date", background=True)
        files_collection.create_index("starred", background=True)
        files_collection.create_index("file_type", background=True)
        
        print("✅ MongoDB Atlas connected successfully!")
        database_connected = True
        return True
        
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")
        database_connected = False
        return False

def get_file_extension(filename: str) -> str:
    return Path(filename).suffix.lower()

def generate_unique_filename(original_name: str) -> str:
    extension = get_file_extension(original_name)
    unique_id = uuid.uuid4().hex
    return f"{unique_id}{extension}"

def get_file_type(mime_type: str, filename: str) -> str:
    if mime_type.startswith('image/'):
        return 'image'
    elif mime_type.startswith('video/'):
        return 'video'
    elif mime_type.startswith('audio/'):
        return 'audio'
    elif mime_type in ['application/pdf'] or filename.endswith('.pdf'):
        return 'document'
    elif mime_type in ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']:
        return 'document'
    elif any(filename.endswith(ext) for ext in ['.txt', '.doc', '.docx', '.rtf']):
        return 'document'
    elif any(filename.endswith(ext) for ext in ['.zip', '.rar', '.7z', '.tar', '.gz']):
        return 'archive'
    else:
        return 'other'

async def cleanup_old_files():
    try:
        if UPLOAD_DIR.exists():
            for file_path in UPLOAD_DIR.iterdir():
                if file_path.is_file():
                    filename = file_path.name
                    if files_collection and not files_collection.find_one({"filename": filename}):
                        file_path.unlink()
                        print(f"🧹 Cleaned up orphaned file: {filename}")
    except Exception as e:
        print(f"❌ File cleanup failed: {e}")

async def notify_file_update(update_type: str, file_data: Dict = None):
    message = {
        "type": update_type,
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }
    
    if file_data:
        message["file"] = file_data
    
    await manager.broadcast(json.dumps(message))

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.get("/")
async def root():
    return {
        "message": "Data Nestling Real-Time Backend API",
        "version": "2.0.0",
        "status": "running",
        "database": "connected" if database_connected else "disconnected",
        "realtime": True
    }

@app.get("/api/health")
async def health_check():
    if not database_connected:
        return {
            "status": "unhealthy", 
            "service": "data-nestling-backend",
            "database": "disconnected",
            "error": "MongoDB connection failed - check MONGODB_URI in .env file",
            "total_files": 0
        }
    
    try:
        client.admin.command('ping')
        total_files = files_collection.count_documents({})
        
        return {
            "status": "healthy", 
            "service": "data-nestling-backend",
            "database": "connected",
            "database_type": "MongoDB Atlas",
            "total_files": total_files,
            "upload_dir": str(UPLOAD_DIR.absolute()),
            "realtime_ws": True,
            "websocket_connections": len(manager.active_connections)
        }
    except Exception as e:
        return {
            "status": "unhealthy", 
            "service": "data-nestling-backend",
            "database": "disconnected",
            "error": str(e),
            "total_files": 0
        }

@app.get("/api/stats")
async def get_stats():
    if not database_connected:
        raise HTTPException(status_code=503, detail="Database not connected")
    
    try:
        pipeline = [
            {
                "$group": {
                    "_id": None,
                    "total_files": {"$sum": 1},
                    "total_size": {"$sum": "$size"},
                    "starred_count": {"$sum": {"$cond": ["$starred", 1, 0]}},
                    "total_downloads": {"$sum": "$download_count"}
                }
            }
        ]
        
        stats = list(files_collection.aggregate(pipeline))
        file_type_stats = list(files_collection.aggregate([
            {"$group": {"_id": "$file_type", "count": {"$sum": 1}}}
        ]))
        
        if stats:
            result = {
                "total_files": stats[0]["total_files"],
                "total_size": stats[0]["total_size"],
                "starred_count": stats[0]["starred_count"],
                "total_downloads": stats[0]["total_downloads"],
                "file_types": {ft["_id"]: ft["count"] for ft in file_type_stats}
            }
        else:
            result = {
                "total_files": 0,
                "total_size": 0,
                "starred_count": 0,
                "total_downloads": 0,
                "file_types": {}
            }
        
        await manager.broadcast(json.dumps({
            "type": "stats_updated",
            "stats": result,
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }))
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching stats: {str(e)}")

@app.get("/api/files")
async def get_files():
    if not database_connected:
        raise HTTPException(status_code=503, detail="Database not connected")
    
    try:
        files = list(files_collection.find({}).sort("upload_date", -1))
        
        for file in files:
            file["id"] = str(file["_id"])
            del file["_id"]
            
        return files
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching files: {str(e)}")

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...), background_tasks: BackgroundTasks = None):
    if not database_connected:
        raise HTTPException(status_code=503, detail="Database not connected")
    
    content = await file.read()
    file_size = len(content)
    
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail=f"File too large. Maximum size is {MAX_FILE_SIZE // (1024*1024)}MB")
    
    if file_size == 0:
        raise HTTPException(status_code=400, detail="File is empty")
    
    unique_filename = generate_unique_filename(file.filename)
    file_path = UPLOAD_DIR / unique_filename
    
    try:
        with open(file_path, "wb") as buffer:
            buffer.write(content)
        
        file_type = get_file_type(file.content_type or "application/octet-stream", file.filename)
        
        file_data = {
            "original_name": file.filename,
            "filename": unique_filename,
            "file_path": str(file_path),
            "mime_type": file.content_type or "application/octet-stream",
            "file_type": file_type,
            "size": file_size,
            "upload_date": datetime.utcnow(),
            "starred": False,
            "download_count": 0
        }
        
        result = files_collection.insert_one(file_data)
        file_data["id"] = str(result.inserted_id)
        del file_data["_id"]
        
        print(f"📁 Real upload: {file.filename} -> {unique_filename} ({file_size} bytes)")
        
        if background_tasks:
            background_tasks.add_task(cleanup_old_files)
        
        await notify_file_update("file_uploaded", file_data)
        
        return file_data
        
    except Exception as e:
        if file_path.exists():
            file_path.unlink()
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@app.delete("/api/files/{file_id}")
async def delete_file(file_id: str):
    if not database_connected:
        raise HTTPException(status_code=503, detail="Database not connected")
    
    try:
        file_data = files_collection.find_one({"_id": ObjectId(file_id)})
        if not file_data:
            raise HTTPException(status_code=404, detail="File not found")
        
        file_path = Path(file_data.get("file_path", ""))
        if file_path.exists():
            file_path.unlink()
        
        result = files_collection.delete_one({"_id": ObjectId(file_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="File not found")
        
        file_data["id"] = str(file_data["_id"])
        del file_data["_id"]
        
        await notify_file_update("file_deleted", file_data)
        
        return {"success": True, "message": "File deleted successfully"}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Delete failed: {str(e)}")

@app.patch("/api/files/{file_id}/star")
async def toggle_star(file_id: str):
    if not database_connected:
        raise HTTPException(status_code=503, detail="Database not connected")
    
    try:
        file = files_collection.find_one({"_id": ObjectId(file_id)})
        if not file:
            raise HTTPException(status_code=404, detail="File not found")
        
        new_star_status = not file.get("starred", False)
        files_collection.update_one(
            {"_id": ObjectId(file_id)},
            {"$set": {"starred": new_star_status}}
        )
        
        updated_file = files_collection.find_one({"_id": ObjectId(file_id)})
        updated_file["id"] = str(updated_file["_id"])
        del updated_file["_id"]
        
        await notify_file_update("file_updated", updated_file)
        
        return {"success": True, "starred": new_star_status}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Star toggle failed: {str(e)}")

@app.get("/api/files/{file_id}/download")
async def download_file(file_id: str):
    if not database_connected:
        raise HTTPException(status_code=503, detail="Database not connected")
    
    try:
        file_data = files_collection.find_one({"_id": ObjectId(file_id)})
        if not file_data:
            raise HTTPException(status_code=404, detail="File not found")
        
        file_path = Path(file_data.get("file_path", ""))
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="File not found on disk")
        
        files_collection.update_one(
            {"_id": ObjectId(file_id)},
            {"$inc": {"download_count": 1}}
        )
        
        await notify_file_update("file_downloaded", {
            "id": str(file_data["_id"]),
            "original_name": file_data["original_name"]
        })
        
        return FileResponse(
            path=file_path,
            filename=file_data["original_name"],
            media_type=file_data["mime_type"]
        )
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Download failed: {str(e)}")

@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    initialize_database()
    await cleanup_old_files()
    print("🚀 Data Nestling Real-Time Backend started successfully!")
    print("📡 WebSocket support enabled for real-time updates")

if __name__ == "__main__":
    import uvicorn
    port = int(PORT)
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
