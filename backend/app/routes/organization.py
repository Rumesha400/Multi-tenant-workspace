from fastapi import APIRouter, Depends, status, HTTPException
from app.db.mongo import ( users_collection, organizations_collection, org_members_collection )
from app.core.dependencies import get_current_user
from app.core.security import create_access_token
from app.schemas.organization import CreateOrgRequest, AddOrgMemberRequest
from bson.objectid import ObjectId

router = APIRouter(prefix="/org", tags=["Organization"])

@router.get("/orgs/current")
def get_my_org(current_user=Depends(get_current_user)):
    return { "message": "Access granted", "user": current_user }

@router.post("/create")
async def create_org(payload: CreateOrgRequest, current_user=Depends(get_current_user)):
    org = { "name": payload.name, "createdBy": ObjectId(current_user["user_id"])}

    org_result = await organizations_collection.insert_one(org)

    membership = {
        "userId": ObjectId(current_user["user_id"]),
        "orgId": org_result.inserted_id,
        "role": "OWNER"
    }

    await org_members_collection.insert_one(membership)

    return { "org_id": str(org_result.inserted_id), "role": "OWNER" }

@router.post("/members")
async def add_user_to_org(payload: AddOrgMemberRequest, current_user=Depends(get_current_user)):

    user_id = payload.user_id
    if not user_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="user_id is required")

    # must be an owner
    owner = await org_members_collection.find_one({
        "userId": ObjectId(current_user["user_id"]),
        "role": "OWNER"
    })
    if not owner: 
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only OWNER can add members")

    # user must exist
    user = await users_collection.find_one({ "_id": ObjectId(user_id) })
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # prevent duplicate
    existing = await org_members_collection.find_one({
        "userId": ObjectId(user_id),
        "orgId": ObjectId(current_user["org_id"])
    })

    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User already exists in the organization")

    # add member
    await org_members_collection.insert_one({
        "userId": ObjectId(user_id),
        "orgId": ObjectId(current_user["org_id"]),
        "role": "MEMBER"
    })

    return {"message": "User added to organization successfully"}

@router.post("/org/switch/{org_id}")
async def switch_org(org_id: str, current_user=Depends(get_current_user)):
    
    membership = await org_members_collection.find_one({
        "userId": ObjectId(current_user["user_id"]),
        "orgId": ObjectId(org_id)
    })

    if not membership:
        raise HTTPException(403, "Not part of this organization")

    token = create_access_token({
        "user_id": current_user["user_id"],
        "org_id": org_id,
        "role": membership["role"]
    })

    return { "access_token": token, "token_type": "bearer" }
