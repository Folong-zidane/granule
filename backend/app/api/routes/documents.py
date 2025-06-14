from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import JSONResponse
import os
import aiofiles
from typing import List, Optional
import uuid
from datetime import datetime

from app.core.database import get_db
from app.services.document_parser import document_parser
from app.api.routes.auth import get_current_user
from app.models.document import Document, DocumentCreate, DocumentUpdate, DocumentWithCourse, DocumentResponse
from app.core.config import settings

router = APIRouter()

@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    title: Optional[str] = None,
    description: Optional[str] = None,
    db=Depends(get_db)
):
    """Upload et parse un document"""
    try:
        # Vérification du type de fichier
        if not file.filename:
            raise HTTPException(status_code=400, detail="Nom de fichier manquant")
        
        # Génération d'un nom unique
        file_id = str(uuid.uuid4())
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{file_id}{file_extension}"
        file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)
        
        # Création du dossier d'upload s'il n'existe pas
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        
        # Sauvegarde du fichier
        async with aiofiles.open(file_path, 'wb') as f:
            content = await file.read()
            await f.write(content)
        
        # Parsing du document
        parse_result = await document_parser.parse_document(file_path)
        
        # Création de l'objet document
        document_data = DocumentCreate(
            title=title or file.filename,
            description=description or "",
            file_path=file_path,
            filename=file.filename,
            content=parse_result.get('content', ''),
            metadata=parse_result.get('metadata', {}),
            parsed_successfully=parse_result.get('success', False)
        )
        
        # Sauvegarde en base de données
        with db.session() as session:
            # Création du nœud document
            query = """
            CREATE (d:Document {
                id: $id,
                title: $title,
                description: $description,
                filename: $filename,
                file_path: $file_path,
                content: $content,
                metadata: $metadata,
                parsed_successfully: $parsed_successfully,
                created_at: datetime(),
                updated_at: datetime()
            })
            RETURN d
            """
            
            result = session.run(query, {
                'id': file_id,
                'title': document_data.title,
                'description': document_data.description,
                'filename': document_data.filename,
                'file_path': document_data.file_path,
                'content': document_data.content,
                'metadata': document_data.metadata,
                'parsed_successfully': document_data.parsed_successfully
            })
            
            document_node = result.single()
            if not document_node:
                raise HTTPException(status_code=500, detail="Erreur lors de la création du document")
        
        return DocumentResponse(
            id=file_id,
            title=document_data.title,
            description=document_data.description,
            filename=document_data.filename,
            content=document_data.content,
            metadata=document_data.metadata,
            parsed_successfully=document_data.parsed_successfully,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        
    except Exception as e:
        # Nettoyage du fichier en cas d'erreur
        if 'file_path' in locals() and os.path.exists(file_path):
            os.remove(file_path)
        
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'upload: {str(e)}")

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

@router.get("/parse-test")
async def test_parsing():
    """Test des capacités de parsing disponibles"""
    capabilities = {
        'pdfplumber': False,
        'pypdf2': False,
        'python_magic': False
    }
    
    try:
        import pdfplumber
        capabilities['pdfplumber'] = True
    except ImportError:
        pass
    
    try:
        import PyPDF2
        capabilities['pypdf2'] = True
    except ImportError:
        pass
    
    try:
        import magic
        capabilities['python_magic'] = True
    except ImportError:
        pass
    
    return {
        'message': 'Test des capacités de parsing',
        'capabilities': capabilities,
        'supported_formats': [
            'application/pdf',
            'text/plain',
            'application/json',
            'text/csv'
        ]
    }

@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(document_id: str, db=Depends(get_db)):
    """Récupère un document par son ID"""
    with db.session() as session:
        query = """
        MATCH (d:Document {id: $document_id})
        RETURN d
        """
        
        result = session.run(query, {'document_id': document_id})
        document_node = result.single()
        
        if not document_node:
            raise HTTPException(status_code=404, detail="Document non trouvé")
        
        doc = document_node['d']
        return DocumentResponse(
            id=doc['id'],
            title=doc['title'],
            description=doc['description'],
            filename=doc['filename'],
            content=doc['content'],
            metadata=doc['metadata'],
            parsed_successfully=doc['parsed_successfully'],
            created_at=doc['created_at'],
            updated_at=doc['updated_at']
        )

@router.get("/", response_model=List[DocumentResponse])
async def list_documents(skip: int = 0, limit: int = 100, db=Depends(get_db)):
    """Liste tous les documents"""
    with db.session() as session:
        query = """
        MATCH (d:Document)
        RETURN d
        ORDER BY d.created_at DESC
        SKIP $skip LIMIT $limit
        """
        
        result = session.run(query, {'skip': skip, 'limit': limit})
        documents = []
        
        for record in result:
            doc = record['d']
            documents.append(DocumentResponse(
                id=doc['id'],
                title=doc['title'],
                description=doc['description'],
                filename=doc['filename'],
                content=doc['content'],
                metadata=doc['metadata'],
                parsed_successfully=doc['parsed_successfully'],
                created_at=doc['created_at'],
                updated_at=doc['updated_at']
            ))
        
        return documents

@router.get("/old/{document_id}", response_model=Document)
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
