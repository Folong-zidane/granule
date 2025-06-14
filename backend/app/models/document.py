from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class DocumentBase(BaseModel):
    title: str
    content: str
    type: str = "markdown"  # markdown, html, text
    tags: List[str] = []

class DocumentCreate(DocumentBase):
    course_id: str

class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    type: Optional[str] = None
    tags: Optional[List[str]] = None

class Document(DocumentBase):
    id: str
    course_id: str
    author_id: str
    author_name: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    version: int = 1

class DocumentWithCourse(Document):
    course_title: str
    course_category: str

class FileUpload(BaseModel):
    filename: str
    content_type: str
    size: int
    url: str
    document_id: Optional[str] = None
    uploaded_at: datetime

class ParsedDocument(BaseModel):
    filename: str
    content: str
    format: str
    metadata: Dict[str, Any] = {}
    error: Optional[str] = None
