from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Document Editor API",
    description="API pour l'éditeur de documents éducatifs",
    version="1.0.0"
)

# CORS configuration
origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://v0-studteach.vercel.app",
    os.getenv("FRONTEND_URL", "")
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Document Editor API", "status": "running"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "document-editor-api",
        "version": "1.0.0"
    }

# Import routes
try:
    from app.api.routes import auth, users, courses, documents
    
    app.include_router(auth.router, prefix="/auth", tags=["authentication"])
    app.include_router(users.router, prefix="/users", tags=["users"])
    app.include_router(courses.router, prefix="/courses", tags=["courses"])
    app.include_router(documents.router, prefix="/documents", tags=["documents"])
    
except ImportError as e:
    print(f"Warning: Could not import some routes: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
