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
    && rm -rf /var/lib/apt/lists/*

# Set environment variables for library paths
ENV LD_LIBRARY_PATH=/usr/lib:/usr/local/lib
ENV GI_TYPELIB_PATH=/usr/lib/girepository-1.0
ENV PKG_CONFIG_PATH=/usr/lib/pkgconfig

# Set working directory
WORKDIR /app

# Copy requirements first to leverage Docker cache
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Download NLTK data
RUN python -c "import nltk; nltk.download('punkt'); nltk.download('stopwords')"

# Copy the rest of the application
COPY . .

# Expose the port the app runs on
EXPOSE 10000

# Command to run the application with reduced worker count and memory settings
CMD ["gunicorn", "main:app", "--config", "gunicorn_config.py", "--workers", "2", "--threads", "2", "--worker-class", "gthread", "--worker-tmp-dir", "/dev/shm"] 