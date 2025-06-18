FROM python:3.12-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    python3-dev \
    python3-pip \
    python3-setuptools \
    python3-wheel \
    python3-cffi \
    libcairo2 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libgdk-pixbuf2.0-0 \
    libffi-dev \
    shared-mime-info \
    libglib2.0-0 \
    libglib2.0-dev \
    libgirepository1.0-dev \
    gir1.2-gtk-3.0 \
    pkg-config \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set environment variables for library paths
ENV LD_LIBRARY_PATH=/usr/lib:/usr/local/lib
ENV GI_TYPELIB_PATH=/usr/lib/girepository-1.0
ENV PKG_CONFIG_PATH=/usr/lib/pkgconfig

# Set working directory
WORKDIR /app

# Copy requirements first to leverage Docker cache
COPY requirements.txt .

# Install Python dependencies with optimizations
RUN pip install --no-cache-dir -r requirements.txt && \
    rm -rf /root/.cache/pip/* && \
    find /usr/local/lib/python3.12/site-packages -name "*.pyc" -delete && \
    find /usr/local/lib/python3.12/site-packages -name "*.pyo" -delete && \
    find /usr/local/lib/python3.12/site-packages -name "__pycache__" -delete

# Download NLTK data
RUN python -c "import nltk; nltk.download('punkt'); nltk.download('stopwords')"

# Copy the rest of the application
COPY . .

# Create a non-root user
RUN useradd -m appuser && chown -R appuser:appuser /app
USER appuser

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV LOG_LEVEL="DEBUG"

# Create startup script
RUN echo '#!/bin/bash\n\
echo "Starting application..."\n\
\n\
# Wait for the application to be ready\n\
echo "Waiting for application to be ready..."\n\
sleep 30\n\
\n\
# Start the application with uvicorn\n\
echo "Starting uvicorn..."\n\
exec python -m uvicorn main:app --host 0.0.0.0 --port 8080 --workers 1 --timeout-keep-alive 75 --log-level debug\n\
' > /app/start.sh && chmod +x /app/start.sh

# Expose port
EXPOSE 8080

# Set healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/ping || exit 1

# Use the startup script
CMD ["/app/start.sh"]