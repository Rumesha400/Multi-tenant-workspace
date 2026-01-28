from pydantic import BaseModel 
from typing import Optional
from datetime import datetime

class CreateTaskRequest(BaseModel):
    title: str 
    description: Optional[str] = None 
    assigneeId: Optional[str] = None 

class TaskResponse(BaseModel):
    id: str
    title: str 
    description: Optional[str]
    status: str 
    assigneeId: Optional[str] 

class UpdateTaskRequest(BaseModel):
    title: Optional[str] = None 
    description: Optional[str] = None 
    status: Optional[str] = None 
    assigneeId: Optional[str] = None
