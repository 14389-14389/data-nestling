from datetime import datetime
from bson import ObjectId

class FileModel:
    def __init__(self, filename: str, original_name: str, size: int, mime_type: str, upload_date: datetime = None, _id: ObjectId = None):
        self._id = _id
        self.filename = filename
        self.original_name = original_name
        self.size = size
        self.mime_type = mime_type
        self.upload_date = upload_date or datetime.utcnow()

    def to_dict(self):
        return {
            "filename": self.filename,
            "original_name": self.original_name,
            "size": self.size,
            "mime_type": self.mime_type,
            "upload_date": self.upload_date
        }

    @classmethod
    def from_dict(cls, data):
        return cls(
            _id=data.get("_id"),
            filename=data["filename"],
            original_name=data["original_name"],
            size=data["size"],
            mime_type=data["mime_type"],
            upload_date=data.get("upload_date")
        )
