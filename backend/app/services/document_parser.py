import os
import json
import csv
import io
from typing import Dict, Any, Optional
import magic
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DocumentParser:
    def __init__(self):
        self.supported_formats = {
            'text/plain': self._parse_text,
            'application/json': self._parse_json,
            'text/csv': self._parse_csv,
            'application/pdf': self._parse_pdf,
        }
    
    def detect_file_type(self, file_path: str) -> str:
        """Detect file type using python-magic"""
        try:
            mime_type = magic.from_file(file_path, mime=True)
            logger.info(f"Detected MIME type: {mime_type}")
            return mime_type
        except Exception as e:
            logger.error(f"Error detecting file type: {e}")
            # Fallback to extension-based detection
            ext = os.path.splitext(file_path)[1].lower()
            ext_to_mime = {
                '.txt': 'text/plain',
                '.json': 'application/json',
                '.csv': 'text/csv',
                '.pdf': 'application/pdf',
            }
            return ext_to_mime.get(ext, 'application/octet-stream')
    
    def parse_document(self, file_path: str) -> Dict[str, Any]:
        """Parse document and return structured content"""
        try:
            mime_type = self.detect_file_type(file_path)
            
            if mime_type in self.supported_formats:
                return self.supported_formats[mime_type](file_path)
            else:
                return {
                    'success': False,
                    'error': f'Format non supporté: {mime_type}',
                    'mime_type': mime_type,
                    'supported_formats': list(self.supported_formats.keys())
                }
        
        except Exception as e:
            logger.error(f"Error parsing document: {e}")
            return {
                'success': False,
                'error': str(e),
                'file_path': file_path
            }
    
    def _parse_text(self, file_path: str) -> Dict[str, Any]:
        """Parse plain text file"""
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                content = file.read()
            
            return {
                'success': True,
                'content': content,
                'format': 'text',
                'word_count': len(content.split()),
                'char_count': len(content)
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def _parse_json(self, file_path: str) -> Dict[str, Any]:
        """Parse JSON file"""
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                data = json.load(file)
            
            return {
                'success': True,
                'content': data,
                'format': 'json',
                'keys': list(data.keys()) if isinstance(data, dict) else None
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def _parse_csv(self, file_path: str) -> Dict[str, Any]:
        """Parse CSV file"""
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                csv_reader = csv.DictReader(file)
                rows = list(csv_reader)
            
            # Convert to markdown table
            if rows:
                headers = rows[0].keys()
                markdown = "| " + " | ".join(headers) + " |\n"
                markdown += "| " + " | ".join(["---"] * len(headers)) + " |\n"
                
                for row in rows[:10]:  # Limit to first 10 rows
                    markdown += "| " + " | ".join(str(row.get(h, '')) for h in headers) + " |\n"
                
                if len(rows) > 10:
                    markdown += f"\n*... et {len(rows) - 10} lignes supplémentaires*"
            else:
                markdown = "Fichier CSV vide"
            
            return {
                'success': True,
                'content': markdown,
                'format': 'csv',
                'row_count': len(rows),
                'columns': list(rows[0].keys()) if rows else []
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def _parse_pdf(self, file_path: str) -> Dict[str, Any]:
        """Parse PDF file using available libraries"""
        # Try pdfplumber first
        try:
            import pdfplumber
            
            with pdfplumber.open(file_path) as pdf:
                text_content = ""
                for page in pdf.pages[:5]:  # Limit to first 5 pages
                    text_content += page.extract_text() or ""
                    text_content += "\n\n"
            
            return {
                'success': True,
                'content': text_content.strip(),
                'format': 'pdf',
                'page_count': len(pdf.pages),
                'parser': 'pdfplumber'
            }
        
        except ImportError:
            pass
        
        # Try PyPDF2 as fallback
        try:
            import PyPDF2
            
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                text_content = ""
                
                for page_num in range(min(5, len(pdf_reader.pages))):
                    page = pdf_reader.pages[page_num]
                    text_content += page.extract_text()
                    text_content += "\n\n"
            
            return {
                'success': True,
                'content': text_content.strip(),
                'format': 'pdf',
                'page_count': len(pdf_reader.pages),
                'parser': 'PyPDF2'
            }
        
        except ImportError:
            return {
                'success': False,
                'error': 'Aucune bibliothèque PDF disponible (pdfplumber, PyPDF2)',
                'format': 'pdf'
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}

# Global parser instance
document_parser = DocumentParser()
