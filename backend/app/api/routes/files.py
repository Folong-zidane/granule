from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from fastapi.responses import FileResponse
import os
import uuid
import aiofiles
from pathlib import Path
import fitz  # PyMuPDF
import mammoth
from typing import Optional

from app.core.config import settings
from app.core.database import get_db
from app.api.routes.auth import get_current_user
from app.models.document import FileUpload, ParsedDocument

router = APIRouter()

async def detect_file_format(file_path: str) -> str:
    """Detect file format based on file signature"""
    try:
        with open(file_path, 'rb') as f:
            header = f.read(8)
        
        # PDF signature
        if header.startswith(b'%PDF'):
            return 'pdf'
        
        # DOCX signature (ZIP-based)
        if header.startswith(b'PK\x03\x04'):
            # Check if it's a DOCX by looking for specific content
            try:
                with open(file_path, 'rb') as f:
                    content = f.read(1024)
                if b'word/' in content or b'document.xml' in content:
                    return 'docx'
            except:
                pass
            return 'zip'
        
        # DOC signature
        if header.startswith(b'\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1'):
            return 'doc'
        
        # Try to decode as text
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                f.read(100)
            return 'text'
        except UnicodeDecodeError:
            try:
                with open(file_path, 'r', encoding='latin-1') as f:
                    f.read(100)
                return 'text'
            except:
                pass
        
        return 'binary'
    
    except Exception:
        return 'unknown'

async def parse_pdf(file_path: str) -> str:
    """Parse PDF file and extract text"""
    try:
        doc = fitz.open(file_path)
        text = ""
        for page in doc:
            text += page.get_text()
        doc.close()
        return text.strip()
    except Exception as e:
        raise Exception(f"Erreur lors du parsing PDF: {str(e)}")

async def parse_docx(file_path: str) -> str:
    """Parse DOCX file and extract text"""
    try:
        with open(file_path, 'rb') as docx_file:
            result = mammoth.extract_raw_text(docx_file)
            return result.value.strip()
    except Exception as e:
        raise Exception(f"Erreur lors du parsing DOCX: {str(e)}")

async def parse_text(file_path: str) -> str:
    """Parse text file"""
    try:
        async with aiofiles.open(file_path, 'r', encoding='utf-8') as f:
            content = await f.read()
            return content.strip()
    except UnicodeDecodeError:
        try:
            async with aiofiles.open(file_path, 'r', encoding='latin-1') as f:
                content = await f.read()
                return content.strip()
        except Exception as e:
            raise Exception(f"Erreur lors de la lecture du fichier texte: {str(e)}")

@router.post("/upload", response_model=FileUpload)
async def upload_file(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    # Validate file extension
    file_extension = Path(file.filename).suffix.lower()
    if file_extension not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"File type not allowed. Allowed types: {settings.ALLOWED_EXTENSIONS}"
        )
    
    # Validate file size
    if file.size > settings.MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size: {settings.MAX_FILE_SIZE} bytes"
        )
    
    # Generate unique filename
    file_id = str(uuid.uuid4())
    filename = f"{file_id}_{file.filename}"
    file_path = Path(settings.UPLOAD_DIR) / filename
    
    # Save file
    try:
        async with aiofiles.open(file_path, 'wb') as f:
            content = await file.read()
            await f.write(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
    
    # Create file record
    file_upload = FileUpload(
        filename=filename,
        content_type=file.content_type,
        size=file.size,
        url=f"/api/files/{filename}",
        uploaded_at=datetime.now()
    )
    
    return file_upload

@router.post("/parse", response_model=ParsedDocument)
async def parse_document(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    # Save temporary file
    temp_id = str(uuid.uuid4())
    temp_filename = f"temp_{temp_id}_{file.filename}"
    temp_path = Path(settings.UPLOAD_DIR) / temp_filename
    
    try:
        async with aiofiles.open(temp_path, 'wb') as f:
            content = await file.read()
            await f.write(content)
        
        # Detect file format
        file_format = await detect_file_format(str(temp_path))
        
        # Parse based on format
        parsed_content = ""
        error = None
        metadata = {
            "original_filename": file.filename,
            "size": len(content),
            "detected_format": file_format
        }
        
        try:
            if file_format == 'pdf':
                parsed_content = await parse_pdf(str(temp_path))
            elif file_format == 'docx':
                parsed_content = await parse_docx(str(temp_path))
            elif file_format == 'text':
                parsed_content = await parse_text(str(temp_path))
            elif file_format == 'doc':
                error = "Format DOC non supporté. Veuillez convertir en DOCX."
            elif file_format == 'binary':
                error = "Format binaire détecté. Formats supportés: PDF, DOCX, TXT."
            else:
                error = f"Format non reconnu: {file_format}"
        
        except Exception as e:
            error = str(e)
        
        return ParsedDocument(
            filename=file.filename,
            content=parsed_content,
            format=file_format,
            metadata=metadata,
            error=error
        )
    
    finally:
        # Clean up temporary file
        if temp_path.exists():
            temp_path.unlink()

@router.get("/{filename}")
async def get_file(filename: str):
    file_path = Path(settings.UPLOAD_DIR) / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    return FileResponse(file_path)

@router.delete("/{filename}")
async def delete_file(
    filename: str,
    current_user: dict = Depends(get_current_user)
):
    file_path = Path(settings.UPLOAD_DIR) / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    try:
        file_path.unlink()
        return {"message": "File deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete file: {str(e)}")
