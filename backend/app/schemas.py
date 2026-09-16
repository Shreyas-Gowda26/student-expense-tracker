from datetime import date

from pydantic import BaseModel


class ExpenseCreate(BaseModel):
    amount: float
    category: str
    description: str | None = None
    expense_date: date


class ExpenseResponse(BaseModel):
    id: int
    amount: float
    category: str
    description: str | None
    expense_date: date

    class Config:
        from_attributes = True