from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import Response
from typing import Dict, Any, Optional
import json
from datetime import datetime

from app.core.database import get_db
from app.api.routes.auth import get_current_user

router = APIRouter()

@router.post("/{course_id}/export")
async def export_course(
    course_id: str,
    export_data: Dict[str, Any],
    current_user: dict = Depends(get_current_user),
    session = Depends(get_db)
):
    """Exporter un cours dans différents formats"""
    
    export_format = export_data.get("format", "json")  # json, pdf, html
    include_qcms = export_data.get("include_qcms", True)
    include_analytics = export_data.get("include_analytics", False)
    
    # Vérifier les permissions
    check_query = """
    MATCH (c:Course {id: $course_id})
    WHERE c.teacher_id = $user_id OR $user_role = 'admin'
    RETURN c.id as id, c.title as title, c.description as description,
           c.category as category, c.difficulty as difficulty,
           c.is_public as is_public, c.created_at as created_at
    """
    
    result = await session.run(check_query,
        course_id=course_id,
        user_id=current_user["id"],
        user_role=current_user.get("role", "student")
    )
    course = await result.single()
    
    if not course:
        raise HTTPException(status_code=404, detail="Course not found or not authorized")
    
    course_data = dict(course)
    
    # Récupérer les blocs de contenu
    blocks_query = """
    MATCH (c:Course {id: $course_id})-[:HAS_BLOCK]->(b:ContentBlock)
    RETURN b.id as id, b.type as type, b.content as content,
           b.position as position, b.created_at as created_at
    ORDER BY b.position ASC
    """
    
    blocks_result = await session.run(blocks_query, course_id=course_id)
    blocks = []
    async for record in blocks_result:
        blocks.append(dict(record))
    
    course_data["blocks"] = blocks
    
    # Récupérer les QCM si demandé
    if include_qcms:
        qcms_query = """
        MATCH (c:Course {id: $course_id})-[:HAS_QCM]->(q:QCM)
        OPTIONAL MATCH (q)-[:HAS_QUESTION]->(quest:Question)
        RETURN q.id as id, q.title as title, q.description as description,
               q.time_limit as time_limit, q.attempts_allowed as attempts_allowed,
               collect({
                   id: quest.id,
                   question: quest.question,
                   type: quest.type,
                   options: quest.options,
                   correct_answers: quest.correct_answers,
                   explanation: quest.explanation,
                   position: quest.position,
                   points: quest.points
               }) as questions
        ORDER BY q.created_at ASC
        """
        
        qcms_result = await session.run(qcms_query, course_id=course_id)
        qcms = []
        async for record in qcms_result:
            qcm_data = dict(record)
            # Filtrer les questions nulles
            qcm_data["questions"] = [q for q in qcm_data["questions"] if q["id"] is not None]
            qcms.append(qcm_data)
        
        course_data["qcms"] = qcms
    
    # Récupérer les analytics si demandé
    if include_analytics and current_user["role"] in ["teacher", "admin"]:
        analytics_query = """
        MATCH (c:Course {id: $course_id})
        OPTIONAL MATCH (c)<-[:ENROLLED_IN]-(s:User)
        OPTIONAL MATCH (c)-[:HAS_QCM]->(q:QCM)<-[:FOR_QCM]-(a:QCMAttempt)
        RETURN count(DISTINCT s) as total_students,
               count(DISTINCT a) as total_attempts,
               avg(a.score) as avg_score
        """
        
        analytics_result = await session.run(analytics_query, course_id=course_id)
        analytics = await analytics_result.single()
        
        if analytics:
            analytics_data = dict(analytics)
            analytics_data["avg_score"] = round(analytics_data["avg_score"] or 0, 2)
            course_data["analytics"] = analytics_data
    
    # Ajouter les métadonnées d'export
    export_metadata = {
        "exported_at": datetime.now().isoformat(),
        "exported_by": current_user["id"],
        "export_format": export_format,
        "version": "1.0"
    }
    course_data["export_metadata"] = export_metadata
    
    # Générer le contenu selon le format
    if export_format == "json":
        content = json.dumps(course_data, indent=2, ensure_ascii=False, default=str)
        media_type = "application/json"
        filename = f"course_{course_data['title']}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    
    elif export_format == "html":
        content = generate_html_export(course_data)
        media_type = "text/html"
        filename = f"course_{course_data['title']}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.html"
    
    elif export_format == "pdf":
        # Pour le PDF, on retourne d'abord du HTML qui peut être converti côté client
        content = generate_pdf_ready_html(course_data)
        media_type = "text/html"
        filename = f"course_{course_data['title']}_{datetime.now().strftime('%Y%m%d_%H%M%S')}_pdf.html"
    
    else:
        raise HTTPException(status_code=400, detail="Unsupported export format")
    
    return Response(
        content=content,
        media_type=media_type,
        headers={
            "Content-Disposition": f"attachment; filename={filename}",
            "Content-Type": media_type
        }
    )

def generate_html_export(course_data: Dict[str, Any]) -> str:
    """Générer un export HTML du cours"""
    
    html_content = f"""
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{course_data['title']}</title>
        <style>
            body {{ font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }}
            .header {{ border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }}
            .block {{ margin-bottom: 30px; padding: 20px; border-left: 4px solid #007bff; background-color: #f8f9fa; }}
            .qcm {{ margin-bottom: 30px; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }}
            .question {{ margin-bottom: 15px; }}
            .options {{ margin-left: 20px; }}
            .metadata {{ margin-top: 50px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 0.9em; }}
        </style>
    </head>
    <body>
        <div class="header">
            <h1>{course_data['title']}</h1>
            <p><strong>Description:</strong> {course_data.get('description', 'Aucune description')}</p>
            <p><strong>Catégorie:</strong> {course_data.get('category', 'Non spécifiée')}</p>
            <p><strong>Difficulté:</strong> {course_data.get('difficulty', 'Non spécifiée')}</p>
        </div>
        
        <div class="content">
            <h2>Contenu du cours</h2>
    """
    
    # Ajouter les blocs de contenu
    for block in course_data.get("blocks", []):
        html_content += f"""
            <div class="block">
                <h3>Bloc {block.get('position', 0) + 1} - {block.get('type', 'text').title()}</h3>
                <div>{block.get('content', '')}</div>
            </div>
        """
    
    # Ajouter les QCM
    if course_data.get("qcms"):
        html_content += "<h2>QCM</h2>"
        for qcm in course_data["qcms"]:
            html_content += f"""
                <div class="qcm">
                    <h3>{qcm.get('title', 'QCM sans titre')}</h3>
                    <p>{qcm.get('description', '')}</p>
            """
            
            for i, question in enumerate(qcm.get("questions", [])):
                html_content += f"""
                    <div class="question">
                        <h4>Question {i + 1}: {question.get('question', '')}</h4>
                        <div class="options">
                """
                
                for j, option in enumerate(question.get("options", [])):
                    is_correct = j in question.get("correct_answers", [])
                    marker = "✓" if is_correct else "○"
                    html_content += f"<p>{marker} {option}</p>"
                
                html_content += "</div>"
                
                if question.get("explanation"):
                    html_content += f"<p><strong>Explication:</strong> {question['explanation']}</p>"
                
                html_content += "</div>"
            
            html_content += "</div>"
    
    # Ajouter les métadonnées
    html_content += f"""
        </div>
        <div class="metadata">
            <p><strong>Exporté le:</strong> {course_data['export_metadata']['exported_at']}</p>
            <p><strong>Version:</strong> {course_data['export_metadata']['version']}</p>
        </div>
    </body>
    </html>
    """
    
    return html_content

def generate_pdf_ready_html(course_data: Dict[str, Any]) -> str:
    """Générer un HTML optimisé pour la conversion PDF"""
    
    # Version simplifiée avec styles inline pour une meilleure compatibilité PDF
    return generate_html_export(course_data).replace(
        "<style>",
        "<style>@media print { body { margin: 0; } } "
    )
