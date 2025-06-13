# Plateforme Éducative - Éditeur de Documents et Cours

Une plateforme complète pour la création, gestion et partage de cours éducatifs avec un éditeur de documents intégré.

## 🚀 Fonctionnalités

### Frontend (Next.js)
- ✅ Éditeur de documents riche avec support Markdown
- ✅ Système de gestion de cours complet
- ✅ Dashboard enseignant et étudiant
- ✅ Système QCM interactif
- ✅ Parsing de documents (PDF, DOCX, TXT)
- ✅ Gestion des ressources et médias
- ✅ Interface responsive avec Tailwind CSS

### Backend (FastAPI)
- ✅ API REST complète
- ✅ Authentification JWT
- ✅ Base de données Neo4j
- ✅ Upload et traitement de fichiers
- ✅ Gestion des utilisateurs et cours
- ✅ Cache Redis

## 📁 Structure du Projet

\`\`\`
plateforme-educative/
├── frontend/                 # Application Next.js
│   ├── app/                 # Pages et layouts
│   ├── components/          # Composants React
│   ├── lib/                # Utilitaires et services
│   └── public/             # Assets statiques
├── backend/                 # API FastAPI
│   ├── app/                # Code source Python
│   ├── uploads/            # Fichiers uploadés
│   └── requirements.txt    # Dépendances Python
├── docker-compose.yml      # Configuration Docker
└── docs/                   # Documentation
\`\`\`

## 🛠️ Installation Locale

### Prérequis
- Node.js 18+
- Python 3.9+
- Docker et Docker Compose
- Git

### 1. Cloner le projet
\`\`\`bash
git clone <votre-repo>
cd plateforme-educative
\`\`\`

### 2. Configuration Backend
\`\`\`bash
cd backend
cp .env.example .env
# Éditer .env avec vos configurations
pip install -r requirements.txt
\`\`\`

### 3. Configuration Frontend
\`\`\`bash
cd frontend
npm install
cp .env.local.example .env.local
# Éditer .env.local avec vos configurations
\`\`\`

### 4. Lancer avec Docker
\`\`\`bash
docker-compose up -d
\`\`\`

## 🌐 Déploiement sur Render

Voir le fichier `docs/DEPLOY_RENDER.md` pour les instructions détaillées.

## 📚 Documentation

- [Guide de déploiement Render](docs/DEPLOY_RENDER.md)
- [Configuration de l'environnement](docs/ENVIRONMENT.md)
- [API Documentation](docs/API.md)

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature
3. Commit vos changements
4. Push vers la branche
5. Ouvrir une Pull Request

## 📄 Licence

MIT License
\`\`\`
# granule
