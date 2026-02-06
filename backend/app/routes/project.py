from fastapi import APIRouter, Depends, status, HTTPException
from bson import ObjectId
from app.schemas.project import CreateProjectRequest
from app.core.tenant import get_tenant_context
from app.db.mongo import projects_collection, project_members_collection, org_members_collection, users_collection
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
    projects = []

    if tenant["role"] == "OWNER":
        # OWNERs can see all projects in the organization
        cursor = projects_collection.find({
            "orgId": ObjectId(tenant["org_id"])
        })
        
        async for doc in cursor:
            projects.append({
                "id": str(doc["_id"]),
                "name": doc["name"],
                "description": doc.get("description"),
                "role": "OWNER",
            })
    else:
        # MEMBERs can only see projects they're assigned to
        member_projects = project_members_collection.find({
            "userId": ObjectId(tenant["user_id"]),
            "orgId": ObjectId(tenant["org_id"])
        })

        # Get all project IDs the user is a member of
        project_ids = [doc["projectId"] async for doc in member_projects]

        if project_ids:
            # Fetch all projects in one query using $in
            cursor = projects_collection.find({
                "_id": {"$in": project_ids},
                "orgId": ObjectId(tenant["org_id"])
            })

            async for doc in cursor:
                projects.append({
                    "id": str(doc["_id"]),
                    "name": doc["name"],
                    "description": doc.get("description"),
                    "role": "MEMBER",
                })

    return projects

@router.post("/{project_id}/members")
async def add_project_member(project_id: str, payload: AddProjectMemberRequest, tenant=Depends(get_tenant_context)):
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

@router.get("/{project_id}/members")
async def list_project_members(project_id: str, tenant=Depends(get_tenant_context)):
    # Verify project exists and belongs to the tenant's organization
    project = await projects_collection.find_one({
        "_id": ObjectId(project_id),
        "orgId": ObjectId(tenant["org_id"])
    })
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Access control: OWNER can see all, MEMBER must be part of the project
    if tenant["role"] != "OWNER":
        is_member = await project_members_collection.find_one({
            "projectId": ObjectId(project_id),
            "userId": ObjectId(tenant["user_id"])
        })
        if not is_member:
            raise HTTPException(status_code=403, detail="Access denied to project members")

    # Fetch members with user details using aggregation
    cursor = project_members_collection.aggregate([
        { "$match": { "projectId": ObjectId(project_id) } },
        {
            "$lookup": {
                "from": "users",
                "localField": "userId",
                "foreignField": "_id",
                "as": "user"
            }
        },
        { "$unwind": "$user" },
        {
            "$project": {
                "_id": 0,
                "userId": { "$toString": "$user._id" },
                "name": "$user.name",
                "email": "$user.email",
                "role": 1
            }
        }
    ])

    return [doc async for doc in cursor]