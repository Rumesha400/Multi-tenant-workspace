from fastapi import FastAPI
from app.routes import auth, organization, project, task, test

tags_metadata = [
    {
        "name": "Auth",
        "description": "Authentication & identity management (signup, login, tokens)"
    },
    {
        "name": "Organization",
        "description": "Organization & workspace management"
    },
    {
        "name": "Projects",
        "description": "Project creation and project-level access control"
    },
    {
        "name": "Tasks",
        "description": "Task management inside projects"
    },
    {
        "name": "Test",
        "description": "Test API"
    }
]

app = FastAPI(title="Multi Tenant Workspace API", openapi_tags=tags_metadata)

app.include_router(auth.router)
app.include_router(organization.router)
app.include_router(project.router)
app.include_router(task.router)
app.include_router(test.router)

@app.get("/")
def root():
    return {"message": "Welcome to Multi Tenant Workspace! 🚀 Go to /docs for API documentation"} 