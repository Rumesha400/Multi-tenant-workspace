from fastapi import APIRouter, HTTPException, status

from app.schemas.auth import SignupRequest, SignupResponse, AuthResponse, LoginRequest
from app.db.mongo import users_collection, org_members_collection
from app.core.security import hash_password, create_access_token, verify_password

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/signup", response_model=SignupResponse)
async def signup(payload: SignupRequest):
    existing_user = await users_collection.find_one({"email": payload.email})

    if existing_user:
        raise HTTPException( status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered" )
    
    if len(payload.password.encode("utf-8")) > 72:
        raise HTTPException( status_code=400, detail="Password too long. Max 72 bytes allowed." )

    hashed_password = await hash_password(payload.password)

    user = { "email": payload.email, "password": hashed_password, "name": payload.name }

    user_result = await users_collection.insert_one(user)

    return { "user_id": str(user_result.inserted_id), "message": "Signup successful. Create or join an organization." }
    

@router.post("/login", response_model=AuthResponse)
async def login(payload: LoginRequest):
    user = await users_collection.find_one({ "email" : payload.email })

    if not user or not verify_password(payload.password, user["password"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    membership = await org_members_collection.find_one({ "userId": user["_id"] })

    token = create_access_token({
        "user_id": str(user["_id"]),
        "org_id": str(membership["orgId"]) if membership else None,
        "role": membership["role"] if membership else None,
    })

    return { "access_token": token, "token_type": "bearer" }
    