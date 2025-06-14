from fastapi import APIRouter, Depends, HTTPException
from typing import List

from app.core.database import get_db
from app.api.routes.auth import get_current_user
from app.models.user import User, UserUpdate

router = APIRouter()

@router.get("/test")
async def users_test():
    return {"message": "Users module loaded"}

@router.get("/", response_model=List[User])
async def get_users(
    current_user: dict = Depends(get_current_user),
    session = Depends(get_db)
):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    query = """
    MATCH (u:User)
    RETURN u.id as id, u.email as email, u.full_name as full_name,
           u.role as role, u.is_active as is_active,
           u.created_at as created_at, u.updated_at as updated_at
    ORDER BY u.created_at DESC
    """
    
    result = await session.run(query)
    users = []
    async for record in result:
        users.append(User(**dict(record)))
    
    return users

@router.get("/{user_id}", response_model=User)
async def get_user(
    user_id: str,
    current_user: dict = Depends(get_current_user),
    session = Depends(get_db)
):
    if current_user["role"] != "admin" and current_user["id"] != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    query = """
    MATCH (u:User {id: $user_id})
    RETURN u.id as id, u.email as email, u.full_name as full_name,
           u.role as role, u.is_active as is_active,
           u.created_at as created_at, u.updated_at as updated_at
    """
    
    result = await session.run(query, user_id=user_id)
    record = await result.single()
    
    if not record:
        raise HTTPException(status_code=404, detail="User not found")
    
    return User(**dict(record))

@router.put("/{user_id}", response_model=User)
async def update_user(
    user_id: str,
    user_update: UserUpdate,
    current_user: dict = Depends(get_current_user),
    session = Depends(get_db)
):
    if current_user["role"] != "admin" and current_user["id"] != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Build update query
    update_fields = []
    params = {"user_id": user_id}
    
    if user_update.full_name is not None:
        update_fields.append("u.full_name = $full_name")
        params["full_name"] = user_update.full_name
    
    if user_update.role is not None and current_user["role"] == "admin":
        update_fields.append("u.role = $role")
        params["role"] = user_update.role
    
    if not update_fields:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    update_fields.append("u.updated_at = datetime()")
    
    query = f"""
    MATCH (u:User {{id: $user_id}})
    SET {', '.join(update_fields)}
    RETURN u.id as id, u.email as email, u.full_name as full_name,
           u.role as role, u.is_active as is_active,
           u.created_at as created_at, u.updated_at as updated_at
    """
    
    result = await session.run(query, **params)
    record = await result.single()
    
    if not record:
        raise HTTPException(status_code=404, detail="User not found")
    
    return User(**dict(record))
