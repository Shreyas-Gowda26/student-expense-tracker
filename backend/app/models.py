from sqlalchemy import Column, Integer, Float, String, Date

from .database import Base


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)

    amount = Column(Float, nullable=False)

    category = Column(
        String,
        nullable=False
    )

    description = Column(
        String,
        nullable=True
    )

    expense_date = Column(
        Date,
        nullable=False
    )