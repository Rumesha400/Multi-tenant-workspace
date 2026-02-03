from fastapi import APIRouter, Depends, HTTPException, status 
from bson import ObjectId 
from datetime import datetime 
from app.schemas.task_comment import CreateCommentRequest, CommentResponse
from app.core.tenant import get_tenant_context 
from app.db.mongo import(
    tasks_collection,
    project_members_collection,
    task_comments_collection
)

router = APIRouter(prefix="/tasks", tags=["Task Comments"])

@router.post("/{taskId}/comments", status_code=status.HTTP_201_CREATED)
async def add_comment( taskId: str, payload: CreateCommentRequest, tenant=Depends(get_tenant_context)):
    task = await tasks_collection.find_one({
        "_id": ObjectId(taskId),
        "orgId": ObjectId(tenant["org_id"]),
        "isDeleted": False
    })
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    
    is_member = await project_members_collection.find_one({
        "projectId": task["projectId"],
        "userId": ObjectId(tenant["user_id"]),
        "orgId": ObjectId(tenant["org_id"]),
    })
    if not is_member:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You are not a member of this project")
    
    comment_doc = {
        "taskId": ObjectId(taskId),
        "projectId": task["projectId"],
        "orgId": ObjectId(tenant["org_id"]),
        "userId": ObjectId(tenant["user_id"]),
        "comment": payload.comment,
        "createdAt": datetime.utcnow(),
    }

    result = await task_comments_collection.insert_one(comment_doc)

    return {
        "id": str(result.inserted_id),
        "userId": tenant["user_id"],
        "comment": payload.comment,
        "createdAt": comment_doc["createdAt"],
    }
    
@router.get("/{taskId}/comments")
async def list_comments(taskId: str, tenant=Depends(get_tenant_context)):
    task = await tasks_collection.find_one({
        "_id": ObjectId(taskId),
        "orgId": ObjectId(tenant["org_id"]),
        "isDeleted": False
    })
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    
    is_member = await project_members_collection.find_one({
        "projectId": task["projectId"],
        "userId": ObjectId(tenant["user_id"]),
        "orgId": ObjectId(tenant["org_id"]),
    })
    if not is_member:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    cursor = task_comments_collection.find({ "taskId": ObjectId(taskId)}).sort("createdAt", 1)

    comments = [] 
    async for doc in cursor:
        comments.append({
            "id": str(doc["_id"]),
            "userId": str(doc["userId"]),
            "comment": doc["comment"],
            "createdAt": doc["createdAt"],
        })
    return comments
    