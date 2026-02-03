from pydantic import BaseModel, Field
from bson import ObjectId
from typing import Optional
from datetime import datetime

class Project(BaseModel):
    name: str 
    description: Optional[str] = None
    orgId: ObjectId
    createdBy: ObjectId
    createdAt: datetime = Field(default_factory=datetime.utcnow)