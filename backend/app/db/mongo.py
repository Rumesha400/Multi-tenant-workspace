from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URL = "mongodb://localhost:27017"

client = AsyncIOMotorClient(MONGO_URL)

db = client["multi_tenant_workspace"]

users_collection = db["users"]

organizations_collection = db["organizations"]

projects_collection = db["projects"]

tasks_collection = db["tasks"]

project_members_collection = db["project_members"]

org_members_collection = db["org_members"]
