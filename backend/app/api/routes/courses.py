from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
import uuid
from datetime import datetime

from app.core.database import get_db
from app.api.routes.auth import get_current_user
from app.models.course import Course, CourseCreate, CourseUpdate, CourseWithProgress

router = APIRouter()

@router.get("/test")
async def courses_test():
    return {"message": "Courses module loaded"}

@router.post("/", response_model=Course)
async def create_course(
    course: CourseCreate,
    current_user: dict = Depends(get_current_user),
    session = Depends(get_db)
):
    if current_user["role"] not in ["teacher", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only teachers can create courses"
        )
    
    course_id = str(uuid.uuid4())
    
    query = """
    CREATE (c:Course {
        id: $id,
        title: $title,
        description: $description,
        category: $category,
        difficulty: $difficulty,
        is_public: $is_public,
        access_code: $access_code,
        teacher_id: $teacher_id,
        created_at: datetime()
    })
    WITH c
    MATCH (u:User {id: $teacher_id})
    CREATE (u)-[:TEACHES]->(c)
    RETURN c.id as id, c.title as title, c.description as description,
           c.category as category, c.difficulty as difficulty,
           c.is_public as is_public, c.access_code as access_code,
           c.teacher_id as teacher_id, u.full_name as teacher_name,
           c.created_at as created_at
    """
    
    result = await session.run(query,
        id=course_id,
        title=course.title,
        description=course.description,
        category=course.category,
        difficulty=course.difficulty,
        is_public=course.is_public,
        access_code=course.access_code,
        teacher_id=current_user["id"]
    )
    
    record = await result.single()
    if not record:
        raise HTTPException(status_code=400, detail="Failed to create course")
    
    course_data = dict(record)
    course_data["student_count"] = 0
    course_data["document_count"] = 0
    
    return Course(**course_data)

@router.get("/", response_model=List[CourseWithProgress])
async def get_courses(
    category: Optional[str] = None,
    difficulty: Optional[str] = None,
    search: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
    session = Depends(get_db)
):
    query = """
    MATCH (c:Course)
    MATCH (t:User)-[:TEACHES]->(c)
    WHERE ($category IS NULL OR c.category = $category)
    AND ($difficulty IS NULL OR c.difficulty = $difficulty)
    AND ($search IS NULL OR c.title CONTAINS $search OR c.description CONTAINS $search)
    AND (c.is_public = true OR c.teacher_id = $user_id)
    OPTIONAL MATCH (s:User)-[:ENROLLED_IN]->(c)
    OPTIONAL MATCH (c)<-[:BELONGS_TO]-(d:Document)
    OPTIONAL MATCH (current:User {id: $user_id})-[:ENROLLED_IN]->(c)
    RETURN c.id as id, c.title as title, c.description as description,
           c.category as category, c.difficulty as difficulty,
           c.is_public as is_public, c.access_code as access_code,
           c.teacher_id as teacher_id, t.full_name as teacher_name,
           c.created_at as created_at, c.updated_at as updated_at,
           count(DISTINCT s) as student_count,
           count(DISTINCT d) as document_count,
           CASE WHEN current IS NOT NULL THEN true ELSE false END as is_enrolled
    ORDER BY c.created_at DESC
    """
    
    result = await session.run(query,
        category=category,
        difficulty=difficulty,
        search=search,
        user_id=current_user["id"]
    )
    
    courses = []
    async for record in result:
        course_data = dict(record)
        course_data["progress"] = None  # TODO: Calculate actual progress
        courses.append(CourseWithProgress(**course_data))
    
    return courses

@router.get("/{course_id}", response_model=Course)
async def get_course(
    course_id: str,
    current_user: dict = Depends(get_current_user),
    session = Depends(get_db)
):
    query = """
    MATCH (c:Course {id: $course_id})
    MATCH (t:User)-[:TEACHES]->(c)
    WHERE c.is_public = true OR c.teacher_id = $user_id
    OPTIONAL MATCH (s:User)-[:ENROLLED_IN]->(c)
    OPTIONAL MATCH (c)<-[:BELONGS_TO]-(d:Document)
    RETURN c.id as id, c.title as title, c.description as description,
           c.category as category, c.difficulty as difficulty,
           c.is_public as is_public, c.access_code as access_code,
           c.teacher_id as teacher_id, t.full_name as teacher_name,
           c.created_at as created_at, c.updated_at as updated_at,
           count(DISTINCT s) as student_count,
           count(DISTINCT d) as document_count
    """
    
    result = await session.run(query, course_id=course_id, user_id=current_user["id"])
    record = await result.single()
    
    if not record:
        raise HTTPException(status_code=404, detail="Course not found")
    
    return Course(**dict(record))

@router.post("/{course_id}/enroll")
async def enroll_in_course(
    course_id: str,
    access_code: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
    session = Depends(get_db)
):
    # Check if course exists and is accessible
    query = """
    MATCH (c:Course {id: $course_id})
    WHERE c.is_public = true OR ($access_code IS NOT NULL AND c.access_code = $access_code)
    RETURN c
    """
    
    result = await session.run(query, course_id=course_id, access_code=access_code)
    course = await result.single()
    
    if not course:
        raise HTTPException(status_code=404, detail="Course not found or invalid access code")
    
    # Check if already enrolled
    query = """
    MATCH (u:User {id: $user_id})-[r:ENROLLED_IN]->(c:Course {id: $course_id})
    RETURN r
    """
    
    result = await session.run(query, user_id=current_user["id"], course_id=course_id)
    existing = await result.single()
    
    if existing:
        raise HTTPException(status_code=400, detail="Already enrolled in this course")
    
    # Enroll user
    query = """
    MATCH (u:User {id: $user_id})
    MATCH (c:Course {id: $course_id})
    CREATE (u)-[:ENROLLED_IN {enrolled_at: datetime()}]->(c)
    RETURN true as success
    """
    
    await session.run(query, user_id=current_user["id"], course_id=course_id)
    
    return {"message": "Successfully enrolled in course"}

@router.delete("/{course_id}")
async def delete_course(
    course_id: str,
    current_user: dict = Depends(get_current_user),
    session = Depends(get_db)
):
    # Check if user owns the course
    query = """
    MATCH (c:Course {id: $course_id, teacher_id: $user_id})
    RETURN c
    """
    
    result = await session.run(query, course_id=course_id, user_id=current_user["id"])
    course = await result.single()
    
    if not course:
        raise HTTPException(status_code=404, detail="Course not found or not authorized")
    
    # Delete course and all relationships
    query = """
    MATCH (c:Course {id: $course_id})
    OPTIONAL MATCH (c)<-[:BELONGS_TO]-(d:Document)
    OPTIONAL MATCH (c)<-[:ENROLLED_IN]-(u:User)
    DETACH DELETE c, d
    """
    
    await session.run(query, course_id=course_id)
    
    return {"message": "Course deleted successfully"}
