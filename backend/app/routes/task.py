from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId
from datetime import datetime, timedelta
from app.utils.normalize_helper import normalize_labels
from app.schemas.task import CreateTaskRequest, UpdateTaskRequest
from app.core.tenant import get_tenant_context
from app.core.permissions import require_role
from app.db.mongo import tasks_collection, project_members_collection, projects_collection, project_activities_collection

router = APIRouter(prefix="/tasks", tags=["Tasks"])

ALLOWED_MEMBER_TRANSITIONS = {
    "OPEN": ["IN_PROGRESS"],
    "IN_PROGRESS": ["DONE", "BLOCKED"],
    "BLOCKED": ["IN_PROGRESS"],
}

PRIORITY_ORDER = {
    "URGENT": 4,
    "HIGH": 3,
    "MEDIUM": 2,
    "LOW": 1,
}


async def log_activity(
    org_id,
    project_id,
    user_id,
    action,
    message,
    entity_id
):
    await project_activities_collection.insert_one({
        "orgId": ObjectId(org_id),
        "projectId": ObjectId(project_id),
        "userId": ObjectId(user_id),
        "action": action,
        "entityType": "TASK",
        "entityId": ObjectId(entity_id),
        "message": message,
        "createdAt": datetime.utcnow(),
    })


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
    
    labels = normalize_labels(payload.labels) if payload.labels else []

    task = {
        "title": payload.title,
        "description": payload.description,
        "status": "OPEN",
        "projectId": ObjectId(projectId),
        "orgId": ObjectId(tenant["org_id"]),
        "createdBy": ObjectId(tenant["user_id"]),
        "assigneeId": ObjectId(payload.assigneeId) if payload.assigneeId else None,
        "labels": labels,
        "priority": payload.priority or "MEDIUM",
        "priorityWeight": PRIORITY_ORDER[payload.priority or "MEDIUM"],
        "dueDate": payload.dueDate,
        "isDeleted": False,
        "isArchived": False,
        "createdAt": datetime.utcnow(),
    }

    result = await tasks_collection.insert_one(task)

    await log_activity(
        tenant["org_id"],
        projectId,
        tenant["user_id"],
        "TASK_CREATED",
        f"Created task '{payload.title}'",
        result.inserted_id
    )

    return {
        "id": str(result.inserted_id),
        "title": payload.title,
        "description": payload.description,
        "status": "OPEN",
        "assigneeId": payload.assigneeId,
    }

@router.get("/")
async def list_tasks( 
    projectId: str, 
    assignedToMe: bool = False,
    status: str | None = None,
    assigneeId: str | None = None,
    page: int = 1,
    limit: int = 10,
    labels: str | None = None,
    sortBy: str = "createdAt",
    order: str = "desc",
    overdue: bool = False,
    dueToday: bool = False,
    tenant=Depends(get_tenant_context)   
):
    member = await project_members_collection.find_one({
        "projectId": ObjectId(projectId),
        "userId": ObjectId(tenant["user_id"]),
        "orgId":ObjectId(tenant["org_id"]),
    })

    if overdue and dueToday:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot use overdue and dueToday together")

    if not member:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not a member of this project")

    query = {
        "projectId": ObjectId(projectId),
        "orgId": ObjectId(tenant["org_id"]),
        "isDeleted": False,
        "isArchived": False,
    }

    if assignedToMe: 
        query ["assigneeId"] = ObjectId(tenant["user_id"])

    if status: query["status"] = status 

    if assigneeId: 
        if assigneeId == "assignedToMe":
            query["assigneeId"] = ObjectId(tenant["user_id"])
        else:
            query["assigneeId"] = ObjectId(assigneeId)

    if labels:
        label_list = labels.split(",")
        query["labels"] = {"$all": label_list}

    if overdue:
        query["dueDate"] = { "$lt": datetime.utcnow() }
        query["status"] = { "$ne": "DONE" }

    start = datetime.utcnow().replace(hour=0, minute=0, second=0)
    end = start + timedelta(days=1)

    if dueToday:
        query["dueDate"] = { "$gte": start, "$lt": end }

    skip = (page - 1) * limit 

    sort_direction = -1 if order == "desc" else 1

    cursor = tasks_collection.find(query).sort(sortBy, sort_direction).skip(skip).limit(limit)

    tasks = []
    async for doc in cursor:

        is_overdue = False
        if doc.get("dueDate") and doc["status"] != "DONE":
            is_overdue = doc["dueDate"] < datetime.utcnow()

        tasks.append({
            "id": str(doc["_id"]),
            "title": doc["title"],
            "description": doc.get("description"),
            "status": doc["status"],
            "assigneeId": str(doc["assigneeId"]) if doc.get("assigneeId") else None,
            "priority": doc.get("priority", "MEDIUM"),
            "dueDate": doc.get("dueDate"),
            "isOverdue": is_overdue,
            "createdAt": doc.get("createdAt"),
        })

    total = await tasks_collection.count_documents(query)

    return { 
        "data": tasks,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "totalPages": (total + limit - 1)
        }
    }

@router.patch("/{taskId}")
async def update_task(task_id: str, payload: UpdateTaskRequest, tenant = Depends(get_tenant_context)):
    task = await tasks_collection.find_one({"_id": ObjectId(task_id), "orgId": ObjectId(tenant["org_id"]), "isDeleted": False})

    if not task: 
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    update_data = {}

    # Owner / Admin -> full access
    if tenant["role"] in ["OWNER", "ADMIN"]:
        if payload.title is not None:
            update_data["title"] = payload.title
        if payload.description is not None:
            update_data["description"] = payload.description
        if payload.assigneeId is not None:
            update_data["assigneeId"] = ObjectId(payload.assigneeId)
            await log_activity(
                tenant["org_id"],
                task["projectId"],
                tenant["user_id"],
                "ASSIGNEE_CHANGED",
                "Changed task assignee",
                task["_id"]
            )
        if payload.status is not None:
            update_data["status"] = payload.status
        if payload.labels is not None:
            update_data["labels"] = normalize_labels(payload.labels)
        if payload.priority is not None:
            update_data["priority"] = payload.priority
            update_data["priorityWeight"] = PRIORITY_ORDER[payload.priority]
        if payload.dueDate is not None:
            update_data["dueDate"] = payload.dueDate


    # MEMBER → only assignee + status
    else:
        if not task.get("assigneeId") or str(task["assigneeId"]) != tenant["user_id"]:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can update only tasks assigned to you")

        if (payload.title is not None or payload.description is not None or payload.assigneeId is not None):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Members can update only task status")

        if payload.status is None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Status is required")

        current_status = task["status"]
        new_status = payload.status
        
        allowed = ALLOWED_MEMBER_TRANSITIONS.get(current_status, [])

        if new_status not in allowed:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid status transition from {current_status} to {new_status}")

        update_data["status"] = new_status

        if payload.dueDate is not None:
            raise HTTPException(status_code=400, detail="Members cannot update task due date")

    if not update_data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No valid fields to update")

    await tasks_collection.update_one({"_id": ObjectId(task_id)}, {"$set": update_data})

    await log_activity(
        tenant["org_id"],
        task["projectId"],
        tenant["user_id"],
        "STATUS_CHANGED",
        f"Moved task from {task['status']} to {update_data.get('status')}",
        task["_id"]
    )

    return { "message": "Task updated successfully" }

@router.delete("/{taskId}")
async def delete_task(taskId: str, tenant=Depends(get_tenant_context)):
    task = await tasks_collection.find_one({ 
        "_id": ObjectId(taskId),
        "orgId": ObjectId(tenant["org_id"]),
        "isDeleted": False,
    })

    if not task:
        raise HTTPException(404, "Task not found")

    if tenant["role"] == "MEMBER" and str(task["createdBy"]) != tenant["user_id"]:
        raise HTTPException(403, "You can delete only your own tasks")

    await tasks_collection.update_one(
        { "_id": ObjectId(taskId) },
        { "$set": { "isDeleted": True }}
    )

    return { "message": "Task deleted successfully"}

@router.patch("/{taskId}/archive")
async def archive_task(taskId: str, tenant=Depends(get_tenant_context)):
    task = await tasks_collection.find_one({
        "_id": ObjectId(taskId),
        "orgId": ObjectId(tenant["org_id"]),
        "isDeleted": False
    })

    if not task:
        raise HTTPException(404, "Task not found")

    if tenant["role"] == "MEMBER":
        if not task.get("assigneeId") or str(task["assigneeId"]) != tenant["user_id"]:
            raise HTTPException(403, "You can delete only your own tasks")

    await tasks_collection.update_one(
        { "_id": ObjectId(taskId) },
        { "$set": { "isArchived": True } }
    )

    return { "message": "Task archived successfully"}

@router.get("/{projectId}/activity")
async def get_activity_feed(
    projectId: str,
    tenant=Depends(get_tenant_context)
):
    cursor = project_activities_collection.find({
        "projectId": ObjectId(projectId),
        "orgId": ObjectId(tenant["org_id"])
    }).sort("createdAt", -1).limit(50)

    activities = []
    async for doc in cursor:
        activities.append({
            "message": doc["message"],
            "createdAt": doc["createdAt"]
        })

    return activities