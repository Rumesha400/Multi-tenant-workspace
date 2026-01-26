from pydantic import BaseModel

class AddProjectMemberRequest(BaseModel):
    user_id: str 