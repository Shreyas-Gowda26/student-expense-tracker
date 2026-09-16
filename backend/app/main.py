from fastapi import FastAPI

from .database import Base, engine
from .routes.expenses import router as expense_router


Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="Student Expense Tracker",
    description="API for managing student expenses",
    version="1.0.0"
)


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