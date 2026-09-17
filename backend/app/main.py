from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from .routes.expenses import router as expense_router
from .routes.auth import router as auth_router


Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="Student Expense Tracker",
    description="API for managing student expenses",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router)
app.include_router(expense_router)


@app.get("/")
def root():
    return {
        "message": "Student Expense Tracker API is running!"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }