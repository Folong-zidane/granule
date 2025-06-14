from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
import uuid

from app.core.config import settings
from app.core.database import get_db
from app.models.user import User, UserCreate, Token, TokenData

router = APIRouter()

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/token")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

async def get_user_by_email(session, email: str):
    query = """
    MATCH (u:User {email: $email})
    RETURN u.id as id, u.email as email, u.full_name as full_name, 
           u.role as role, u.hashed_password as hashed_password,
           u.is_active as is_active, u.created_at as created_at
    """
    result = await session.run(query, email=email)
    record = await result.single()
    if record:
        return dict(record)
    return None

async def authenticate_user(session, email: str, password: str):
    user = await get_user_by_email(session, email)
    if not user:
        return False
    if not verify_password(password, user["hashed_password"]):
        return False
    return user

async def get_current_user(token: str = Depends(oauth2_scheme), session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
    
    user = await get_user_by_email(session, email=token_data.email)
    if user is None:
        raise credentials_exception
    return user

@router.post("/register", response_model=User)
async def register(user: UserCreate, session = Depends(get_db)):
    # Check if user exists
    existing_user = await get_user_by_email(session, user.email)
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    
    # Create new user
    user_id = str(uuid.uuid4())
    hashed_password = get_password_hash(user.password)
    
    query = """
    CREATE (u:User {
        id: $id,
        email: $email,
        full_name: $full_name,
        role: $role,
        hashed_password: $hashed_password,
        is_active: true,
        created_at: datetime()
    })
    RETURN u.id as id, u.email as email, u.full_name as full_name,
           u.role as role, u.is_active as is_active, u.created_at as created_at
    """
    
    result = await session.run(query, 
        id=user_id,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        hashed_password=hashed_password
    )
    
    record = await result.single()
    return User(**dict(record))

@router.post("/token", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), session = Depends(get_db)):
    user = await authenticate_user(session, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=User)
async def read_users_me(current_user: dict = Depends(get_current_user)):
    return User(**current_user)

@router.get("/test")
async def auth_test():
    return {"message": "Auth module loaded"}
