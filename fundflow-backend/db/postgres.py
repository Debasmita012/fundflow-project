# ============================================================
# db/postgres.py  —  Database configuration (SQLite under the hood)
# ============================================================
import os
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base, Mapped, mapped_column
from sqlalchemy import Integer, String, Float, Boolean, DateTime
from datetime import datetime

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./fundflow.db")

engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
Base = declarative_base()


class Account(Base):
    __tablename__ = "accounts"

    id: Mapped[str] = mapped_column(String, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, index=True)
    type: Mapped[str] = mapped_column(String)
    risk: Mapped[str] = mapped_column(String, index=True)
    risk_score: Mapped[int] = mapped_column(Integer, default=0)
    declared_income: Mapped[str] = mapped_column(String, default="0")
    inflow_30d: Mapped[str] = mapped_column(String, default="0")
    outflow_30d: Mapped[str] = mapped_column(String, default="0")
    connections: Mapped[int] = mapped_column(Integer, default=0)
    branch: Mapped[str] = mapped_column(String, default="Main")
    kyc_status: Mapped[str] = mapped_column(String, default="Verified")


class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    source_id: Mapped[str] = mapped_column(String, index=True)
    target_id: Mapped[str] = mapped_column(String, index=True)
    amount: Mapped[float] = mapped_column(Float, default=0.0)
    channel: Mapped[str] = mapped_column(String, index=True)
    txn_time: Mapped[str] = mapped_column(String)
    txn_date: Mapped[str] = mapped_column(String)
    flagged: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    pattern_tag: Mapped[str] = mapped_column(String, nullable=True)


class Alert(Base):
    __tablename__ = "alerts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    account_id: Mapped[str] = mapped_column(String, index=True)
    name: Mapped[str] = mapped_column(String)
    desc: Mapped[str] = mapped_column(String)
    amount: Mapped[str] = mapped_column(String)
    risk_level: Mapped[str] = mapped_column(String, index=True)
    amount_class: Mapped[str] = mapped_column(String)
    resolved: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
