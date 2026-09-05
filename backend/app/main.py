import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import engine, Base, SessionLocal
from app.simulation.simulation_engine import seed_initial_data
from app.websocket.connection_manager import manager

# Routers
from app.routers import (
    health,
    buoys,
    detections,
    ai,
    ais,
    risk,
    alerts,
    evidence,
    simulation,
    analytics,
    settings as settings_router
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("OceanSpy")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure tables and initial simulated datasets
    logger.info("Initializing Ocean Spy-Buoy database tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        logger.info("Seeding realistic simulation maritime data...")
        seed_initial_data(db)
    finally:
        db.close()
        
    logger.info("Ocean Spy-Buoy System Online - Ready for Telemetry & Simulation.")
    yield
    logger.info("Ocean Spy-Buoy System Shutting Down...")

app = FastAPI(
    title=settings.APP_NAME,
    description="""
    ## Ocean Spy-Buoy - Maritime Surveillance System
    *Tagline: "Don't Ask the Ship Where It Is. Ask the Ocean."*
    
    An autonomous physical sensing surveillance layer for maritime domain awareness.
    Cross-references underwater acoustic signatures and optical detection with AIS broadcasts,
    computes explainable risk scores, and logs tamper-evident SHA-256 / ECDSA evidence.
    """,
    version=settings.VERSION,
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# WebSocket Endpoint
@app.websocket("/ws/events")
async def websocket_events(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Keepalive / handle optional client pings
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket)

# Mount REST Routers under /api/v1
api_v1 = "/api/v1"
app.include_router(health.router, prefix=api_v1)
app.include_router(buoys.router, prefix=api_v1)
app.include_router(detections.router, prefix=api_v1)
app.include_router(ai.router, prefix=api_v1)
app.include_router(ais.router, prefix=api_v1)
app.include_router(risk.router, prefix=api_v1)
app.include_router(alerts.router, prefix=api_v1)
app.include_router(evidence.router, prefix=api_v1)
app.include_router(simulation.router, prefix=api_v1)
app.include_router(analytics.router, prefix=api_v1)
app.include_router(settings_router.router, prefix=api_v1)
