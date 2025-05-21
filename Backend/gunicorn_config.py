import multiprocessing
import os

# Server socket
bind = "0.0.0.0:10000"
backlog = 2048

# Worker processes
workers = 2
worker_class = "gthread"
threads = 2
worker_connections = 1000
timeout = 30
keepalive = 2

# Logging
accesslog = "-"
errorlog = "-"
loglevel = "info"

# Process naming
proc_name = "brand_sentiment_analysis"

# Server mechanics
daemon = False
pidfile = None
umask = 0
user = None
group = None
tmp_upload_dir = "/dev/shm"

# Memory management
max_requests = 1000
max_requests_jitter = 50
worker_tmp_dir = "/dev/shm"

# SSL
keyfile = None
certfile = None 