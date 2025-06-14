# Guide de Déploiement sur Render

Ce guide vous explique comment déployer la plateforme éducative sur Render.

## 📋 Prérequis

1. Compte Render (gratuit) : https://render.com
2. Compte GitHub avec votre code
3. Compte Neo4j Aura (gratuit) : https://neo4j.com/cloud/aura/

## 🗄️ Étape 1: Configuration de la Base de Données

### Neo4j Aura (Recommandé)
1. Allez sur https://neo4j.com/cloud/aura/
2. Créez un compte gratuit
3. Créez une nouvelle instance AuraDB Free
4. Notez les informations de connexion :
   - URI (ex: neo4j+s://xxxxx.databases.neo4j.io)
   - Username (généralement "neo4j")
   - Password (généré automatiquement)

## 🚀 Étape 2: Déploiement du Backend

### 2.1 Créer un Web Service sur Render
1. Connectez-vous à Render
2. Cliquez sur "New +" → "Web Service"
3. Connectez votre repository GitHub
4. Configurez le service :

**Build & Deploy Settings:**
\`\`\`
Build Command: cd backend && pip install -r requirements.txt
Start Command: cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT
\`\`\`

**Environment Variables:**
\`\`\`
NEO4J_URI=neo4j+s://xxxxx.databases.neo4j.io
NEO4J_USER=neo4j
NEO4J_PASSWORD=votre-mot-de-passe-aura
SECRET_KEY=votre-cle-secrete-super-longue-et-complexe
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
ALLOWED_HOSTS=["https://votre-frontend.onrender.com"]
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760
ALLOWED_EXTENSIONS=[".pdf", ".docx", ".doc", ".txt", ".png", ".jpg", ".jpeg"]
ENVIRONMENT=production
DEBUG=false
\`\`\`

### 2.2 Configuration avancée
- **Plan**: Free (pour commencer)
- **Region**: Choisir la plus proche de vos utilisateurs
- **Branch**: main
- **Root Directory**: Laisser vide

## 🎨 Étape 3: Déploiement du Frontend

### 3.1 Créer un Static Site sur Render
1. Cliquez sur "New +" → "Static Site"
2. Connectez le même repository
3. Configurez le site :

**Build & Deploy Settings:**
\`\`\`
Build Command: cd frontend && npm ci && npm run build
Publish Directory: frontend/out
\`\`\`

**Environment Variables:**
\`\`\`
NEXT_PUBLIC_API_URL=https://votre-backend.onrender.com
NODE_VERSION=18
\`\`\`

### 3.2 Configuration Next.js pour Static Export
Le projet est déjà configuré pour l'export statique avec `output: 'export'` dans `next.config.js`.

## 🔧 Étape 4: Configuration Post-Déploiement

### 4.1 Mise à jour des CORS
Une fois le frontend déployé, mettez à jour la variable `ALLOWED_HOSTS` du backend :
\`\`\`
ALLOWED_HOSTS=["https://votre-frontend.onrender.com", "http://localhost:3000"]
\`\`\`

### 4.2 Test de l'API
Testez votre API backend :
\`\`\`bash
curl https://votre-backend.onrender.com/health
\`\`\`

### 4.3 Initialisation de la Base de Données
Les contraintes et index Neo4j seront créés automatiquement au premier démarrage.

## 🔄 Étape 5: Configuration du Déploiement Automatique

### 5.1 Webhooks GitHub
Render configure automatiquement les webhooks pour redéployer à chaque push sur la branche main.

### 5.2 Variables d'Environnement Sensibles
- Utilisez des mots de passe forts
- Changez `SECRET_KEY` en production
- Ne commitez jamais les fichiers `.env`

## 📊 Étape 6: Monitoring et Logs

### 6.1 Logs Render
- Accédez aux logs via le dashboard Render
- Surveillez les erreurs de démarrage
- Vérifiez les connexions à la base de données

### 6.2 Métriques Neo4j
- Utilisez Neo4j Browser pour surveiller la base
- Vérifiez les performances des requêtes

## 🚨 Dépannage

### Erreurs Communes

**1. Erreur de connexion Neo4j**
\`\`\`
Vérifiez l'URI, username et password
Assurez-vous que l'instance Aura est active
\`\`\`

**2. Erreur CORS**
\`\`\`
Vérifiez ALLOWED_HOSTS dans les variables d'environnement
Incluez le domaine frontend complet avec https://
\`\`\`

**3. Erreur de build Frontend**
\`\`\`
Vérifiez que NEXT_PUBLIC_API_URL pointe vers le bon backend
Assurez-vous que toutes les dépendances sont installées
\`\`\`

**4. Timeout de déploiement**
\`\`\`
Les services gratuits Render peuvent prendre du temps à démarrer
Attendez quelques minutes après le premier déploiement
\`\`\`

## 🔐 Sécurité en Production

1. **Variables d'environnement** : Utilisez des valeurs sécurisées
2. **HTTPS** : Render fournit automatiquement SSL
3. **CORS** : Configurez strictement les domaines autorisés
4. **Rate Limiting** : Considérez l'ajout de limitations de taux
5. **Monitoring** : Surveillez les logs pour détecter les anomalies

## 📈 Optimisations

1. **Cache** : Configurez Redis si nécessaire (plan payant)
2. **CDN** : Render fournit un CDN global
3. **Compression** : Activée automatiquement
4. **Monitoring** : Utilisez les métriques Render

## 🆘 Support

- Documentation Render : https://render.com/docs
- Support Neo4j : https://neo4j.com/developer/
- Issues GitHub : Créez une issue sur votre repository
\`\`\`
