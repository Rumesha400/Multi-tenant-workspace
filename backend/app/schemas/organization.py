from pydantic import BaseModel

class CreateOrgRequest(BaseModel):
    name: str

class AddOrgMemberRequest(BaseModel):
    user_id: str
