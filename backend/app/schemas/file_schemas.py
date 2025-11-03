from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class FileBase(BaseModel):
    filename: str
    original_name: str
    size: int
    mime_type: str

class FileCreate(FileBase):
    pass

class FileResponse(FileBase):
    id: str
    upload_date: datetime
    url: str
    
    class Config:
        from_attributes = True

class FileListResponse(BaseModel):
    files: list[FileResponse]
    total: int
