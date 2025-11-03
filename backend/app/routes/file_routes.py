import os
from fastapi import APIRouter, UploadFile, File, HTTPException, status
from fastapi.responses import FileResponse
from app.services.file_service import FileService
from app.schemas.file_schemas import FileResponse, FileListResponse
from typing import List

router = APIRouter()
file_service = FileService()

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload", response_model=FileResponse)
async def upload_file(file: UploadFile = File(...)):
    try:
        # Validate file size (10MB limit)
        contents = await file.read()
        if len(contents) > 10 * 1024 * 1024:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="File too large. Maximum size is 10MB."
            )

        # Generate unique filename
        import uuid
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)

        # Save file to disk
        with open(file_path, "wb") as f:
            f.write(contents)

        # Save file info to MongoDB
        file_id = await file_service.save_file_info(
            filename=unique_filename,
            original_name=file.filename,
            size=len(contents),
            mime_type=file.content_type
        )

        # Return file info
        file_info = await file_service.get_file_by_id(file_id)
        return FileResponse(
            id=file_id,
            filename=file_info.filename,
            original_name=file_info.original_name,
            size=file_info.size,
            mime_type=file_info.mime_type,
            upload_date=file_info.upload_date,
            url=f"/api/files/download/{unique_filename}"
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error uploading file: {str(e)}"
        )

@router.get("/", response_model=FileListResponse)
async def get_all_files():
    try:
        files = await file_service.get_all_files()
        file_responses = []
        for file in files:
            file_responses.append(FileResponse(
                id=str(file._id),
                filename=file.filename,
                original_name=file.original_name,
                size=file.size,
                mime_type=file.mime_type,
                upload_date=file.upload_date,
                url=f"/api/files/download/{file.filename}"
            ))
        
        return FileListResponse(files=file_responses, total=len(file_responses))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching files: {str(e)}"
        )

@router.get("/download/{filename}")
async def download_file(filename: str):
    try:
        file_path = os.path.join(UPLOAD_DIR, filename)
        if not os.path.exists(file_path):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="File not found"
            )

        file_info = await file_service.get_file_by_filename(filename)
        if not file_info:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="File metadata not found"
            )

        return FileResponse(
            path=file_path,
            filename=file_info.original_name,
            media_type=file_info.mime_type
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error downloading file: {str(e)}"
        )

@router.delete("/{file_id}")
async def delete_file(file_id: str):
    try:
        file_info = await file_service.get_file_by_id(file_id)
        if not file_info:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="File not found"
            )

        # Delete file from disk
        file_path = os.path.join(UPLOAD_DIR, file_info.filename)
        if os.path.exists(file_path):
            os.remove(file_path)

        # Delete file info from MongoDB
        success = await file_service.delete_file(file_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete file from database"
            )

        return {"message": "File deleted successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting file: {str(e)}"
        )
