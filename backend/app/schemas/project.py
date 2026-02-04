from pydantic import BaseModel
from typing import Optional

class CreateProjectRequest(BaseModel):
    name: str
    description: Optional[str] = None

class ProjectResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
