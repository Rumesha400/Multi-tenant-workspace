from pydantic import BaseModel, EmailStr

# -------- REQUESTS --------
class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    name: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

# -------- RESPONSES --------
class SignupResponse(BaseModel):
    user_id: str
    message: str

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
