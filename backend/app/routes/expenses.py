from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..database import get_db
from ..models import Expense, User
from ..schemas import ExpenseCreate, ExpenseResponse


router = APIRouter(
    prefix="/expenses",
    tags=["Expenses"]
)


# CREATE
@router.post(
    "/",
    response_model=ExpenseResponse
)
def create_expense(
    expense: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_expense = Expense(
        user_id=current_user.id,
        amount=expense.amount,
        category=expense.category,
        description=expense.description,
        expense_date=expense.expense_date
    )

    db.add(new_expense)
    db.commit()
    db.refresh(new_expense)

    return new_expense


# READ ALL
@router.get(
    "/",
    response_model=list[ExpenseResponse]
)
def get_expenses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Expense).filter(
        Expense.user_id == current_user.id
    ).all()

# SUMMARY
@router.get(
    "/summary"
)
def expense_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    expenses = db.query(Expense).filter(
        Expense.user_id == current_user.id
    ).all()

    total = sum(expense.amount for expense in expenses)

    return {
        "total_expenses": len(expenses),
        "total_amount": total
    }

# READ ONE
@router.get(
    "/{expense_id}",
    response_model=ExpenseResponse
)
def get_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    expense = db.query(Expense).filter(
        Expense.id == expense_id,
        Expense.user_id == current_user.id
    ).first()

    if not expense:
        raise HTTPException(
            status_code=404,
            detail="Expense not found"
        )

    return expense


# UPDATE
@router.put(
    "/{expense_id}",
    response_model=ExpenseResponse
)
def update_expense(
    expense_id: int,
    expense_data: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    expense = db.query(Expense).filter(
        Expense.id == expense_id,
        Expense.user_id == current_user.id
    ).first()

    if not expense:
        raise HTTPException(
            status_code=404,
            detail="Expense not found"
        )

    expense.amount = expense_data.amount
    expense.category = expense_data.category
    expense.description = expense_data.description
    expense.expense_date = expense_data.expense_date

    db.commit()
    db.refresh(expense)

    return expense


# DELETE
@router.delete(
    "/{expense_id}"
)
def delete_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    expense = db.query(Expense).filter(
        Expense.id == expense_id,
        Expense.user_id == current_user.id
    ).first()

    if not expense:
        raise HTTPException(
            status_code=404,
            detail="Expense not found"
        )

    db.delete(expense)
    db.commit()

    return {
        "message": "Expense deleted successfully"
    }


