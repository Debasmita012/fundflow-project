# ============================================================
# routers/alerts.py  —  Alert endpoints
# Save this at:  fundflow-backend/routers/alerts.py
# ============================================================
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from db.postgres import get_db, Alert as AlertModel

router = APIRouter()


class AlertOut(BaseModel):
    id: int
    account_id: str
    name: str
    desc: str
    amount: str
    risk_level: str
    amount_class: str
    resolved: bool

    class Config:
        from_attributes = True


@router.get("/", response_model=List[AlertOut])
async def list_alerts(
    risk_level: Optional[str]  = Query(None),
    resolved:   Optional[bool] = Query(False),
    limit:      int            = Query(50),
    db:         AsyncSession   = Depends(get_db),
):
    q = select(AlertModel)
    if risk_level:
        q = q.where(AlertModel.risk_level == risk_level)
    if resolved is not None:
        q = q.where(AlertModel.resolved == resolved)
    q = q.limit(limit).order_by(AlertModel.created_at.desc())
    result = await db.execute(q)
    return result.scalars().all()


@router.post("/{alert_id}/resolve")
async def resolve_alert(alert_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(AlertModel).where(AlertModel.id == alert_id))
    alert  = result.scalar_one_or_none()
    if not alert:
        raise HTTPException(404, "Alert not found")
    alert.resolved = True
    await db.commit()
    return {"status": "resolved", "id": alert_id}