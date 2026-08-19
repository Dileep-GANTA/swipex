# =====================================================
# SwipeX / JobMatch-AI — Backend Dockerfile
# =====================================================

FROM python:3.11-slim

# System dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .

RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copy application
COPY app ./app
COPY frontend ./frontend

# Resume directory will be created by the FastAPI application
RUN mkdir -p /app/resumes

# Render provides PORT
ENV PORT=8000

EXPOSE 8000

# Start FastAPI
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT}