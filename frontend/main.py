from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
import os
from dotenv import load_dotenv
from bson import ObjectId
from datetime import datetime

load_dotenv()

app = FastAPI(
    title="Data Nestling API",
    description="Backend API for file uploads and management",
    version="1.0.0"
)

# CORS middleware - allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React/Vite dev servers        
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
MONGODB_URI = os.getenv("MONGODB_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME", "data_nestling")

try:
    client = MongoClient(MONGODB_URI)
    db = client[DATABASE_NAME]
    files_collection = db.files
    print("✅ MongoDB connected successfully")
except Exception as e:
    print(f"❌ MongoDB connection failed: {e}")

@app.get("/")
async def root():
    return {"message": "Data Nestling Backend API"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "data-nestling-backend"}

@app.get("/api/files")
async def get_files():
    try:
        files = list(files_collection.find({}))
        # Convert ObjectId to string for JSON serialization
        for file in files:
            file["id"] = str(file["_id"])
            del file["_id"]
        return files
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching files: {str(e)}")

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        # Read file content to get size
        content = await file.read()
        file_size = len(content)
        
        file_data = {
            "original_name": file.filename,
            "filename": file.filename,
            "mime_type": file.content_type or "application/octet-stream",
            "size": file_size,
            "upload_date": datetime.utcnow().isoformat() + "Z",
            "starred": False
        }
        
        result = files_collection.insert_one(file_data)
        file_data["id"] = str(result.inserted_id)
        del file_data["_id"]
        
        return file_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@app.delete("/api/files/{file_id}")
async def delete_file(file_id: str):
    try:
        result = files_collection.delete_one({"_id": ObjectId(file_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="File not found")
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Delete failed: {str(e)}")

@app.patch("/api/files/{file_id}/star")
async def toggle_star(file_id: str):
    try:
        file = files_collection.find_one({"_id": ObjectId(file_id)})
        if not file:
            raise HTTPException(status_code=404, detail="File not found")
        
        new_star_status = not file.get("starred", False)
        files_collection.update_one(
            {"_id": ObjectId(file_id)},
            {"$set": {"starred": new_star_status}}
        )
        
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Star toggle failed: {str(e)}")

@app.get("/api/files/{filename}/download")
async def download_file(filename: str):
    # This would normally serve the actual file
    # For now, we'll return a success message
    return {"message": f"Download endpoint for {filename}"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port, reload=True)
