from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class CourseBase(BaseModel):
    title: str
    description: str
    category: str
    difficulty: str = "beginner"  # beginner, intermediate, advanced
    is_public: bool = True
    access_code: Optional[str] = None

class CourseCreate(CourseBase):
    pass

class CourseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    difficulty: Optional[str] = None
    is_public: Optional[bool] = None
    access_code: Optional[str] = None

class Course(CourseBase):
    id: str
    teacher_id: str
    teacher_name: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    student_count: int = 0
    document_count: int = 0

class CourseWithProgress(Course):
    progress: Optional[float] = None
    is_enrolled: bool = False

class QCMQuestion(BaseModel):
    id: str
    question: str
    type: str  # single, multiple
    options: List[str]
    correct_answers: List[int]
    explanation: Optional[str] = None

class QCM(BaseModel):
    id: str
    title: str
    description: str
    questions: List[QCMQuestion]
    course_id: str
    created_at: datetime
