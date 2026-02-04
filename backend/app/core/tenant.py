from fastapi import Depends, HTTPException, status
from app.core.dependencies import get_current_user

def get_tenant_context(user=Depends(get_current_user)):
    org_id = user.get("org_id")
    if not org_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Organization not selected. Switch organization first.")
    return {
        "user_id": user["user_id"],
        "org_id": org_id,
        "role": user["role"],
    }