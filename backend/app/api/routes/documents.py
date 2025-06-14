from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
import uuid

from app.core.database import get_db
from app.api.routes.auth import get_current_user
from app.models.document import Document, DocumentCreate, DocumentUpdate, DocumentWithCourse

router = APIRouter()

@router.post("/", response_model=Document)
async def create_document(
    document: DocumentCreate,
    current_user: dict = Depends(get_current_user),
    session = Depends(get_db)
):
    # Check if user has access to the course
    query = """
    MATCH (c:Course {id: $course_id})
    WHERE c.teacher_id = $user_id OR c.is_public = true
    RETURN c
    """
    
    result = await session.run(query, course_id=document.course_id, user_id=current_user["id"])
    course = await result.single()
    
    if not course:
        raise HTTPException(status_code=404, detail="Course not found or not authorized")
    
    document_id = str(uuid.uuid4())
    
    query = """
    CREATE (d:Document {
        id: $id,
        title: $title,
        content: $content,
        type: $type,
        tags: $tags,
        course_id: $course_id,
        author_id: $author_id,
        created_at: datetime(),
        version: 1
    })
    WITH d
    MATCH (c:Course {id: $course_id})
    MATCH (u:User {id: $author_id})
    CREATE (d)-[:BELONGS_TO]->(c)
    CREATE (u)-[:AUTHORED]->(d)
    RETURN d.id as id, d.title as title, d.content as content,
           d.type as type, d.tags as tags, d.course_id as course_id,
           d.author_id as author_id, u.full_name as author_name,
           d.created_at as created_at, d.version as version
    """
    
    result = await session.run(query,
        id=document_id,
        title=document.title,
        content=document.content,
        type=document.type,
        tags=document.tags,
        course_id=document.course_id,
        author_id=current_user["id"]
    )
    
    record = await result.single()
    if not record:
        raise HTTPException(status_code=400, detail="Failed to create document")
    
    return Document(**dict(record))

@router.get("/", response_model=List[DocumentWithCourse])
async def get_documents(
    course_id: Optional[str] = None,
    search: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
    session = Depends(get_db)
):
    query = """
    MATCH (d:Document)-[:BELONGS_TO]->(c:Course)
    MATCH (u:User)-[:AUTHORED]->(d)
    WHERE ($course_id IS NULL OR c.id = $course_id)
    AND ($search IS NULL OR d.title CONTAINS $search OR d.content CONTAINS $search)
    AND (c.is_public = true OR c.teacher_id = $user_id OR EXISTS((current:User {id: $user_id})-[:ENROLLED_IN]->(c)))
    RETURN d.id as id, d.title as title, d.content as content,
           d.type as type, d.tags as tags, d.course_id as course_id,
           d.author_id as author_id, u.full_name as author_name,
           d.created_at as created_at, d.updated_at as updated_at,
           d.version as version, c.title as course_title,
           c.category as course_category
    ORDER BY d.created_at DESC
    """
    
    result = await session.run(query,
        course_id=course_id,
        search=search,
        user_id=current_user["id"]
    )
    
    documents = []
    async for record in result:
        documents.append(DocumentWithCourse(**dict(record)))
    
    return documents

@router.get("/{document_id}", response_model=Document)
async def get_document(
    document_id: str,
    current_user: dict = Depends(get_current_user),
    session = Depends(get_db)
):
    query = """
    MATCH (d:Document {id: $document_id})-[:BELONGS_TO]->(c:Course)
    MATCH (u:User)-[:AUTHORED]->(d)
    WHERE c.is_public = true OR c.teacher_id = $user_id OR EXISTS((current:User {id: $user_id})-[:ENROLLED_IN]->(c))
    RETURN d.id as id, d.title as title, d.content as content,
           d.type as type, d.tags as tags, d.course_id as course_id,
           d.author_id as author_id, u.full_name as author_name,
           d.created_at as created_at, d.updated_at as updated_at,
           d.version as version
    """
    
    result = await session.run(query, document_id=document_id, user_id=current_user["id"])
    record = await result.single()
    
    if not record:
        raise HTTPException(status_code=404, detail="Document not found")
    
    return Document(**dict(record))

@router.put("/{document_id}", response_model=Document)
async def update_document(
    document_id: str,
    document_update: DocumentUpdate,
    current_user: dict = Depends(get_current_user),
    session = Depends(get_db)
):
    # Check if user can edit the document
    query = """
    MATCH (d:Document {id: $document_id})-[:BELONGS_TO]->(c:Course)
    WHERE d.author_id = $user_id OR c.teacher_id = $user_id
    RETURN d, c
    """
    
    result = await session.run(query, document_id=document_id, user_id=current_user["id"])
    record = await result.single()
    
    if not record:
        raise HTTPException(status_code=404, detail="Document not found or not authorized")
    
    # Build update query
    update_fields = []
    params = {"document_id": document_id, "user_id": current_user["id"]}
    
    if document_update.title is not None:
        update_fields.append("d.title = $title")
        params["title"] = document_update.title
    
    if document_update.content is not None:
        update_fields.append("d.content = $content")
        params["content"] = document_update.content
    
    if document_update.type is not None:
        update_fields.append("d.type = $type")
        params["type"] = document_update.type
    
    if document_update.tags is not None:
        update_fields.append("d.tags = $tags")
        params["tags"] = document_update.tags
    
    if not update_fields:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    update_fields.append("d.updated_at = datetime()")
    update_fields.append("d.version = d.version + 1")
    
    query = f"""
    MATCH (d:Document {{id: $document_id}})
    MATCH (u:User)-[:AUTHORED]->(d)
    SET {', '.join(update_fields)}
    RETURN d.id as id, d.title as title, d.content as content,
           d.type as type, d.tags as tags, d.course_id as course_id,
           d.author_id as author_id, u.full_name as author_name,
           d.created_at as created_at, d.updated_at as updated_at,
           d.version as version
    """
    
    result = await session.run(query, **params)
    record = await result.single()
    
    return Document(**dict(record))

@router.delete("/{document_id}")
async def delete_document(
    document_id: str,
    current_user: dict = Depends(get_current_user),
    session = Depends(get_db)
):
    # Check if user can delete the document
    query = """
    MATCH (d:Document {id: $document_id})-[:BELONGS_TO]->(c:Course)
    WHERE d.author_id = $user_id OR c.teacher_id = $user_id
    RETURN d
    """
    
    result = await session.run(query, document_id=document_id, user_id=current_user["id"])
    document = await result.single()
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found or not authorized")
    
    # Delete document
    query = """
    MATCH (d:Document {id: $document_id})
    DETACH DELETE d
    """
    
    await session.run(query, document_id=document_id)
    
    return {"message": "Document deleted successfully"}
