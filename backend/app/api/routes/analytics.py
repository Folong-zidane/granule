from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta

from app.core.database import get_db
from app.api.routes.auth import get_current_user

router = APIRouter()

@router.get("/{course_id}/analytics")
async def get_course_analytics(
    course_id: str,
    period: Optional[str] = "30d",  # 7d, 30d, 90d, all
    current_user: dict = Depends(get_current_user),
    session = Depends(get_db)
):
    """Récupérer les statistiques d'un cours"""
    
    # Vérifier les permissions (seul le professeur peut voir les analytics)
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
    
    # Calculer la date de début selon la période
    now = datetime.now()
    if period == "7d":
        start_date = now - timedelta(days=7)
    elif period == "30d":
        start_date = now - timedelta(days=30)
    elif period == "90d":
        start_date = now - timedelta(days=90)
    else:
        start_date = datetime(2020, 1, 1)  # Toutes les données
    
    # Statistiques générales
    general_stats_query = """
    MATCH (c:Course {id: $course_id})
    OPTIONAL MATCH (c)<-[:ENROLLED_IN]-(s:User)
    OPTIONAL MATCH (c)-[:HAS_BLOCK]->(b:ContentBlock)
    OPTIONAL MATCH (c)-[:HAS_QCM]->(q:QCM)
    RETURN count(DISTINCT s) as total_students,
           count(DISTINCT b) as total_blocks,
           count(DISTINCT q) as total_qcms
    """
    
    general_result = await session.run(general_stats_query, course_id=course_id)
    general_stats = await general_result.single()
    
    # Activité des étudiants
    activity_query = """
    MATCH (c:Course {id: $course_id})<-[:ENROLLED_IN]-(s:User)
    OPTIONAL MATCH (s)-[:ATTEMPTED]->(a:QCMAttempt)-[:FOR_QCM]->(q:QCM)<-[:HAS_QCM]-(c)
    WHERE a.completed_at >= datetime($start_date)
    RETURN s.id as student_id, s.full_name as student_name,
           count(a) as qcm_attempts,
           avg(a.score) as avg_score,
           max(a.completed_at) as last_activity
    ORDER BY last_activity DESC
    """
    
    activity_result = await session.run(activity_query,
        course_id=course_id,
        start_date=start_date.isoformat()
    )
    
    student_activity = []
    async for record in activity_result:
        activity_data = dict(record)
        activity_data["avg_score"] = round(activity_data["avg_score"] or 0, 2)
        student_activity.append(activity_data)
    
    # Performance des QCM
    qcm_performance_query = """
    MATCH (c:Course {id: $course_id})-[:HAS_QCM]->(q:QCM)
    OPTIONAL MATCH (q)<-[:FOR_QCM]-(a:QCMAttempt)
    WHERE a.completed_at >= datetime($start_date)
    RETURN q.id as qcm_id, q.title as qcm_title,
           count(a) as total_attempts,
           avg(a.score) as avg_score,
           min(a.score) as min_score,
           max(a.score) as max_score
    ORDER BY total_attempts DESC
    """
    
    qcm_result = await session.run(qcm_performance_query,
        course_id=course_id,
        start_date=start_date.isoformat()
    )
    
    qcm_performance = []
    async for record in qcm_result:
        perf_data = dict(record)
        perf_data["avg_score"] = round(perf_data["avg_score"] or 0, 2)
        perf_data["min_score"] = perf_data["min_score"] or 0
        perf_data["max_score"] = perf_data["max_score"] or 0
        qcm_performance.append(perf_data)
    
    # Évolution dans le temps
    timeline_query = """
    MATCH (c:Course {id: $course_id})<-[:HAS_QCM]-(q:QCM)<-[:FOR_QCM]-(a:QCMAttempt)
    WHERE a.completed_at >= datetime($start_date)
    WITH date(a.completed_at) as attempt_date, count(a) as attempts, avg(a.score) as avg_score
    RETURN attempt_date, attempts, avg_score
    ORDER BY attempt_date ASC
    """
    
    timeline_result = await session.run(timeline_query,
        course_id=course_id,
        start_date=start_date.isoformat()
    )
    
    timeline_data = []
    async for record in timeline_result:
        timeline_item = dict(record)
        timeline_item["avg_score"] = round(timeline_item["avg_score"] or 0, 2)
        timeline_data.append(timeline_item)
    
    return {
        "general_stats": dict(general_stats),
        "student_activity": student_activity,
        "qcm_performance": qcm_performance,
        "timeline": timeline_data,
        "period": period,
        "generated_at": datetime.now().isoformat()
    }

@router.get("/{course_id}/students")
async def get_course_students(
    course_id: str,
    current_user: dict = Depends(get_current_user),
    session = Depends(get_db)
):
    """Récupérer la liste des étudiants d'un cours"""
    
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
    
    # Récupérer les étudiants avec leurs statistiques
    students_query = """
    MATCH (c:Course {id: $course_id})<-[e:ENROLLED_IN]-(s:User)
    OPTIONAL MATCH (s)-[:ATTEMPTED]->(a:QCMAttempt)-[:FOR_QCM]->(q:QCM)<-[:HAS_QCM]-(c)
    RETURN s.id as id, s.full_name as full_name, s.email as email,
           e.enrolled_at as enrolled_at,
           count(a) as total_attempts,
           avg(a.score) as avg_score,
           max(a.completed_at) as last_activity
    ORDER BY e.enrolled_at DESC
    """
    
    result = await session.run(students_query, course_id=course_id)
    
    students = []
    async for record in result:
        student_data = dict(record)
        student_data["avg_score"] = round(student_data["avg_score"] or 0, 2)
        students.append(student_data)
    
    return {"students": students}

@router.post("/{course_id}/generate-access-code")
async def generate_new_access_code(
    course_id: str,
    current_user: dict = Depends(get_current_user),
    session = Depends(get_db)
):
    """Générer un nouveau code d'accès pour le cours"""
    
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
    
    # Générer un nouveau code d'accès
    import random
    import string
    
    new_code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
    
    # Mettre à jour le cours
    update_query = """
    MATCH (c:Course {id: $course_id})
    SET c.access_code = $access_code, c.updated_at = datetime()
    RETURN c.access_code as access_code
    """
    
    result = await session.run(update_query,
        course_id=course_id,
        access_code=new_code
    )
    
    record = await result.single()
    
    return {"access_code": record["access_code"]}
