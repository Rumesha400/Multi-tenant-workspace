from fastapi import APIRouter, Depends 
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/test", tags=["Test"])

@router.get("/me")
async def test_me(current_user = Depends(get_current_user)):
    return current_user 