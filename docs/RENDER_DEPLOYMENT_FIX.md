# 🔧 Guide de Résolution des Erreurs de Déploiement Render

## Problème PyMuPDF

L'erreur que vous rencontrez est due à PyMuPDF qui nécessite une compilation complexe sur Render. Voici les solutions :

### Solution 1: Utiliser des Alternatives (Recommandée)

J'ai modifié le code pour utiliser des alternatives plus légères :
- **pdfplumber** : Meilleur pour l'extraction de texte PDF
- **PyPDF2** : Alternative simple et fiable
- **python-magic** : Pour la détection de types MIME

### Solution 2: Configuration Render Optimisée

1. **Variables d'environnement Render** :
\`\`\`env
PYTHON_VERSION=3.11
BUILD_COMMAND=cd backend && pip install --no-cache-dir -r requirements.txt
START_COMMAND=cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT
\`\`\`

2. **Dockerfile optimisé** avec Python 3.11 (plus stable)

### Solution 3: Test des Capacités

Utilisez l'endpoint `/documents/parse-test` pour vérifier quelles bibliothèques sont disponibles.

## Instructions de Redéploiement

1. **Mettez à jour votre code** avec les nouveaux fichiers
2. **Redéployez sur Render** 
3. **Testez** avec l'endpoint de test
4. **Vérifiez** l'upload de documents

## Formats Supportés

- ✅ **PDF** : Via pdfplumber ou PyPDF2
- ✅ **TXT** : Texte brut
- ✅ **JSON** : Données structurées
- ✅ **CSV** : Tableaux de données
- ⚠️ **DOCX** : Message d'information (conversion recommandée)

## Avantages de cette Approche

1. **Plus léger** : Pas de compilation complexe
2. **Plus rapide** : Déploiement plus rapide
3. **Plus fiable** : Moins d'erreurs de dépendances
4. **Flexible** : Plusieurs alternatives de parsing
