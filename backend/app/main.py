from fastapi import FastAPI
from app.routes import auth, organization, project, task, test

app = FastAPI(title="Multi Tenant Workspace API")

app.include_router(auth.router)
app.include_router(organization.router)
app.include_router(project.router)
app.include_router(task.router)
app.include_router(test.router)

@app.get("/")
def root():
    return {"message": "Welcome to Multi Tenant Workspace! 🚀 Go to /docs for API documentation"} 