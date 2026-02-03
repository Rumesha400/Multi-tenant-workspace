from fastapi import APIRouter, Depends, status, HTTPException
from app.db.mongo import ( organizations_collection, org_members_collection )
from app.core.dependencies import get_current_user
from bson.objectid import ObjectId

router = APIRouter(prefix="/org", tags=["Organization"])

@router.get("/me")
def get_my_org(current_user=Depends(get_current_user)):
    return { "message": "Access granted", "user": current_user }


@router.post("/create")
async def create_org(payload: dict, current_user=Depends(get_current_user)):
    org = { "name": payload["name"], "createdBy": ObjectId(current_user["user_id"])}

    org_result = await organizations_collection.insert_one(org)

    membership = {
        "userId": ObjectId(current_user["user_id"]),
        "orgId": org_result.inserted_id,
        "role": "OWNER"
    }

    await org_members_collection.insert_one(membership)

    return { "org_id": str(org_result.inserted_id), "role": "OWNER" }

@router.post("/users/{user_id}/join")
async def add_user_to_org(user_id: str, current_user= Depends(get_current_user)):
    owner = await org_members_collection.find_one({
        "userId": ObjectId(current_user["user_id"]),
        "orgId": ObjectId(current_user["org_id"]),
        "role": "OWNER"
    })

    if not owner: 
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only OWNER can add users to the organization"
        )

    exists = await org_members_collection.find_one({
        "userId": ObjectId(user_id),
        "orgId": ObjectId(current_user["org_id"])
    })

    if exists:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already exists in the organization"
        )

    await org_members_collection.insert_one({
        "userId": ObjectId(user_id),
        "orgId": ObjectId(current_user["org_id"]),
        "role": "MEMBER"
    })

    return {"message": "User added to organization"}
