import os
import json
import magic
import aiofiles
from typing import Dict, Any, Optional
import logging
from pathlib import Path

# Alternative PDF parsing libraries
try:
    import PyPDF2
    PYPDF2_AVAILABLE = True
except ImportError:
    PYPDF2_AVAILABLE = False

try:
    import pdfplumber
    PDFPLUMBER_AVAILABLE = True
except ImportError:
    PDFPLUMBER_AVAILABLE = False

logger = logging.getLogger(__name__)

class DocumentParser:
    """Service de parsing de documents avec alternatives à PyMuPDF"""
    
    def __init__(self):
        self.supported_formats = {
            'application/pdf': self._parse_pdf,
            'text/plain': self._parse_text,
            'application/json': self._parse_json,
            'text/csv': self._parse_csv,
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': self._parse_docx_fallback
        }
    
    async def parse_document(self, file_path: str) -> Dict[str, Any]:
        """Parse un document et retourne son contenu structuré"""
        try:
            if not os.path.exists(file_path):
                raise FileNotFoundError(f"File not found: {file_path}")
            
            # Détection du type MIME
            mime_type = magic.from_file(file_path, mime=True)
            logger.info(f"Detected MIME type: {mime_type} for file: {file_path}")
            
            # Vérification si le format est supporté
            if mime_type not in self.supported_formats:
                return {
                    'success': False,
                    'error': f'Format non supporté: {mime_type}',
                    'content': '',
                    'metadata': {
                        'file_path': file_path,
                        'mime_type': mime_type,
                        'size': os.path.getsize(file_path)
                    }
                }
            
            # Parsing du document
            parser_func = self.supported_formats[mime_type]
            result = await parser_func(file_path)
            
            return {
                'success': True,
                'content': result.get('content', ''),
                'metadata': {
                    'file_path': file_path,
                    'mime_type': mime_type,
                    'size': os.path.getsize(file_path),
                    **result.get('metadata', {})
                }
            }
            
        except Exception as e:
            logger.error(f"Error parsing document {file_path}: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'content': '',
                'metadata': {
                    'file_path': file_path,
                    'size': os.path.getsize(file_path) if os.path.exists(file_path) else 0
                }
            }
    
    async def _parse_pdf(self, file_path: str) -> Dict[str, Any]:
        """Parse un fichier PDF avec des alternatives à PyMuPDF"""
        
        # Essayer pdfplumber en premier (meilleur pour l'extraction de texte)
        if PDFPLUMBER_AVAILABLE:
            try:
                return await self._parse_pdf_with_pdfplumber(file_path)
            except Exception as e:
                logger.warning(f"pdfplumber failed: {e}, trying PyPDF2")
        
        # Fallback vers PyPDF2
        if PYPDF2_AVAILABLE:
            try:
                return await self._parse_pdf_with_pypdf2(file_path)
            except Exception as e:
                logger.warning(f"PyPDF2 failed: {e}")
        
        # Si aucune bibliothèque n'est disponible
        return {
            'content': 'Erreur: Aucune bibliothèque PDF disponible. Veuillez installer pdfplumber ou PyPDF2.',
            'metadata': {'pages': 0, 'parser': 'none'}
        }
    
    async def _parse_pdf_with_pdfplumber(self, file_path: str) -> Dict[str, Any]:
        """Parse PDF avec pdfplumber"""
        import pdfplumber
        
        content = []
        metadata = {'pages': 0, 'parser': 'pdfplumber'}
        
        with pdfplumber.open(file_path) as pdf:
            metadata['pages'] = len(pdf.pages)
            
            for page_num, page in enumerate(pdf.pages, 1):
                try:
                    text = page.extract_text()
                    if text:
                        content.append(f"=== Page {page_num} ===\n{text}\n")
                except Exception as e:
                    logger.warning(f"Error extracting page {page_num}: {e}")
                    content.append(f"=== Page {page_num} ===\n[Erreur d'extraction]\n")
        
        return {
            'content': '\n'.join(content),
            'metadata': metadata
        }
    
    async def _parse_pdf_with_pypdf2(self, file_path: str) -> Dict[str, Any]:
        """Parse PDF avec PyPDF2"""
        import PyPDF2
        
        content = []
        metadata = {'pages': 0, 'parser': 'PyPDF2'}
        
        with open(file_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            metadata['pages'] = len(pdf_reader.pages)
            
            for page_num, page in enumerate(pdf_reader.pages, 1):
                try:
                    text = page.extract_text()
                    if text:
                        content.append(f"=== Page {page_num} ===\n{text}\n")
                except Exception as e:
                    logger.warning(f"Error extracting page {page_num}: {e}")
                    content.append(f"=== Page {page_num} ===\n[Erreur d'extraction]\n")
        
        return {
            'content': '\n'.join(content),
            'metadata': metadata
        }
    
    async def _parse_text(self, file_path: str) -> Dict[str, Any]:
        """Parse un fichier texte"""
        async with aiofiles.open(file_path, 'r', encoding='utf-8', errors='ignore') as file:
            content = await file.read()
        
        return {
            'content': content,
            'metadata': {
                'lines': len(content.splitlines()),
                'characters': len(content),
                'parser': 'text'
            }
        }
    
    async def _parse_json(self, file_path: str) -> Dict[str, Any]:
        """Parse un fichier JSON"""
        async with aiofiles.open(file_path, 'r', encoding='utf-8') as file:
            content = await file.read()
            data = json.loads(content)
        
        return {
            'content': json.dumps(data, indent=2, ensure_ascii=False),
            'metadata': {
                'type': 'json',
                'keys': list(data.keys()) if isinstance(data, dict) else [],
                'parser': 'json'
            }
        }
    
    async def _parse_csv(self, file_path: str) -> Dict[str, Any]:
        """Parse un fichier CSV"""
        import csv
        
        content = []
        metadata = {'rows': 0, 'columns': 0, 'parser': 'csv'}
        
        async with aiofiles.open(file_path, 'r', encoding='utf-8', errors='ignore') as file:
            csv_content = await file.read()
            
        # Parse CSV
        csv_reader = csv.reader(csv_content.splitlines())
        rows = list(csv_reader)
        
        if rows:
            metadata['rows'] = len(rows)
            metadata['columns'] = len(rows[0]) if rows else 0
            
            # Format as table
            for i, row in enumerate(rows):
                if i == 0:
                    content.append("| " + " | ".join(row) + " |")
                    content.append("|" + "|".join([" --- " for _ in row]) + "|")
                else:
                    content.append("| " + " | ".join(row) + " |")
        
        return {
            'content': '\n'.join(content),
            'metadata': metadata
        }
    
    async def _parse_docx_fallback(self, file_path: str) -> Dict[str, Any]:
        """Fallback pour les fichiers DOCX sans python-docx"""
        return {
            'content': 'Format DOCX détecté mais non supporté dans cette version. Veuillez convertir en PDF ou TXT.',
            'metadata': {
                'parser': 'fallback',
                'format': 'docx'
            }
        }

# Instance globale
document_parser = DocumentParser()
