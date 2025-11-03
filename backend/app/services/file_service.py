import os
from bson import ObjectId
from datetime import datetime
from app.database import get_files_collection
from app.models.file_models import FileModel

class FileService:
    def __init__(self):
        self.collection = get_files_collection()

    async def save_file_info(self, filename: str, original_name: str, size: int, mime_type: str) -> str:
        file_model = FileModel(
            filename=filename,
            original_name=original_name,
            size=size,
            mime_type=mime_type
        )
        
        result = self.collection.insert_one(file_model.to_dict())
        return str(result.inserted_id)

    async def get_all_files(self):
        files = self.collection.find().sort("upload_date", -1)
        return [FileModel.from_dict(file) for file in files]

    async def get_file_by_id(self, file_id: str):
        file_data = self.collection.find_one({"_id": ObjectId(file_id)})
        if file_data:
            return FileModel.from_dict(file_data)
        return None

    async def delete_file(self, file_id: str) -> bool:
        result = self.collection.delete_one({"_id": ObjectId(file_id)})
        return result.deleted_count > 0

    async def get_file_by_filename(self, filename: str):
        file_data = self.collection.find_one({"filename": filename})
        if file_data:
            return FileModel.from_dict(file_data)
        return None
