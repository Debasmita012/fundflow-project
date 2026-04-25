# ============================================================
# main.py  —  FastAPI Entrypoint for FundFlow Backend
# ============================================================
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from db.postgres import engine, Base
from routers import accounts, alerts, transactions, graph, reports, auth
from routers.auth import get_current_user
from fastapi import Depends
from ws import stream


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Setup database on startup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    # Cleanup on shutdown
    await engine.dispose()


app = FastAPI(
    title="FundFlow API",
    description="Backend API for the FundFlow Fraud Detection dashboard.",
    version="1.0.0",
    lifespan=lifespan
)

# Allow CORS for the frontend to communicate with the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "FundFlow Backend is running. Access /docs for API documentation."}

# Public auth router
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])

# Protected API routers
app.include_router(accounts.router, prefix="/api/accounts", tags=["Accounts"], dependencies=[Depends(get_current_user)])
app.include_router(transactions.router, prefix="/api/transactions", tags=["Transactions"], dependencies=[Depends(get_current_user)])
app.include_router(graph.router, prefix="/api/graph", tags=["Graph Analytics"], dependencies=[Depends(get_current_user)])
app.include_router(alerts.router, prefix="/api/alerts", tags=["Alerts"], dependencies=[Depends(get_current_user)])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports & AI Chat"], dependencies=[Depends(get_current_user)])

# Include WebSocket stream router
app.include_router(stream.router, tags=["WebSocket Stream"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
