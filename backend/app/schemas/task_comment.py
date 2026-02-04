from pydantic import BaseModel 
from datetime import datetime

class CreateCommentRequest(BaseModel):
    comment: str 

class CommentResponse(BaseModel):
    id: str 
    userId: str 
    comment: str 
    createdAt: datetime 
    