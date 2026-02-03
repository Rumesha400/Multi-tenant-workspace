from fastapi import APIRouter, Depends, status, HTTPException
from bson import ObjectId
from app.schemas.project import CreateProjectRequest
from app.core.tenant import get_tenant_context
from app.db.mongo import projects_collection, project_members_collection, org_members_collection
from app.core.dependencies import get_current_user
from app.core.permissions import require_role
from app.schemas.project_member import AddProjectMemberRequest

router = APIRouter(prefix="/projects", tags=["Projects"])

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_project(payload: CreateProjectRequest, tenant=Depends(get_tenant_context)):
    require_role(tenant["role"], ["OWNER", "ADMIN"])
    project = {
        "name": payload.name,
        "description": payload.description,
        "orgId": ObjectId(tenant["org_id"]),
        "createdBy": ObjectId(tenant["user_id"]),
    }

    result = await projects_collection.insert_one(project)

    await project_members_collection.insert_one({
        "projectId": result.inserted_id,
        "userId": ObjectId(tenant["user_id"]),
        "orgId": ObjectId(tenant["org_id"]),
        "role": "OWNER"
    })

    return {  
        "id": str(result.inserted_id),
        "name": payload.name,
        "description": payload.description, 
    }

@router.get("/")
async def list_projects(tenant=Depends(get_tenant_context)):
    cursor = projects_collection.find({ "orgId": ObjectId(tenant["org_id"])})
    projects = []
    async for doc in cursor:
        projects.append({
            "id": str(doc["_id"]),
            "name": doc["name"],
            "description": doc.get("description"),
        })
    return projects

@router.post("/{project_id}/members")
async def add_project_member(
    project_id: str,
    payload: AddProjectMemberRequest,
    tenant=Depends(get_tenant_context)
):
    # Owner check
    if tenant["role"] != "OWNER":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only OWNER can add members"
        )

    # Validate user exists
    member = await org_members_collection.find_one({
        "userId": ObjectId(payload.user_id),
        "orgId": ObjectId(tenant["org_id"])
    })

    if not member:
        raise HTTPException(status_code=404, detail="User not found in organization")

    # Prevent duplicates
    existing = await project_members_collection.find_one({
        "projectId": ObjectId(project_id),
        "userId": ObjectId(payload.user_id)
    })

    if existing:
        raise HTTPException(status_code=400, detail="User already added to the project")

    # Add member
    await project_members_collection.insert_one({
        "projectId": ObjectId(project_id),
        "userId": ObjectId(payload.user_id),
        "orgId": ObjectId(tenant["org_id"]),
        "role": "MEMBER"
    })

    return {"message": "Member added successfully"}