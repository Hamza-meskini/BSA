# --- main.py ---
from fastapi import FastAPI, HTTPException, Body, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Dict, List, Any, Optional
# Import only the specific function needed from API2.py
# The import itself will trigger the model loading in API2.py
from API import analyze_brand
from pdf_generator import PDFGenerator
import logging # Configure logging for main app too
from datetime import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create the main FastAPI application instance
app = FastAPI(title="Brand Sentiment Analysis API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:9002", "http://127.0.0.1:9002", "http://localhost:9003", "http://127.0.0.1:9003"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*", "Content-Type", "Accept", "Authorization"],
    expose_headers=["*"]
)

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
async def api_analyze_brand_endpoint(brand_name: str, days_ago: int):
    """
    Analyzes sentiment for a given brand using data from Twitter,
    Reddit, and Google News over a specified number of past days.
    """
    logger.info(f"Received API request for brand: {brand_name}, days: {days_ago}")
    if days_ago <= 0:
        raise HTTPException(status_code=400, detail="days_ago parameter must be positive.")
    try:
        # Directly call the imported async function from API2.py
        results = await analyze_brand(brand_name, days_ago)
        logger.info(f"Successfully completed analysis for {brand_name}")
        return results
    except Exception as e:
        # Log the full exception for debugging purposes
        logger.exception(f"An unexpected error occurred during analysis for {brand_name}: {e}")
        # Return a generic error message to the client
        raise HTTPException(status_code=500, detail=f"An internal error occurred during analysis.")

@app.post("/generate-pdf-report")
async def generate_pdf_report(request: Request):
    try:
        data = await request.json()
        logger.info(f"Received PDF generation request with data: {data}")
        
        # Extract chart data
        charts = data.get('charts', [])
        logger.info(f"Number of charts received: {len(charts)}")
        if charts:
            logger.info(f"First chart title: {charts[0].get('title')}")
            logger.info(f"First chart data length: {len(charts[0].get('data', ''))}")
        
        # Generate PDF
        pdf_generator = PDFGenerator()
        pdf_path = pdf_generator.generate_pdf(
            analysis_data=data['analysis_data'],
            sentiment_data=data['sentiment_data'],
            emotion_data=data['emotion_data'],
            topic_data=data['topic_data'],
            charts=charts,
            ai_analysis=data.get('ai_analysis'),
            platform_stats=data.get('platform_stats')
        )
        
        return FileResponse(pdf_path, media_type='application/pdf')
    except Exception as e:
        logger.error(f"Error generating PDF: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

# --- Other Example/Utility Endpoints ---
@app.get("/")
async def root():
    """
    Root endpoint providing a welcome message and API usage hint.
    """
    return {
        "message": "Welcome to the Brand Analysis API.",
        "usage_example": "/api/Google/7" ,
        "docs": "/docs" # Link to Swagger UI
        }

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
    from fastapi.responses import Response
    return Response(status_code=204)

# --- How to Run ---
# Save this file as main.py and API2.py in the same directory.
# Replace placeholder API keys in API2.py.
# Install requirements: pip install fastapi uvicorn requests praw pandas dateparser transformers torch "asyncio" # asyncio is built-in
# Run from terminal: uvicorn main:app --reload --port 8000
# Access in browser or via API client: http://127.0.0.1:8000/api/YOUR_BRAND_NAME/NUMBER_OF_DAYS
# Example: http://127.0.0.1:8000/api/Tesla/3

# --- End of main.py ---