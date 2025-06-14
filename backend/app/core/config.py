from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    # Database
    neo4j_uri: str = os.getenv("NEO4J_URI", "bolt://localhost:7687")
    neo4j_user: str = os.getenv("NEO4J_USER", "neo4j")
    neo4j_password: str = os.getenv("NEO4J_PASSWORD", "password")
    
    # Security
    secret_key: str = os.getenv("SECRET_KEY", "your-secret-key-change-this")
    algorithm: str = os.getenv("ALGORITHM", "HS256")
    access_token_expire_minutes: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    
    # CORSapp.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Au lieu de votre liste spécifique
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],

    # File Upload
    upload_dir: str = os.getenv("UPLOAD_DIR", "uploads")
    max_file_size: int = int(os.getenv("MAX_FILE_SIZE", "10485760"))  # 10MB
    
    # Environment
    environment: str = os.getenv("ENVIRONMENT", "development")
    debug: bool = os.getenv("DEBUG", "false").lower() == "true"
    
    class Config:
        env_file = ".env"

settings = Settings()
