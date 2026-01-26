from pydantic import BaseModel, EmailStr

class SignupResponse(BaseModel):
    user_id: str
    message: str

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class LoginRequest(BaseModel):
    email: EmailStr
    password: str
