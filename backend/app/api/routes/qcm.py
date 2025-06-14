from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any, Optional
import uuid
from datetime import datetime

from app.core.database import get_db
from app.api.routes.auth import get_current_user

router = APIRouter()

@router.post("/{course_id}/qcm")
async def create_qcm(
    course_id: str,
    qcm_data: Dict[str, Any],
    current_user: dict = Depends(get_current_user),
    session = Depends(get_db)
):
    """Créer un QCM pour un cours"""
    
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
    
    qcm_id = str(uuid.uuid4())
    
    # Créer le QCM
    create_qcm_query = """
    MATCH (c:Course {id: $course_id})
    CREATE (q:QCM {
        id: $qcm_id,
        title: $title,
        description: $description,
        time_limit: $time_limit,
        attempts_allowed: $attempts_allowed,
        is_active: $is_active,
        created_at: datetime()
    })
    CREATE (c)-[:HAS_QCM]->(q)
    RETURN q.id as id, q.title as title, q.description as description,
           q.time_limit as time_limit, q.attempts_allowed as attempts_allowed,
           q.is_active as is_active, q.created_at as created_at
    """
    
    result = await session.run(create_qcm_query,
        course_id=course_id,
        qcm_id=qcm_id,
        title=qcm_data.get("title", "Nouveau QCM"),
        description=qcm_data.get("description", ""),
        time_limit=qcm_data.get("time_limit", 30),  # minutes
        attempts_allowed=qcm_data.get("attempts_allowed", 3),
        is_active=qcm_data.get("is_active", True)
    )
    
    qcm_record = await result.single()
    
    # Créer les questions
    questions = qcm_data.get("questions", [])
    created_questions = []
    
    for i, question_data in enumerate(questions):
        question_id = str(uuid.uuid4())
        
        create_question_query = """
        MATCH (q:QCM {id: $qcm_id})
        CREATE (quest:Question {
            id: $question_id,
            question: $question,
            type: $type,
            options: $options,
            correct_answers: $correct_answers,
            explanation: $explanation,
            position: $position,
            points: $points
        })
        CREATE (q)-[:HAS_QUESTION]->(quest)
        RETURN quest.id as id, quest.question as question, quest.type as type,
               quest.options as options, quest.correct_answers as correct_answers,
               quest.explanation as explanation, quest.position as position,
               quest.points as points
        """
        
        question_result = await session.run(create_question_query,
            qcm_id=qcm_id,
            question_id=question_id,
            question=question_data.get("question", ""),
            type=question_data.get("type", "single"),  # single, multiple
            options=question_data.get("options", []),
            correct_answers=question_data.get("correct_answers", []),
            explanation=question_data.get("explanation", ""),
            position=i,
            points=question_data.get("points", 1)
        )
        
        question_record = await question_result.single()
        created_questions.append(dict(question_record))
    
    qcm_result = dict(qcm_record)
    qcm_result["questions"] = created_questions
    
    return qcm_result

@router.get("/{course_id}/qcm")
async def get_course_qcms(
    course_id: str,
    current_user: dict = Depends(get_current_user),
    session = Depends(get_db)
):
    """Récupérer tous les QCM d'un cours"""
    
    query = """
    MATCH (c:Course {id: $course_id})-[:HAS_QCM]->(q:QCM)
    WHERE c.is_public = true OR c.teacher_id = $user_id OR 
          EXISTS((u:User {id: $user_id})-[:ENROLLED_IN]->(c))
    OPTIONAL MATCH (q)-[:HAS_QUESTION]->(quest:Question)
    RETURN q.id as id, q.title as title, q.description as description,
           q.time_limit as time_limit, q.attempts_allowed as attempts_allowed,
           q.is_active as is_active, q.created_at as created_at,
           count(quest) as question_count
    ORDER BY q.created_at DESC
    """
    
    result = await session.run(query,
        course_id=course_id,
        user_id=current_user["id"]
    )
    
    qcms = []
    async for record in result:
        qcms.append(dict(record))
    
    return {"qcms": qcms}

@router.get("/{course_id}/qcm/{qcm_id}")
async def get_qcm_details(
    course_id: str,
    qcm_id: str,
    current_user: dict = Depends(get_current_user),
    session = Depends(get_db)
):
    """Récupérer les détails d'un QCM avec ses questions"""
    
    # Récupérer le QCM
    qcm_query = """
    MATCH (c:Course {id: $course_id})-[:HAS_QCM]->(q:QCM {id: $qcm_id})
    WHERE c.is_public = true OR c.teacher_id = $user_id OR 
          EXISTS((u:User {id: $user_id})-[:ENROLLED_IN]->(c))
    RETURN q.id as id, q.title as title, q.description as description,
           q.time_limit as time_limit, q.attempts_allowed as attempts_allowed,
           q.is_active as is_active, q.created_at as created_at
    """
    
    result = await session.run(qcm_query,
        course_id=course_id,
        qcm_id=qcm_id,
        user_id=current_user["id"]
    )
    
    qcm = await result.single()
    if not qcm:
        raise HTTPException(status_code=404, detail="QCM not found")
    
    # Récupérer les questions
    questions_query = """
    MATCH (q:QCM {id: $qcm_id})-[:HAS_QUESTION]->(quest:Question)
    RETURN quest.id as id, quest.question as question, quest.type as type,
           quest.options as options, quest.correct_answers as correct_answers,
           quest.explanation as explanation, quest.position as position,
           quest.points as points
    ORDER BY quest.position ASC
    """
    
    questions_result = await session.run(questions_query, qcm_id=qcm_id)
    questions = []
    async for record in questions_result:
        questions.append(dict(record))
    
    qcm_data = dict(qcm)
    qcm_data["questions"] = questions
    
    return qcm_data

@router.post("/{course_id}/qcm/{qcm_id}/submit")
async def submit_qcm_attempt(
    course_id: str,
    qcm_id: str,
    submission_data: Dict[str, Any],
    current_user: dict = Depends(get_current_user),
    session = Depends(get_db)
):
    """Soumettre une tentative de QCM"""
    
    # Vérifier que l'utilisateur peut accéder au QCM
    check_query = """
    MATCH (c:Course {id: $course_id})-[:HAS_QCM]->(q:QCM {id: $qcm_id})
    WHERE c.is_public = true OR EXISTS((u:User {id: $user_id})-[:ENROLLED_IN]->(c))
    RETURN q, c.teacher_id = $user_id as is_teacher
    """
    
    result = await session.run(check_query,
        course_id=course_id,
        qcm_id=qcm_id,
        user_id=current_user["id"]
    )
    
    access_check = await result.single()
    if not access_check:
        raise HTTPException(status_code=404, detail="QCM not found or not accessible")
    
    # Calculer le score
    answers = submission_data.get("answers", {})  # {question_id: [selected_options]}
    
    score_query = """
    MATCH (q:QCM {id: $qcm_id})-[:HAS_QUESTION]->(quest:Question)
    RETURN quest.id as question_id, quest.correct_answers as correct_answers,
           quest.points as points
    """
    
    questions_result = await session.run(score_query, qcm_id=qcm_id)
    
    total_points = 0
    earned_points = 0
    
    async for record in questions_result:
        question_id = record["question_id"]
        correct_answers = record["correct_answers"]
        points = record["points"]
        
        total_points += points
        
        user_answers = answers.get(question_id, [])
        if set(user_answers) == set(correct_answers):
            earned_points += points
    
    score_percentage = (earned_points / total_points * 100) if total_points > 0 else 0
    
    # Enregistrer la tentative
    attempt_id = str(uuid.uuid4())
    
    save_attempt_query = """
    MATCH (u:User {id: $user_id})
    MATCH (q:QCM {id: $qcm_id})
    CREATE (a:QCMAttempt {
        id: $attempt_id,
        answers: $answers,
        score: $score,
        total_points: $total_points,
        earned_points: $earned_points,
        completed_at: datetime()
    })
    CREATE (u)-[:ATTEMPTED]->(a)-[:FOR_QCM]->(q)
    RETURN a.id as id, a.score as score, a.earned_points as earned_points,
           a.total_points as total_points, a.completed_at as completed_at
    """
    
    attempt_result = await session.run(save_attempt_query,
        user_id=current_user["id"],
        qcm_id=qcm_id,
        attempt_id=attempt_id,
        answers=answers,
        score=score_percentage,
        total_points=total_points,
        earned_points=earned_points
    )
    
    attempt_record = await attempt_result.single()
    
    return dict(attempt_record)
