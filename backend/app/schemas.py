from datetime import date

from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


class ExpenseCreate(BaseModel):
    amount: float
    category: str
    description: str | None = None
    expense_date: date


class ExpenseResponse(BaseModel):
    id: int
    user_id: int
    amount: float
    category: str
    description: str | None
    expense_date: date

    class Config:
        from_attributes = True