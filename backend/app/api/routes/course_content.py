from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any, Optional
import uuid
from datetime import datetime

from app.core.database import get_db
from app.api.routes.auth import get_current_user

router = APIRouter()

@router.post("/{course_id}/content/blocks")
async def add_content_block(
    course_id: str,
    block_data: Dict[str, Any],
    current_user: dict = Depends(get_current_user),
    session = Depends(get_db)
):
    """Ajouter un bloc de contenu à un cours"""
    
    # Vérifier que l'utilisateur peut modifier ce cours
    check_query = """
    MATCH (c:Course {id: $course_id})
    WHERE c.teacher_id = $user_id OR $user_role = 'admin'
    RETURN c
    """
    
    result = await session.run(check_query, 
        course_id=course_id, 
        user_id=current_user["id"],
        user_role=current_user.get("role", "student")
    )
    course = await result.single()
    
    if not course:
        raise HTTPException(status_code=404, detail="Course not found or not authorized")
    
    # Générer un ID pour le bloc
    block_id = str(uuid.uuid4())
    
    # Obtenir la position suivante
    position_query = """
    MATCH (c:Course {id: $course_id})-[:HAS_BLOCK]->(b:ContentBlock)
    RETURN COALESCE(MAX(b.position), -1) + 1 as next_position
    """
    
    pos_result = await session.run(position_query, course_id=course_id)
    pos_record = await pos_result.single()
    next_position = pos_record["next_position"] if pos_record else 0
    
    # Créer le bloc
    create_query = """
    MATCH (c:Course {id: $course_id})
    CREATE (b:ContentBlock {
        id: $block_id,
        type: $type,
        content: $content,
        position: $position,
        created_at: datetime(),
        updated_at: datetime()
    })
    CREATE (c)-[:HAS_BLOCK]->(b)
    RETURN b.id as id, b.type as type, b.content as content, 
           b.position as position, b.created_at as created_at
    """
    
    result = await session.run(create_query,
        course_id=course_id,
        block_id=block_id,
        type=block_data.get("type", "text"),
        content=block_data.get("content", ""),
        position=next_position
    )
    
    record = await result.single()
    if not record:
        raise HTTPException(status_code=400, detail="Failed to create block")
    
    return dict(record)

@router.put("/{course_id}/content/blocks/{block_id}")
async def update_content_block(
    course_id: str,
    block_id: str,
    block_data: Dict[str, Any],
    current_user: dict = Depends(get_current_user),
    session = Depends(get_db)
):
    """Modifier un bloc de contenu"""
    
    # Vérifier les permissions
    check_query = """
    MATCH (c:Course {id: $course_id})-[:HAS_BLOCK]->(b:ContentBlock {id: $block_id})
    WHERE c.teacher_id = $user_id OR $user_role = 'admin'
    RETURN b
    """
    
    result = await session.run(check_query,
        course_id=course_id,
        block_id=block_id,
        user_id=current_user["id"],
        user_role=current_user.get("role", "student")
    )
    block = await result.single()
    
    if not block:
        raise HTTPException(status_code=404, detail="Block not found or not authorized")
    
    # Mettre à jour le bloc
    update_query = """
    MATCH (b:ContentBlock {id: $block_id})
    SET b.content = $content,
        b.updated_at = datetime()
    RETURN b.id as id, b.type as type, b.content as content,
           b.position as position, b.updated_at as updated_at
    """
    
    result = await session.run(update_query,
        block_id=block_id,
        content=block_data.get("content", "")
    )
    
    record = await result.single()
    return dict(record)

@router.delete("/{course_id}/content/blocks/{block_id}")
async def delete_content_block(
    course_id: str,
    block_id: str,
    current_user: dict = Depends(get_current_user),
    session = Depends(get_db)
):
    """Supprimer un bloc de contenu"""
    
    # Vérifier les permissions et supprimer
    delete_query = """
    MATCH (c:Course {id: $course_id})-[:HAS_BLOCK]->(b:ContentBlock {id: $block_id})
    WHERE c.teacher_id = $user_id OR $user_role = 'admin'
    DETACH DELETE b
    RETURN count(b) as deleted_count
    """
    
    result = await session.run(delete_query,
        course_id=course_id,
        block_id=block_id,
        user_id=current_user["id"],
        user_role=current_user.get("role", "student")
    )
    
    record = await result.single()
    if not record or record["deleted_count"] == 0:
        raise HTTPException(status_code=404, detail="Block not found or not authorized")
    
    return {"message": "Block deleted successfully"}

@router.post("/{course_id}/content/reorder")
async def reorder_content_blocks(
    course_id: str,
    reorder_data: Dict[str, Any],
    current_user: dict = Depends(get_current_user),
    session = Depends(get_db)
):
    """Réorganiser les blocs de contenu"""
    
    block_orders = reorder_data.get("blocks", [])  # [{"id": "block1", "position": 0}, ...]
    
    # Vérifier les permissions
    check_query = """
    MATCH (c:Course {id: $course_id})
    WHERE c.teacher_id = $user_id OR $user_role = 'admin'
    RETURN c
    """
    
    result = await session.run(check_query,
        course_id=course_id,
        user_id=current_user["id"],
        user_role=current_user.get("role", "student")
    )
    course = await result.single()
    
    if not course:
        raise HTTPException(status_code=404, detail="Course not found or not authorized")
    
    # Mettre à jour les positions
    for block_order in block_orders:
        update_query = """
        MATCH (c:Course {id: $course_id})-[:HAS_BLOCK]->(b:ContentBlock {id: $block_id})
        SET b.position = $position, b.updated_at = datetime()
        RETURN b.id as id
        """
        
        await session.run(update_query,
            course_id=course_id,
            block_id=block_order["id"],
            position=block_order["position"]
        )
    
    return {"message": "Blocks reordered successfully"}

@router.get("/{course_id}/content/blocks")
async def get_course_content_blocks(
    course_id: str,
    current_user: dict = Depends(get_current_user),
    session = Depends(get_db)
):
    """Récupérer tous les blocs de contenu d'un cours"""
    
    query = """
    MATCH (c:Course {id: $course_id})-[:HAS_BLOCK]->(b:ContentBlock)
    WHERE c.is_public = true OR c.teacher_id = $user_id OR 
          EXISTS((u:User {id: $user_id})-[:ENROLLED_IN]->(c))
    RETURN b.id as id, b.type as type, b.content as content,
           b.position as position, b.created_at as created_at,
           b.updated_at as updated_at
    ORDER BY b.position ASC
    """
    
    result = await session.run(query,
        course_id=course_id,
        user_id=current_user["id"]
    )
    
    blocks = []
    async for record in result:
        blocks.append(dict(record))
    
    return {"blocks": blocks}
