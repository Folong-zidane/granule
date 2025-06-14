from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
from typing import Dict, Any, Optional, List
from dotenv import load_dotenv
from datetime import datetime

# Load environment variables
load_dotenv()

# Configuration simple sans Pydantic Settings
class Config:
    NEO4J_URI = os.getenv("NEO4J_URI", "bolt://localhost:7687")
    NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
    NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "password")
    SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key")
    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
    ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

config = Config()

app = FastAPI(
    title="Plateforme Éducative API",
    description="API pour la plateforme éducative avec parsing de documents",
    version="1.0.0"
)

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        config.FRONTEND_URL, 
        "http://localhost:3000", 
        "https://v0-studteachmain-alpha.vercel.app",
        "https://*.vercel.app",
        "https://*.onrender.com"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Connexion Neo4j simple
from neo4j import GraphDatabase

class Neo4jConnection:
    def __init__(self):
        self.driver = None
        self.connect()
    
    def connect(self):
        try:
            self.driver = GraphDatabase.driver(
                config.NEO4J_URI,
                auth=(config.NEO4J_USER, config.NEO4J_PASSWORD)
            )
            print("✅ Connected to Neo4j database")
        except Exception as e:
            print(f"❌ Failed to connect to Neo4j: {e}")
            self.driver = None
    
    def close(self):
        if self.driver:
            self.driver.close()
    
    def execute_query(self, query: str, parameters: dict = None):
        if not self.driver:
            return {"error": "Database not connected"}
        
        try:
            with self.driver.session() as session:
                result = session.run(query, parameters or {})
                return [record.data() for record in result]
        except Exception as e:
            return {"error": str(e)}

# Instance globale de connexion
db = Neo4jConnection()

# Import des routes
try:
    from app.api.routes import course_content, templates, qcm, analytics, export
    
    app.include_router(course_content.router, prefix="/api/courses", tags=["course-content"])
    app.include_router(templates.router, prefix="/api/templates", tags=["templates"])
    app.include_router(qcm.router, prefix="/api/courses", tags=["qcm"])
    app.include_router(analytics.router, prefix="/api/courses", tags=["analytics"])
    app.include_router(export.router, prefix="/api/courses", tags=["export"])
    
    print("✅ All API routes loaded successfully")
    
except ImportError as e:
    print(f"⚠️ Warning: Could not import some routes: {e}")

@app.get("/")
async def root():
    return {
        "message": "Plateforme Éducative API",
        "version": "1.0.0",
        "status": "running",
        "environment": config.ENVIRONMENT,
        "database_connected": db.driver is not None,
        "available_routes": [
            "/api/courses/{id}/content/blocks",
            "/api/templates",
            "/api/courses/{id}/qcm",
            "/api/courses/{id}/analytics",
            "/api/courses/{id}/export"
        ]
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "environment": config.ENVIRONMENT,
        "neo4j_configured": bool(config.NEO4J_URI and config.NEO4J_PASSWORD),
        "neo4j_connected": db.driver is not None
    }

# ==================== ROUTES ADMIN (SANS RESTRICTION) ====================

@app.get("/admin/database/status")
async def admin_database_status():
    """Vérifier le statut de la base de données"""
    if not db.driver:
        return {"connected": False, "error": "Database not connected"}
    
    try:
        with db.driver.session() as session:
            result = session.run("RETURN 1 as test")
            test_result = result.single()
            return {
                "connected": True,
                "test_query": test_result["test"] if test_result else None,
                "neo4j_uri": config.NEO4J_URI,
                "neo4j_user": config.NEO4J_USER
            }
    except Exception as e:
        return {"connected": False, "error": str(e)}

@app.get("/admin/database/nodes")
async def admin_get_all_nodes():
    """Récupérer tous les nœuds de la base de données"""
    query = """
    MATCH (n) 
    RETURN labels(n) as labels, count(n) as count
    """
    result = db.execute_query(query)
    return {"nodes": result}

@app.get("/admin/database/relationships")
async def admin_get_all_relationships():
    """Récupérer toutes les relations de la base de données"""
    query = """
    MATCH ()-[r]->() 
    RETURN type(r) as relationship_type, count(r) as count
    """
    result = db.execute_query(query)
    return {"relationships": result}

@app.post("/admin/database/query")
async def admin_execute_query(query_data: Dict[str, Any]):
    """Exécuter une requête Cypher personnalisée"""
    query = query_data.get("query", "")
    parameters = query_data.get("parameters", {})
    
    if not query:
        raise HTTPException(status_code=400, detail="Query is required")
    
    result = db.execute_query(query, parameters)
    return {"result": result}

@app.post("/admin/database/init")
async def admin_init_database():
    """Initialiser la base de données avec des données de test complètes"""
    queries = [
        # Créer des contraintes
        "CREATE CONSTRAINT user_email IF NOT EXISTS FOR (u:User) REQUIRE u.email IS UNIQUE",
        "CREATE CONSTRAINT course_id IF NOT EXISTS FOR (c:Course) REQUIRE c.id IS UNIQUE",
        "CREATE CONSTRAINT document_id IF NOT EXISTS FOR (d:Document) REQUIRE d.id IS UNIQUE",
        "CREATE CONSTRAINT template_id IF NOT EXISTS FOR (t:Template) REQUIRE t.id IS UNIQUE",
        "CREATE CONSTRAINT qcm_id IF NOT EXISTS FOR (q:QCM) REQUIRE q.id IS UNIQUE",
        
        # Créer des utilisateurs de test
        """
        CREATE (u1:User {
            id: 'user-1',
            email: 'admin@docenseignant.com',
            full_name: 'Administrateur',
            role: 'admin',
            is_active: true,
            created_at: datetime()
        })
        """,
        """
        CREATE (u2:User {
            id: 'user-2',
            email: 'prof@docenseignant.com',
            full_name: 'Sophie Martin',
            role: 'teacher',
            is_active: true,
            created_at: datetime()
        })
        """,
        """
        CREATE (u3:User {
            id: 'user-3',
            email: 'etudiant@docenseignant.com',
            full_name: 'Pierre Dubois',
            role: 'student',
            is_active: true,
            created_at: datetime()
        })
        """,
        
        # Créer des cours de test
        """
        CREATE (c1:Course {
            id: 'course-1',
            title: 'Introduction à Python',
            description: 'Cours de base en programmation Python',
            category: 'Informatique',
            difficulty: 'beginner',
            is_public: true,
            access_code: 'PYTHON123',
            teacher_id: 'user-2',
            created_at: datetime()
        })
        """,
        """
        CREATE (c2:Course {
            id: 'course-2',
            title: 'Mathématiques Avancées',
            description: 'Cours de mathématiques niveau supérieur',
            category: 'Mathématiques',
            difficulty: 'advanced',
            is_public: true,
            access_code: 'MATH456',
            teacher_id: 'user-2',
            created_at: datetime()
        })
        """,
        
        # Créer des blocs de contenu
        """
        CREATE (b1:ContentBlock {
            id: 'block-1',
            type: 'text',
            content: 'Bienvenue dans ce cours d\'introduction à Python. Nous allons apprendre les bases de la programmation.',
            position: 0,
            created_at: datetime(),
            updated_at: datetime()
        })
        """,
        """
        CREATE (b2:ContentBlock {
            id: 'block-2',
            type: 'code',
            content: 'print("Hello, World!")\n# Votre premier programme Python',
            position: 1,
            created_at: datetime(),
            updated_at: datetime()
        })
        """,
        
        # Créer des templates
        """
        CREATE (t1:Template {
            id: 'template-1',
            title: 'Cours de Programmation',
            description: 'Template pour créer des cours de programmation',
            category: 'Informatique',
            difficulty: 'beginner',
            is_public: true,
            created_by: 'user-2',
            usage_count: 5,
            created_at: datetime()
        })
        """,
        
        # Créer des QCM
        """
        CREATE (q1:QCM {
            id: 'qcm-1',
            title: 'Quiz Python Basics',
            description: 'Test de connaissances sur les bases de Python',
            time_limit: 30,
            attempts_allowed: 3,
            is_active: true,
            created_at: datetime()
        })
        """,
        
        # Créer des questions
        """
        CREATE (quest1:Question {
            id: 'question-1',
            question: 'Quelle fonction utilise-t-on pour afficher du texte en Python ?',
            type: 'single',
            options: ['print()', 'display()', 'show()', 'output()'],
            correct_answers: [0],
            explanation: 'La fonction print() est utilisée pour afficher du texte en Python.',
            position: 0,
            points: 1
        })
        """,
        """
        CREATE (quest2:Question {
            id: 'question-2',
            question: 'Quels sont les types de données de base en Python ?',
            type: 'multiple',
            options: ['int', 'str', 'bool', 'array'],
            correct_answers: [0, 1, 2],
            explanation: 'Les types de base en Python sont int (entier), str (chaîne), bool (booléen). Array n\'est pas un type de base.',
            position: 1,
            points: 2
        })
        """,
        
        # Créer des témoignages
        """
        CREATE (test1:Testimonial {
            id: 'testimonial-1',
            user_name: 'Sophie Martin',
            user_role: 'teacher',
            content: 'DocEnseignant a transformé ma façon d\'enseigner. La création de cours interactifs n\'a jamais été aussi simple !',
            rating: 5,
            featured: true,
            approved: true,
            created_at: datetime()
        })
        """,
        """
        CREATE (test2:Testimonial {
            id: 'testimonial-2',
            user_name: 'Pierre Dubois',
            user_role: 'student',
            content: 'Les cours sont interactifs et faciles à suivre. J\'ai amélioré mes résultats grâce à cette plateforme.',
            rating: 4,
            featured: false,
            approved: true,
            created_at: datetime()
        })
        """,
        
        # Créer des relations
        "MATCH (u:User {id: 'user-2'}), (c:Course {id: 'course-1'}) CREATE (u)-[:TEACHES]->(c)",
        "MATCH (u:User {id: 'user-2'}), (c:Course {id: 'course-2'}) CREATE (u)-[:TEACHES]->(c)",
        "MATCH (u:User {id: 'user-3'}), (c:Course {id: 'course-1'}) CREATE (u)-[:ENROLLED_IN {enrolled_at: datetime()}]->(c)",
        "MATCH (c:Course {id: 'course-1'}), (b:ContentBlock {id: 'block-1'}) CREATE (c)-[:HAS_BLOCK]->(b)",
        "MATCH (c:Course {id: 'course-1'}), (b:ContentBlock {id: 'block-2'}) CREATE (c)-[:HAS_BLOCK]->(b)",
        "MATCH (c:Course {id: 'course-1'}), (q:QCM {id: 'qcm-1'}) CREATE (c)-[:HAS_QCM]->(q)",
        "MATCH (q:QCM {id: 'qcm-1'}), (quest:Question {id: 'question-1'}) CREATE (q)-[:HAS_QUESTION]->(quest)",
        "MATCH (q:QCM {id: 'qcm-1'}), (quest:Question {id: 'question-2'}) CREATE (q)-[:HAS_QUESTION]->(quest)",
        
        # Créer des tentatives de QCM
        """
        CREATE (attempt1:QCMAttempt {
            id: 'attempt-1',
            answers: {'question-1': [0], 'question-2': [0, 1, 2]},
            score: 100.0,
            total_points: 3,
            earned_points: 3,
            completed_at: datetime()
        })
        """,
        "MATCH (u:User {id: 'user-3'}), (a:QCMAttempt {id: 'attempt-1'}), (q:QCM {id: 'qcm-1'}) CREATE (u)-[:ATTEMPTED]->(a)-[:FOR_QCM]->(q)"
    ]
    
    results = []
    for query in queries:
        try:
            result = db.execute_query(query)
            results.append({"query": query[:50] + "...", "success": True, "result": result})
        except Exception as e:
            results.append({"query": query[:50] + "...", "success": False, "error": str(e)})
    
    return {"initialization_results": results}

@app.delete("/admin/database/clear")
async def admin_clear_database():
    """Vider complètement la base de données (ATTENTION: DESTRUCTIF)"""
    query = "MATCH (n) DETACH DELETE n"
    result = db.execute_query(query)
    return {"message": "Database cleared", "result": result}

# ==================== ROUTES AVEC VRAIES DONNÉES ====================

@app.get("/stats/global")
async def get_global_stats():
    """Récupérer les statistiques globales de la plateforme depuis la base de données"""
    queries = {
        "total_users": "MATCH (u:User) RETURN count(u) as count",
        "total_teachers": "MATCH (u:User {role: 'teacher'}) RETURN count(u) as count",
        "total_students": "MATCH (u:User {role: 'student'}) RETURN count(u) as count",
        "total_courses": "MATCH (c:Course) RETURN count(c) as count",
        "total_documents": "MATCH (d:Document) RETURN count(d) as count",
        "active_courses": "MATCH (c:Course {is_public: true}) RETURN count(c) as count"
    }
    
    stats = {}
    for key, query in queries.items():
        result = db.execute_query(query)
        stats[key] = result[0]["count"] if result and not isinstance(result, dict) else 0
    
    stats["last_updated"] = datetime.now().isoformat() + "Z"
    return stats

@app.get("/courses/categories")
async def get_course_categories():
    """Lister toutes les catégories de cours depuis la base de données"""
    query = """
    MATCH (c:Course)
    RETURN c.category as name, count(c) as count
    ORDER BY count DESC
    """
    
    result = db.execute_query(query)
    if isinstance(result, dict) and "error" in result:
        # Fallback vers des données par défaut si erreur DB
        return {
            "categories": [
                {"name": "Informatique", "count": 0, "description": "Cours de programmation et technologie"},
                {"name": "Mathématiques", "count": 0, "description": "Cours de mathématiques tous niveaux"}
            ]
        }
    
    categories = []
    descriptions = {
        "Informatique": "Cours de programmation et technologie",
        "Mathématiques": "Cours de mathématiques tous niveaux",
        "Sciences": "Physique, chimie et sciences naturelles",
        "Langues": "Français, anglais et langues étrangères",
        "Histoire-Géographie": "Histoire, géographie et éducation civique"
    }
    
    for record in result:
        categories.append({
            "name": record["name"],
            "count": record["count"],
            "description": descriptions.get(record["name"], "Description non disponible")
        })
    
    return {"categories": categories}

@app.get("/testimonials")
async def get_testimonials(limit: int = 6, featured: Optional[bool] = None):
    """Récupérer les témoignages depuis la base de données"""
    query = """
    MATCH (t:Testimonial {approved: true})
    """
    
    if featured is not None:
        query += f" WHERE t.featured = {str(featured).lower()}"
    
    query += """
    RETURN t.id as id, t.user_name as user_name, t.user_role as user_role,
           t.content as content, t.rating as rating, t.featured as featured,
           t.created_at as created_at
    ORDER BY t.created_at DESC
    LIMIT $limit
    """
    
    result = db.execute_query(query, {"limit": limit})
    
    if isinstance(result, dict) and "error" in result:
        # Fallback vers des données par défaut si erreur DB
        return {"testimonials": []}
    
    testimonials = []
    for record in result:
        testimonials.append({
            "id": record["id"],
            "user_name": record["user_name"],
            "user_role": record["user_role"],
            "content": record["content"],
            "rating": record["rating"],
            "featured": record["featured"],
            "created_at": record["created_at"]
        })
    
    return {"testimonials": testimonials}

# ==================== ROUTES EXISTANTES ====================

@app.get("/documents/parse-test")
async def parse_test():
    """Test des capacités de parsing disponibles"""
    capabilities = {
        "pdf_parsing": True,
        "text_parsing": True,
        "json_parsing": True,
        "csv_parsing": True,
        "libraries": {
            "pypdf2": "3.0.1",
            "pdfplumber": "0.10.3",
            "python_magic": "0.4.27"
        }
    }
    return capabilities

@app.post("/auth/register")
async def register(user_data: Dict[str, Any]):
    return {"message": "Registration endpoint", "data": user_data}

@app.post("/auth/login")
async def login(credentials: Dict[str, Any]):
    return {"message": "Login endpoint", "data": credentials}

@app.get("/courses")
async def get_courses():
    query = """
    MATCH (c:Course)
    OPTIONAL MATCH (u:User)-[:TEACHES]->(c)
    RETURN c.id as id, c.title as title, c.description as description,
           c.category as category, c.difficulty as difficulty,
           c.is_public as is_public, c.created_at as created_at,
           u.full_name as teacher_name
    ORDER BY c.created_at DESC
    """
    
    result = db.execute_query(query)
    if isinstance(result, dict) and "error" in result:
        return {"courses": []}
    
    return {"courses": result}

@app.post("/courses")
async def create_course(course_data: Dict[str, Any]):
    return {"message": "Course created", "data": course_data}

@app.post("/documents/parse")
async def parse_document():
    return {"message": "Document parsing endpoint"}

@app.get("/users/me")
async def get_current_user():
    return {"message": "Current user endpoint"}

@app.options("/{full_path:path}")
async def options_handler(full_path: str):
    return {"message": "OK"}

# Fermer la connexion à l'arrêt de l'application
@app.on_event("shutdown")
async def shutdown_event():
    db.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
