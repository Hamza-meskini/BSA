# --- main.py ---
from fastapi import FastAPI, HTTPException, Body, Request, Security, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, Response, JSONResponse
from fastapi.security.api_key import APIKeyHeader
from pydantic import BaseModel
from typing import Dict, List, Any, Optional
# Import only the specific function needed from API2.py
# The import itself will trigger the model loading in API2.py
from API import analyze_brand
from pdf_generator import PDFGenerator
import logging # Configure logging for main app too
from datetime import datetime
import os
from dotenv import load_dotenv
import secrets
import shutil

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create the main FastAPI application instance
app = FastAPI(title="Brand Sentiment Analysis API")

# Get frontend URL and API key from environment variables
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:9002")
API_KEY = os.getenv("API_KEY", secrets.token_urlsafe(32))

# API Key security
API_KEY_NAME = "X-API-Key"
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=True)

async def get_api_key(api_key_header: str = Security(api_key_header)):
    if api_key_header != API_KEY:
        logger.warning(f"Invalid API key attempt: {api_key_header[:10]}...")
        raise HTTPException(
            status_code=403,
            detail="Invalid API Key"
        )
    return api_key_header

# Add CORS middleware with strict configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# Add security headers middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    logger.info(f"Processing request: {request.method} {request.url.path}")
    response = await call_next(request)
    # Only add CORS headers for non-health check requests
    if request.url.path != "/":
        response.headers["Access-Control-Allow-Origin"] = "http://localhost:9002"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = f"Content-Type, Accept, {API_KEY_NAME}, Origin"
        response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    return response

# Add request validation middleware
@app.middleware("http")
async def validate_request(request: Request, call_next):
    # Skip validation for OPTIONS requests and root endpoint
    if request.method == "OPTIONS" or request.url.path == "/":
        return await call_next(request)
        
    # Check if request is coming from allowed origin
    origin = request.headers.get("origin")
    if origin and origin != "http://localhost:9002":
        logger.warning(f"Blocked request from unauthorized origin: {origin}")
        raise HTTPException(status_code=403, detail="Unauthorized origin")
    
    # Check for required headers
    if request.method in ["POST", "PUT"]:
        content_type = request.headers.get("content-type", "")
        if not content_type.startswith("application/json"):
            raise HTTPException(status_code=400, detail="Content-Type must be application/json")
    
    # Check for API key in headers for frontend requests
    if origin == "http://localhost:9002":
        api_key = request.headers.get(API_KEY_NAME)
        if not api_key or api_key != API_KEY:
            logger.warning(f"Missing or invalid API key from {request.client.host}")
            raise HTTPException(status_code=403, detail="Invalid API Key")
    
    response = await call_next(request)
    return response

class SentimentData(BaseModel):
    count: float
    percentage: float

class TopicData(BaseModel):
    keywords: List[str]
    representative_posts: List[str]

class PDFReportData(BaseModel):
    analysis_data: Dict[str, Any]
    sentiment_data: Dict[str, SentimentData]
    emotion_data: Dict[str, SentimentData]
    topic_data: List[TopicData]

# --- API Endpoint ---
@app.get("/api/{brand_name}/{days_ago}")
async def api_analyze_brand_endpoint(
    brand_name: str, 
    days_ago: int,
    api_key: str = Depends(get_api_key)
):
    """
    Analyzes sentiment for a given brand using data from Twitter,
    Reddit, and Google News over a specified number of past days.
    """
    logger.info(f"Received API request for brand: {brand_name}, days: {days_ago}")
    if days_ago <= 0:
        raise HTTPException(status_code=400, detail="days_ago parameter must be positive.")
    try:
        results = await analyze_brand(brand_name, days_ago)
        logger.info(f"Successfully completed analysis for {brand_name}")
        return results
    except Exception as e:
        logger.exception(f"An unexpected error occurred during analysis for {brand_name}: {e}")
        raise HTTPException(status_code=500, detail=f"An internal error occurred during analysis.")

@app.post("/generate-pdf-report")
async def generate_pdf_report(request: Request):
    try:
        data = await request.json()
        logger.info(f"Received data for PDF generation: {data}")
        
        # Extract data from request
        analysis_data = data.get('analysis_data', {})
        sentiment_data = data.get('sentiment_data', {})
        emotion_data = data.get('emotion_data', {})
        topic_data = data.get('topic_data', {})
        charts = data.get('charts', [])
        ai_analysis = data.get('ai_analysis', {})
        platform_stats = data.get('platform_stats', {})
        
        # Generate PDF
        pdf_generator = PDFGenerator()
        pdf_path, temp_dir = pdf_generator.generate_pdf(
            analysis_data=analysis_data,
            sentiment_data=sentiment_data,
            emotion_data=emotion_data,
            topic_data=topic_data,
            charts=charts,
            ai_analysis=ai_analysis,
            platform_stats=platform_stats
        )
        
        # Read the PDF file
        with open(pdf_path, 'rb') as f:
            pdf_content = f.read()
        
        # Clean up the temporary directory
        shutil.rmtree(temp_dir)
        
        # Return the PDF file
        return Response(
            content=pdf_content,
            media_type='application/pdf',
            headers={
                'Content-Disposition': 'attachment; filename=report.pdf'
            }
        )
    except Exception as e:
        logger.error(f"Error generating PDF: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

# --- Root Endpoint ---
@app.get("/")
async def root():
    """
    Root endpoint for health check.
    """
    logger.info("Health check request received")
    return JSONResponse(
        content={"status": "healthy"},
        status_code=200
    )

# --- Other Example/Utility Endpoints ---
@app.get("/hello/{name}")
async def say_hello(name: str):
    """
    Simple endpoint to say hello.
    """
    return {"message": f"Hello {name}"}

# Add favicon route to prevent 404 errors in browsers
@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    # Returns a 204 No Content response.
    # Alternatively, return Response(content=favicon_bytes, media_type="image/x-icon")
    return Response(status_code=204)

# --- How to Run ---
# Save this file as main.py and API2.py in the same directory.
# Replace placeholder API keys in API2.py.
# Install requirements: pip install fastapi uvicorn requests praw pandas dateparser transformers torch "asyncio" # asyncio is built-in
# Run from terminal: uvicorn main:app --reload --port 8000
# Access in browser or via API client: http://127.0.0.1:8000/api/YOUR_BRAND_NAME/NUMBER_OF_DAYS
# Example: http://127.0.0.1:8000/api/Tesla/3

# --- End of main.py ---