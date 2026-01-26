from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId
from datetime import datetime

from app.schemas.task import CreateTaskRequest
from app.core.tenant import get_tenant_context
from app.core.permissions import require_role
from app.db.mongo import tasks_collection, projects_collection

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