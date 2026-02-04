from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth, organization, project, task, test, task_comments

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
        "name": "Task Comments",
        "description": "Comments inside project's tasks"
    },
    {
        "name": "Test",
        "description": "Test API"
    }
]

app = FastAPI(title="Multi Tenant Workspace API", openapi_tags=tags_metadata)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(organization.router)
app.include_router(project.router)
app.include_router(task.router)
app.include_router(task_comments.router)
app.include_router(test.router)

@app.get("/")
def root():
    return {"message": "Welcome to Multi Tenant Workspace! 🚀 Go to /docs for API documentation"} 