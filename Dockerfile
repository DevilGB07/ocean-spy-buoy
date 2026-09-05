# Stage 1: Build React Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# Stage 2: Production Python Runtime
FROM python:3.11-slim
WORKDIR /app

# Install backend dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application and data
COPY backend/ ./backend/
COPY data/ ./data/

# Copy built frontend from Stage 1
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Environment configuration
ENV PORT=8000
ENV MODE=SIMULATION
ENV DATABASE_URL=sqlite:///./ocean_spy_buoy.db

EXPOSE 8000

# Start server using the assigned PORT (compatible with Render, Railway, Fly.io, etc.)
CMD ["sh", "-c", "uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
