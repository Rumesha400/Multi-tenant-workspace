import asyncio
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt

SECRET_KEY = "CHANGE_THIS_LATER"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 120

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def hash_password(password: str) -> str:
    pw_bytes = password.encode("utf-8")[:72]
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, pwd_context.hash, pw_bytes)

def verify_password(password: str, hashed: str) -> bool:
    pw_bytes = password.encode("utf-8")[:72]
    return pwd_context.verify(pw_bytes, hashed)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)