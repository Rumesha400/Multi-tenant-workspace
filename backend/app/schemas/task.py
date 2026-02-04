from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class CreateTaskRequest(BaseModel):
    title: str 
    description: Optional[str] = None 
    assigneeId: Optional[str] = None 
    priority: Optional[str] = "MEDIUM"
    labels: Optional[List[str]] = Field(default_factory=list)
    dueDate: Optional[datetime] = None

class TaskResponse(BaseModel):
    id: str
    title: str 
    description: Optional[str]
    status: str 
    assigneeId: Optional[str] 
    dueDate: Optional[datetime]

class UpdateTaskRequest(BaseModel):
    title: Optional[str] = None 
    description: Optional[str] = None 
    status: Optional[str] = None 
    assigneeId: Optional[str] = None
    priority: Optional[str] = None
    labels: Optional[List[str]]
    dueDate: Optional[datetime] = None