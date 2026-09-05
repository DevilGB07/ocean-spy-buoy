# OCEAN SPY-BUOY

> **Tagline:** *"Don't Ask the Ship Where It Is. Ask the Ocean."*

[![Python 3.11](https://img.shields.io/badge/python-3.11-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg)](https://fastapi.tiangolo.com)
[![React 18](https://img.shields.io/badge/React-18.2-61DAFB.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178C6.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC.svg)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 1. Executive Summary & Problem

Modern maritime surveillance relies overwhelmingly on the **Automatic Identification System (AIS)**. However, AIS is an **unauthenticated RF broadcast** that can be spoofed, tampered with, or deliberately powered down ("going dark") by vessels engaged in illicit transshipment, illegal fishing, or sanctions evasion.

**Ocean Spy-Buoy** introduces an **autonomous, physical sensing ground truth layer**. By combining passive underwater hydrophones, TinyML acoustic vessel classification, geodetic bearing localization, optical camera confirmation, and automated cross-referencing with AIS transponder broadcasts, the system detects maritime discrepancies in real-time, calculates explainable investigation priorities (0–100), and registers immutable, tamper-evident SHA-256 + ECDSA evidence.

---

## 2. Core Surveillance Pipeline

```
                                    HYDROPHONE / ACOUSTIC INGEST
                                                 │
                                                 ▼
                                     AUDIO SIGNAL PREPROCESSING
                               (Waveform & 48 kHz FFT Spectrogram)
                                                 │
                                                 ▼
                                     AI TINYML CLASSIFICATION
                               (Tanker, Cargo, Fishing, Passenger)
                                                 │
                                                 ▼
                                       GEODETIC LOCALIZATION
                                    (Forward Azimuth / Bearing)
                                                 │
                                                 ▼
                                     AIS SPATIO-TEMPORAL MATCH
                               (Proximity, Timestamp, Type Match)
                                                 │
                                                 ▼
                                      OPTICAL CAMERA CONTACT
                                (Surface Verification Silhouette)
                                                 │
                                                 ▼
                                        SENSOR FUSION UNIT
                                                 │
                                                 ▼
                                    EXPLAINABLE RISK ENGINE (0-100)
                                                 │
                                                 ▼
                                  TAMPER-EVIDENT EVIDENCE HASHING
                               (Canonical JSON + SHA-256 + ECDSA)
                                                 │
                                                 ▼
                                      SECURITY ALERT DISPATCH
                                (Threshold Filter: Risk >= 60/100)
                                                 │
                                                 ▼
                                   REAL-TIME WEBSOCKET BROADCAST
                                 (/ws/events to Command Dashboard)
```

---

## 3. Demo Benchmark Scenarios

The system natively implements the 3 core presentation scenarios:

### Scenario 1 — Verified Vessel
- **Acoustic:** Tanker (91% AI confidence)
- **AIS:** Matching Tanker nearby (0.8 km)
- **Camera:** Surface vessel confirmed
- **Result:** `VERIFIED VESSEL`
- **Risk Score:** Low (< 30)

### Scenario 2 — AIS Mismatch
- **Acoustic:** Tanker (91% AI confidence)
- **AIS:** Cargo vessel broadcast nearby
- **Camera:** Surface vessel confirmed
- **Result:** `PHYSICAL/AIS DISCREPANCY`
- **Risk Score:** Medium / High (~68)

### Scenario 3 — Possible Dark Vessel (The 3-Minute Demo Benchmark)
- **Acoustic:** Tanker (91% AI confidence)
- **AIS:** No active transponder transmission found
- **Camera:** Vessel confirmed on surface
- **Result:** `POSSIBLE DARK VESSEL`
- **Risk Score:** **82 / 100** (Critical Investigation Priority)
- **Evidence:** SHA-256 Hash Verified & Signed

---

## 4. Project Structure

```
ocean-spy-buoy/
│
├── frontend/                     # React + TypeScript + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/           # LeafletMap, HeroThreatCard, AcousticWaveform, ForensicTimeline
│   │   ├── pages/                # Dashboard, Live, Vessels, AIS, Alerts, Evidence, Analytics, Buoys, Settings
│   │   ├── layouts/              # TopStatusBar, Navbar, SimulationControlBar
│   │   ├── hooks/                # useWebSocket
│   │   ├── services/             # api.ts (REST client)
│   │   ├── types/                # TypeScript data interfaces
│   │   ├── App.tsx               # Master router and alert toast manager
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── backend/                      # FastAPI + SQLAlchemy + SQLite + WebSockets
│   ├── app/
│   │   ├── main.py               # FastAPI application entrypoint & WebSocket endpoint
│   │   ├── config.py             # Configurable thresholds & settings
│   │   ├── database.py           # SQLite connection & session maker
│   │   ├── models/               # SQLAlchemy models (Buoy, Detection, AISVessel, Alert, EvidenceRecord)
│   │   ├── schemas/              # Pydantic request/response schemas
│   │   ├── routers/              # REST endpoints (health, buoys, detections, ais, risk, alerts, evidence, simulation, analytics)
│   │   ├── services/             # ais_matching_service, localization_service, camera_service, risk_engine, sensor_fusion_service
│   │   ├── ai/                   # BaseVesselClassifier, DemoClassifier (TinyML abstraction)
│   │   ├── security/             # hashing.py (SHA-256 canonicalization), ecdsa_signer.py (NIST P-256)
│   │   ├── simulation/           # simulation_engine.py & seeders
│   │   └── websocket/            # connection_manager.py
│   ├── requirements.txt
│   └── test_pipeline.py          # Automated test suite
│
├── data/
│   ├── ais/                      # Sample AIS vessel records
│   ├── audio/                    # Acoustic vessel frequency signatures
│   └── demo/                     # Scenario benchmarks
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 5. Quickstart Guide

### Prerequisites
- **Python 3.11+**
- **Node.js 18+** & **npm**

### Step 1: Start the Backend Service
```bash
# Navigate to project root
cd ocean-spy-buoy

# Install Python dependencies
pip install -r backend/requirements.txt

# Launch FastAPI server with live reload
uvicorn backend.app.main:app --reload --port 8000
```
*The SQLite database (`ocean_spy_buoy.db`) initializes and seeds simulated buoys, AIS vessels, and historical telemetry automatically on launch.*

- REST API Documentation: [http://localhost:8000/docs](http://localhost:8000/docs)
- Alternative API Specs: [http://localhost:8000/redoc](http://localhost:8000/redoc)

### Step 2: Start the Frontend Command Center
```bash
# In a separate terminal
cd ocean-spy-buoy/frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
- Open Browser: [http://localhost:5173](http://localhost:5173)

---

## 6. How to Run the 3-Minute Demo

1. **0:00 - Introduction**: Open the dashboard at [http://localhost:5173](http://localhost:5173). Point out the **Tactical Radar Map**, active **Buoy OSB-001**, and the **Live WebSocket Sync** badge in the status bar.
2. **0:40 - Trigger Simulation**: Click the glowing red button on the top toolbar: **`[ SIMULATE DARK VESSEL ]`**.
3. **1:00 - Physical Acoustic Ingest**: Observe the animated **Hydrophone Waveform** and real-time **FFT Spectrogram** simulating low-frequency engine cavitation (142.5 Hz).
4. **1:20 - AI TinyML Classification**: Observe the AI classify the acoustic signature as **Tanker** with **91% confidence**.
5. **1:40 - AIS Cross-Match**: Point out the AIS correlation status returning **`NO AIS MATCH`** (no active transponders in detection perimeter).
6. **2:00 - Optical Camera Confirmation**: Observe the mast camera confirming surface vessel silhouette at 127° bearing.
7. **2:20 - Explainable Risk Score**: The Hero Threat card turns Crimson Red with **`POSSIBLE DARK VESSEL`** and an investigation priority of **82 / 100**.
8. **2:40 - Cryptographic Verification**: Click **`INVESTIGATE EVENT`** $\rightarrow$ Click **`RE-VERIFY INTEGRITY`** to demonstrate real-time deterministic SHA-256 and ECDSA cryptographic proof of non-repudiation.
9. **3:00 - Wrap-up**: Highlight the tactical map bearing line connecting Buoy OSB-001 to the estimated coordinates (19.0760° N, 72.8777° E).

---

## 7. Real Hardware Integration Roadmap

The software architecture is deliberately built with production hardware ingest endpoints:

```
[ ESP32-S3 Microcontroller ]
            │
            ├── Hydrophone Array (I2S ADC / 48 kHz)
            ├── GPS Module (NMEA 0183 / UART)
            └── On-device TinyML TFLite Micro Model
            │
            ▼
    POST /api/v1/detections
    {
      "buoy_id": "OSB-001",
      "timestamp": "2026-09-05T12:00:00Z",
      "gps": { "latitude": 19.0760, "longitude": 72.8777 },
      "bearing": 127.0,
      "distance_km": 1.2,
      "vessel_type_override": "Tanker"
    }
```

The FastAPI pipeline processes hardware telemetry through the exact same sensor fusion, localization, and evidence generation pipeline.

---

## 8. Scientific & Ethical Disclaimers

In compliance with ethical surveillance practices:
- **Simulated AIS Data**: All AIS transponder positions are generated via simulation for hackathon demonstration.
- **Approximate Localization**: Geodetic positions are prototype estimations based on single-node bearing and acoustic range models.
- **Non-Presumptive Terminology**: An AIS discrepancy is categorized as a *"Possible Dark Vessel"* or *"Physical/AIS Discrepancy"* and indicates that *investigation is required*. It does **not** constitute legal proof of illicit activity.

---

## 9. License

Developed for the Ocean Spy-Buoy Hackathon. Released under the MIT License.
