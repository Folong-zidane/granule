from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
from typing import Dict, Any
from dotenv import load_dotenv

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

@app.get("/")
async def root():
    return {
        "message": "Plateforme Éducative API",
        "version": "1.0.0",
        "status": "running",
        "environment": config.ENVIRONMENT
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "environment": config.ENVIRONMENT,
        "neo4j_configured": bool(config.NEO4J_URI and config.NEO4J_PASSWORD)
    }

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

# Routes de base pour l'authentification
@app.post("/auth/register")
async def register(user_data: Dict[str, Any]):
    # Implémentation basique sans validation Pydantic
    return {"message": "Registration endpoint", "data": user_data}

@app.post("/auth/login")
async def login(credentials: Dict[str, Any]):
    # Implémentation basique sans validation Pydantic
    return {"message": "Login endpoint", "data": credentials}

# Routes pour les cours
@app.get("/courses")
async def get_courses():
    return {"message": "Courses endpoint", "courses": []}

@app.post("/courses")
async def create_course(course_data: Dict[str, Any]):
    return {"message": "Course created", "data": course_data}

# Routes pour les documents
@app.post("/documents/parse")
async def parse_document():
    return {"message": "Document parsing endpoint"}

@app.get("/users/me")
async def get_current_user():
    return {"message": "Current user endpoint"}

@app.options("/{full_path:path}")
async def options_handler(full_path: str):
    return {"message": "OK"}

# Import routes
# try:
#     from app.api.routes import auth, users, courses, documents
    
#     app.include_router(auth.router, prefix="/auth", tags=["authentication"])
#     app.include_router(users.router, prefix="/users", tags=["users"])
#     app.include_router(courses.router, prefix="/courses", tags=["courses"])
#     app.include_router(documents.router, prefix="/documents", tags=["documents"])
    
# except ImportError as e:
#     print(f"Warning: Could not import some routes: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
from typing import Dict, Any
from dotenv import load_dotenv

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

@app.get("/")
async def root():
    return {
        "message": "Plateforme Éducative API",
        "version": "1.0.0",
        "status": "running",
        "environment": config.ENVIRONMENT
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "environment": config.ENVIRONMENT,
        "neo4j_configured": bool(config.NEO4J_URI and config.NEO4J_PASSWORD)
    }

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

# Routes de base pour l'authentification
@app.post("/auth/register")
async def register(user_data: Dict[str, Any]):
    # Implémentation basique sans validation Pydantic
    return {"message": "Registration endpoint", "data": user_data}

@app.post("/auth/login")
async def login(credentials: Dict[str, Any]):
    # Implémentation basique sans validation Pydantic
    return {"message": "Login endpoint", "data": credentials}

# Routes pour les cours
@app.get("/courses")
async def get_courses():
    return {"message": "Courses endpoint", "courses": []}

@app.post("/courses")
async def create_course(course_data: Dict[str, Any]):
    return {"message": "Course created", "data": course_data}

# Routes pour les documents
@app.post("/documents/parse")
async def parse_document():
    return {"message": "Document parsing endpoint"}

@app.get("/users/me")
async def get_current_user():
    return {"message": "Current user endpoint"}

@app.options("/{full_path:path}")
async def options_handler(full_path: str):
    return {"message": "OK"}

# Import routes
# try:
#     from app.api.routes import auth, users, courses, documents
    
#     app.include_router(auth.router, prefix="/auth", tags=["authentication"])
#     app.include_router(users.router, prefix="/users", tags=["users"])
#     app.include_router(courses.router, prefix="/courses", tags=["courses"])
#     app.include_router(documents.router, prefix="/documents", tags=["documents"])
    
# except ImportError as e:
#     print(f"Warning: Could not import some routes: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
