import os
import json
import csv
import io
from typing import Dict, Any, Optional
import magic
import aiofiles
import pdfplumber
import PyPDF2

class DocumentParser:
    """Service de parsing de documents optimisé pour Render"""
    
    def __init__(self):
        self.supported_formats = {
            'application/pdf': self._parse_pdf,
            'text/plain': self._parse_text,
            'application/json': self._parse_json,
            'text/csv': self._parse_csv,
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': self._parse_docx_fallback
        }
    
    async def parse_document(self, file_path: str) -> Dict[str, Any]:
        """Parse un document et retourne le contenu structuré"""
        try:
            # Détection du type MIME
            mime_type = magic.from_file(file_path, mime=True)
            
            # Lecture du fichier
            async with aiofiles.open(file_path, 'rb') as f:
                content = await f.read()
            
            # Parsing selon le type
            if mime_type in self.supported_formats:
                result = await self.supported_formats[mime_type](content, file_path)
            else:
                result = {
                    'success': False,
                    'error': f'Format non supporté: {mime_type}',
                    'supported_formats': list(self.supported_formats.keys())
                }
            
            return {
                'mime_type': mime_type,
                'file_size': len(content),
                **result
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f'Erreur lors du parsing: {str(e)}'
            }
    
    async def _parse_pdf(self, content: bytes, file_path: str) -> Dict[str, Any]:
        """Parse un fichier PDF avec pdfplumber et PyPDF2 en fallback"""
        try:
            # Tentative avec pdfplumber (meilleur pour l'extraction de texte)
            with pdfplumber.open(io.BytesIO(content)) as pdf:
                text_content = ""
                pages_info = []
                
                for i, page in enumerate(pdf.pages):
                    page_text = page.extract_text() or ""
                    text_content += f"\n--- Page {i+1} ---\n{page_text}"
                    
                    pages_info.append({
                        'page_number': i + 1,
                        'text_length': len(page_text),
                        'has_text': bool(page_text.strip())
                    })
                
                return {
                    'success': True,
                    'content': text_content.strip(),
                    'pages_count': len(pdf.pages),
                    'pages_info': pages_info,
                    'parser_used': 'pdfplumber'
                }
                
        except Exception as e:
            # Fallback avec PyPDF2
            try:
                pdf_reader = PyPDF2.PdfReader(io.BytesIO(content))
                text_content = ""
                
                for i, page in enumerate(pdf_reader.pages):
                    page_text = page.extract_text()
                    text_content += f"\n--- Page {i+1} ---\n{page_text}"
                
                return {
                    'success': True,
                    'content': text_content.strip(),
                    'pages_count': len(pdf_reader.pages),
                    'parser_used': 'PyPDF2',
                    'note': 'Fallback parser utilisé'
                }
                
            except Exception as e2:
                return {
                    'success': False,
                    'error': f'Erreur PDF (pdfplumber: {str(e)}, PyPDF2: {str(e2)})'
                }
    
    async def _parse_text(self, content: bytes, file_path: str) -> Dict[str, Any]:
        """Parse un fichier texte"""
        try:
            # Tentative de décodage avec différents encodages
            encodings = ['utf-8', 'latin-1', 'cp1252', 'iso-8859-1']
            
            for encoding in encodings:
                try:
                    text = content.decode(encoding)
                    return {
                        'success': True,
                        'content': text,
                        'encoding_used': encoding,
                        'lines_count': len(text.splitlines())
                    }
                except UnicodeDecodeError:
                    continue
            
            return {
                'success': False,
                'error': 'Impossible de décoder le fichier texte'
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f'Erreur lors du parsing texte: {str(e)}'
            }
    
    async def _parse_json(self, content: bytes, file_path: str) -> Dict[str, Any]:
        """Parse un fichier JSON"""
        try:
            text = content.decode('utf-8')
            data = json.loads(text)
            
            return {
                'success': True,
                'content': json.dumps(data, indent=2, ensure_ascii=False),
                'data': data,
                'keys_count': len(data) if isinstance(data, dict) else None
            }
            
        except json.JSONDecodeError as e:
            return {
                'success': False,
                'error': f'JSON invalide: {str(e)}'
            }
        except Exception as e:
            return {
                'success': False,
                'error': f'Erreur lors du parsing JSON: {str(e)}'
            }
    
    async def _parse_csv(self, content: bytes, file_path: str) -> Dict[str, Any]:
        """Parse un fichier CSV"""
        try:
            text = content.decode('utf-8')
            
            # Détection du délimiteur
            sniffer = csv.Sniffer()
            delimiter = sniffer.sniff(text[:1024]).delimiter
            
            # Lecture du CSV
            reader = csv.DictReader(io.StringIO(text), delimiter=delimiter)
            rows = list(reader)
            
            # Conversion en Markdown
            if rows:
                headers = list(rows[0].keys())
                markdown = "| " + " | ".join(headers) + " |\n"
                markdown += "| " + " | ".join(["---"] * len(headers)) + " |\n"
                
                for row in rows[:10]:  # Limite à 10 lignes pour l'aperçu
                    markdown += "| " + " | ".join(str(row.get(h, "")) for h in headers) + " |\n"
                
                if len(rows) > 10:
                    markdown += f"\n... et {len(rows) - 10} lignes supplémentaires"
            else:
                markdown = "Fichier CSV vide"
            
            return {
                'success': True,
                'content': markdown,
                'rows_count': len(rows),
                'columns': list(rows[0].keys()) if rows else [],
                'delimiter_used': delimiter
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f'Erreur lors du parsing CSV: {str(e)}'
            }
    
    async def _parse_docx_fallback(self, content: bytes, file_path: str) -> Dict[str, Any]:
        """Fallback pour les fichiers DOCX"""
        return {
            'success': False,
            'error': 'Format DOCX non supporté dans cette version',
            'suggestion': 'Convertissez votre fichier en PDF pour un meilleur support',
            'alternative': 'Vous pouvez utiliser des outils en ligne pour convertir DOCX vers PDF'
        }

# Instance globale
document_parser = DocumentParser()
