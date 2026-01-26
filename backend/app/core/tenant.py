from fastapi import Depends
from app.core.dependencies import get_current_user

def get_tenant_context(user=Depends(get_current_user)):
    return {
        "user_id": user["user_id"],
        "org_id": user["org_id"],
        "role": user["role"],
    }