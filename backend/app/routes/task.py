from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId
from datetime import datetime

from app.schemas.task import CreateTaskRequest, UpdateTaskRequest
from app.core.tenant import get_tenant_context
from app.core.permissions import require_role
from app.db.mongo import tasks_collection, project_members_collection, projects_collection

router = APIRouter(prefix="/tasks", tags=["Tasks"])

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_task(
    projectId: str,
    payload: CreateTaskRequest,
    tenant=Depends(get_tenant_context)):

    require_role(tenant["role"], ["OWNER", "ADMIN"])

    project = await projects_collection.find_one({ "_id": ObjectId(projectId), "orgId": ObjectId(tenant["org_id"])})

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if payload.assigneeId:
        assignee = await project_members_collection.find_one({
            "projectId": ObjectId(projectId),
            "userId": ObjectId(payload.assigneeId),
            "orgId": ObjectId(tenant["org_id"]),
        })

        if not assignee:
            raise HTTPException(400, "Assignee is not a project member")

    task = {
        "title": payload.title,
        "description": payload.description,
        "status": "OPEN",
        "projectId": ObjectId(projectId),
        "orgId": ObjectId(tenant["org_id"]),
        "createdBy": ObjectId(tenant["user_id"]),
        "assigneeId": ObjectId(payload.assigneeId) if payload.assigneeId else None,
        "createdAt": datetime.utcnow(),
    }

    result = await tasks_collection.insert_one(task)

    return {
        "id": str(result.inserted_id),
        "title": payload.title,
        "description": payload.description,
        "status": "OPEN",
        "assigneeId": payload.assigneeId,
    }

@router.get("/")
async def list_tasks( projectId: str, tenant=Depends(get_tenant_context) ):
    member = await project_members_collection.find_one({
        "projectId": ObjectId(projectId),
        "userId": ObjectId(tenant["user_id"]),
        "orgId":ObjectId(tenant["org_id"]),
    })

    if not member:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not a member of this project")

    cursor = tasks_collection.find({
        "projectId": ObjectId(projectId),
        "orgId": ObjectId(tenant["org_id"]),
    })

    tasks = []
    async for doc in cursor:
        tasks.append({
            "id": str(doc["_id"]),
            "title": doc["title"],
            "description": doc.get("description"),
            "status": doc["status"],
            "assigneeId": str(doc["assigneeId"]) if doc.get("assigneeId") else None,
        })

    return tasks

@router.patch("/{taskId}")
async def update_task(task_id: str, payload: UpdateTaskRequest, tenant = Depends(get_tenant_context)):
    task = await tasks_collection.find_one({"_id": ObjectId(task_id), "orgId": ObjectId(tenant["org_id"])})

    if not task: 
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    # Owner / Admin -> full access
    if tenant["role"] in ["OWNER", "ADMIN"]:
        update_data = {}
        print("ROLE USED:", tenant["role"], "USER:", tenant["user_id"])

        if payload.title is not None:
            update_data["title"] = payload.title
        if payload.description is not None:
            update_data["description"] = payload.description
        if payload.status is not None:
            update_data["status"] = payload.status
        if payload.assigneeId is not None:
            update_data["assigneeId"] = ObjectId(payload.assigneeId)

    # MEMBER → only assignee + status
    else:
        if not task.get("assigneeId") or str(task["assigneeId"]) != tenant["user_id"]:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can update only tasks assigned to you")

        if (payload.title is not None or payload.description is not None or payload.assigneeId is not None):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Members can update only task status")

        if payload.status is None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Status is required")

        update_data = { "status": payload.status }

    if not update_data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No valid fields to update")

    await tasks_collection.update_one({"_id": ObjectId(task_id)}, {"$set": update_data})

    return { "message": "Task updated successfully" }