from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any, Optional
import uuid
from datetime import datetime

from app.core.database import get_db
from app.api.routes.auth import get_current_user

router = APIRouter()

@router.get("/")
async def get_templates(
    category: Optional[str] = None,
    search: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
    session = Depends(get_db)
):
    """Récupérer la liste des templates"""
    
    query = """
    MATCH (t:Template)
    WHERE ($category IS NULL OR t.category = $category)
    AND ($search IS NULL OR t.title CONTAINS $search OR t.description CONTAINS $search)
    AND (t.is_public = true OR t.created_by = $user_id)
    RETURN t.id as id, t.title as title, t.description as description,
           t.category as category, t.difficulty as difficulty,
           t.is_public as is_public, t.created_at as created_at,
           t.usage_count as usage_count
    ORDER BY t.usage_count DESC, t.created_at DESC
    """
    
    result = await session.run(query,
        category=category,
        search=search,
        user_id=current_user["id"]
    )
    
    templates = []
    async for record in result:
        template_data = dict(record)
        template_data["usage_count"] = template_data.get("usage_count", 0)
        templates.append(template_data)
    
    return {"templates": templates}

@router.get("/{template_id}")
async def get_template(
    template_id: str,
    current_user: dict = Depends(get_current_user),
    session = Depends(get_db)
):
    """Récupérer un template spécifique avec son contenu"""
    
    # Récupérer le template
    template_query = """
    MATCH (t:Template {id: $template_id})
    WHERE t.is_public = true OR t.created_by = $user_id
    RETURN t.id as id, t.title as title, t.description as description,
           t.category as category, t.difficulty as difficulty,
           t.content as content, t.created_at as created_at
    """
    
    result = await session.run(template_query,
        template_id=template_id,
        user_id=current_user["id"]
    )
    
    template = await result.single()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    # Récupérer les blocs du template
    blocks_query = """
    MATCH (t:Template {id: $template_id})-[:HAS_TEMPLATE_BLOCK]->(b:TemplateBlock)
    RETURN b.id as id, b.type as type, b.content as content,
           b.position as position
    ORDER BY b.position ASC
    """
    
    blocks_result = await session.run(blocks_query, template_id=template_id)
    blocks = []
    async for record in blocks_result:
        blocks.append(dict(record))
    
    template_data = dict(template)
    template_data["blocks"] = blocks
    
    return template_data

@router.post("/from-template/{template_id}")
async def create_course_from_template(
    template_id: str,
    course_data: Dict[str, Any],
    current_user: dict = Depends(get_current_user),
    session = Depends(get_db)
):
    """Créer un cours à partir d'un template"""
    
    if current_user["role"] not in ["teacher", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only teachers can create courses"
        )
    
    # Vérifier que le template existe
    template_query = """
    MATCH (t:Template {id: $template_id})
    WHERE t.is_public = true OR t.created_by = $user_id
    RETURN t
    """
    
    result = await session.run(template_query,
        template_id=template_id,
        user_id=current_user["id"]
    )
    
    template = await result.single()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    # Créer le cours
    course_id = str(uuid.uuid4())
    
    create_course_query = """
    MATCH (t:Template {id: $template_id})
    CREATE (c:Course {
        id: $course_id,
        title: $title,
        description: $description,
        category: COALESCE($category, t.category),
        difficulty: COALESCE($difficulty, t.difficulty),
        is_public: $is_public,
        access_code: $access_code,
        teacher_id: $teacher_id,
        created_from_template: $template_id,
        created_at: datetime()
    })
    WITH c, t
    MATCH (u:User {id: $teacher_id})
    CREATE (u)-[:TEACHES]->(c)
    
    // Copier les blocs du template
    WITH c, t
    MATCH (t)-[:HAS_TEMPLATE_BLOCK]->(tb:TemplateBlock)
    CREATE (c)-[:HAS_BLOCK]->(b:ContentBlock {
        id: randomUUID(),
        type: tb.type,
        content: tb.content,
        position: tb.position,
        created_at: datetime(),
        updated_at: datetime()
    })
    
    // Incrémenter le compteur d'usage du template
    SET t.usage_count = COALESCE(t.usage_count, 0) + 1
    
    RETURN c.id as id, c.title as title, c.description as description,
           c.category as category, c.difficulty as difficulty,
           c.is_public as is_public, c.teacher_id as teacher_id,
           c.created_at as created_at
    """
    
    result = await session.run(create_course_query,
        template_id=template_id,
        course_id=course_id,
        title=course_data.get("title", "Nouveau cours"),
        description=course_data.get("description", ""),
        category=course_data.get("category"),
        difficulty=course_data.get("difficulty"),
        is_public=course_data.get("is_public", True),
        access_code=course_data.get("access_code"),
        teacher_id=current_user["id"]
    )
    
    record = await result.single()
    if not record:
        raise HTTPException(status_code=400, detail="Failed to create course from template")
    
    course_data = dict(record)
    course_data["student_count"] = 0
    course_data["document_count"] = 0
    
    return course_data

@router.post("/")
async def create_template(
    template_data: Dict[str, Any],
    current_user: dict = Depends(get_current_user),
    session = Depends(get_db)
):
    """Créer un nouveau template"""
    
    if current_user["role"] not in ["teacher", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only teachers can create templates"
        )
    
    template_id = str(uuid.uuid4())
    
    create_query = """
    CREATE (t:Template {
        id: $template_id,
        title: $title,
        description: $description,
        category: $category,
        difficulty: $difficulty,
        is_public: $is_public,
        created_by: $user_id,
        usage_count: 0,
        created_at: datetime()
    })
    RETURN t.id as id, t.title as title, t.description as description,
           t.category as category, t.difficulty as difficulty,
           t.is_public as is_public, t.created_at as created_at
    """
    
    result = await session.run(create_query,
        template_id=template_id,
        title=template_data.get("title", "Nouveau template"),
        description=template_data.get("description", ""),
        category=template_data.get("category", "Général"),
        difficulty=template_data.get("difficulty", "beginner"),
        is_public=template_data.get("is_public", False),
        user_id=current_user["id"]
    )
    
    record = await result.single()
    return dict(record)
