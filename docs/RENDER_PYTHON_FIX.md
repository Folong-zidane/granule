# Fix pour l'Erreur Python 3.13 sur Render

## Problème
Render utilise Python 3.13 par défaut, mais pydantic-core n'est pas compatible.

## Solutions Implémentées

### 1. Forcer Python 3.11
- Ajout du fichier `runtime.txt` avec `python-3.11.9`
- Dockerfile mis à jour avec Python 3.11

### 2. Versions Compatibles
- `pydantic==2.4.2` (version stable)
- `pydantic-settings==2.0.3` (compatible)

### 3. Configuration Render
- Ajout de `render.yaml` pour configuration explicite
- Variable d'environnement `PYTHON_VERSION=3.11.9`

## Instructions de Déploiement

### Option 1: Via render.yaml (Recommandé)
1. Ajoutez `render.yaml` à la racine du projet
2. Connectez votre repo GitHub à Render
3. Render détectera automatiquement la configuration

### Option 2: Configuration Manuelle
1. **Build Command**: `pip install -r requirements.txt`
2. **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
3. **Python Version**: Ajoutez `PYTHON_VERSION=3.11.9` dans les variables d'environnement

### Variables d'Environnement Requises
\`\`\`
NEO4J_URI=neo4j+s://xxxxx.databases.neo4j.io
NEO4J_USER=neo4j
NEO4J_PASSWORD=votre-mot-de-passe
SECRET_KEY=votre-cle-secrete-longue
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
ALLOWED_HOSTS=["https://votre-frontend.onrender.com"]
ENVIRONMENT=production
DEBUG=false
PYTHON_VERSION=3.11.9
\`\`\`

## Test de Santé
Une fois déployé, testez avec :
\`\`\`bash
curl https://votre-backend.onrender.com/health
\`\`\`

Cette configuration garantit la compatibilité et évite les erreurs de compilation.
