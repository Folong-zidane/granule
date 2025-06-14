import json
import csv
import io
from typing import Dict, Any, Optional

class SimpleDocumentParser:
    """Parser de documents simplifié sans dépendances lourdes"""
    
    def __init__(self):
        self.supported_formats = ['txt', 'json', 'csv']
    
    def detect_format(self, content: bytes, filename: str = "") -> str:
        """Détection simple du format de fichier"""
        try:
            # Essayer de décoder en UTF-8
            text_content = content.decode('utf-8')
            
            # Vérifier l'extension
            if filename.lower().endswith('.json'):
                return 'json'
            elif filename.lower().endswith('.csv'):
                return 'csv'
            elif filename.lower().endswith('.txt'):
                return 'txt'
            
            # Essayer de parser comme JSON
            try:
                json.loads(text_content)
                return 'json'
            except:
                pass
            
            # Vérifier si c'est du CSV
            if ',' in text_content and '\n' in text_content:
                return 'csv'
            
            return 'txt'
            
        except UnicodeDecodeError:
            return 'binary'
    
    def parse_content(self, content: bytes, filename: str = "") -> Dict[str, Any]:
        """Parse le contenu selon le format détecté"""
        format_type = self.detect_format(content, filename)
        
        try:
            if format_type == 'binary':
                return {
                    'success': False,
                    'error': 'Format binaire non supporté',
                    'format': format_type
                }
            
            text_content = content.decode('utf-8')
            
            if format_type == 'json':
                return self._parse_json(text_content)
            elif format_type == 'csv':
                return self._parse_csv(text_content)
            else:  # txt
                return self._parse_text(text_content)
                
        except Exception as e:
            return {
                'success': False,
                'error': f'Erreur de parsing: {str(e)}',
                'format': format_type
            }
    
    def _parse_json(self, content: str) -> Dict[str, Any]:
        """Parse JSON"""
        try:
            data = json.loads(content)
            return {
                'success': True,
                'format': 'json',
                'content': data,
                'summary': f'Document JSON avec {len(data) if isinstance(data, (dict, list)) else 1} éléments'
            }
        except json.JSONDecodeError as e:
            return {
                'success': False,
                'error': f'JSON invalide: {str(e)}',
                'format': 'json'
            }
    
    def _parse_csv(self, content: str) -> Dict[str, Any]:
        """Parse CSV"""
        try:
            csv_reader = csv.reader(io.StringIO(content))
            rows = list(csv_reader)
            
            if not rows:
                return {
                    'success': False,
                    'error': 'Fichier CSV vide',
                    'format': 'csv'
                }
            
            headers = rows[0] if rows else []
            data_rows = rows[1:] if len(rows) > 1 else []
            
            return {
                'success': True,
                'format': 'csv',
                'content': {
                    'headers': headers,
                    'rows': data_rows,
                    'total_rows': len(data_rows)
                },
                'summary': f'CSV avec {len(headers)} colonnes et {len(data_rows)} lignes'
            }
        except Exception as e:
            return {
                'success': False,
                'error': f'Erreur CSV: {str(e)}',
                'format': 'csv'
            }
    
    def _parse_text(self, content: str) -> Dict[str, Any]:
        """Parse texte simple"""
        lines = content.split('\n')
        words = content.split()
        
        return {
            'success': True,
            'format': 'txt',
            'content': content,
            'summary': f'Document texte: {len(lines)} lignes, {len(words)} mots, {len(content)} caractères'
        }

# Instance globale
document_parser = SimpleDocumentParser()
