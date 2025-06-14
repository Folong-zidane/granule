from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from app.core.config import settings
from app.core.database import init_db
from app.api.routes import auth, users, courses, documents, files

app = FastAPI(
    title="Plateforme Éducative API",
    description="API pour la plateforme éducative avec gestion de cours et documents",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_HOSTS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(courses.router, prefix="/courses", tags=["Courses"])
app.include_router(documents.router, prefix="/documents", tags=["Documents"])
app.include_router(files.router, prefix="/files", tags=["Files"])

@app.on_event("startup")
async def startup_event():
    """Initialize database connection on startup"""
    try:
        await init_db()
        print("✅ Database connection initialized successfully")
    except Exception as e:
        print(f"❌ Failed to initialize database: {e}")
        raise

@app.get("/")
async def root():
    return {"message": "Plateforme Éducative API", "version": "1.0.0", "status": "running"}

@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring"""
    try:
        # Test database connection
        from app.core.database import get_db_connection
        driver = get_db_connection()
        driver.verify_connectivity()
        
        return {
            "status": "healthy",
            "database": "connected",
            "version": "1.0.0"
        }
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Service unhealthy: {str(e)}")

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler"""
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal server error: {str(exc)}"}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=False
    )
