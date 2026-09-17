from sqlalchemy import Column, Integer, Float, String, Date, ForeignKey

from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(
        String,
        nullable=False
    )

    email = Column(
        String,
        unique=True,
        nullable=False,
        index=True
    )

    hashed_password = Column(
        String,
        nullable=False
    )


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

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