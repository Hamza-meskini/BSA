from typing import Optional, Dict, Any
from supabase import create_client, Client
import os
from datetime import datetime, timedelta
import logging
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Supabase client
supabase_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# Log Supabase configuration
logger.info(f"Supabase URL: {supabase_url}")
logger.info(f"Supabase Key length: {len(supabase_key) if supabase_key else 0}")

# Initialize Supabase client as None
supabase: Optional[Client] = None

def initialize_supabase() -> None:
    """Initialize the Supabase client if credentials are available."""
    global supabase
    if not supabase_url or not supabase_key:
        logger.warning("Supabase credentials not available. Caching will be disabled.")
        return

    try:
        logger.info(f"Initializing Supabase client with URL: {supabase_url}")
        supabase = create_client(supabase_url, supabase_key)
        logger.info("Supabase client initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize Supabase client: {str(e)}")
        supabase = None

# Initialize Supabase on module import
initialize_supabase()

async def insert_result_to_cache(
    brand: str,
    period: str,
    result: Dict[str, Any],
    raw_data: Optional[str] = None
) -> None:
    """
    Insert or update an analytics result in the cache.
    
    Args:
        brand: The brand name
        period: The time period (e.g., "2025-05-01_to_2025-05-17")
        result: The analytics result to cache
        raw_data: Optional CSV string containing the raw data
    """
    if not supabase:
        logger.warning("Supabase client not initialized. Skipping cache insertion.")
        return

    try:
        logger.info(f"Attempting to insert result for brand: {brand}, period: {period}")
        data = {
            "brand": brand,
            "period": period,
            "result": result,
            "expires_at": (datetime.now() + timedelta(hours=24)).isoformat()
        }
        
        if raw_data is not None:
            data["raw_data"] = raw_data
            
        response = supabase.table("analytics_cache").upsert(data).execute()
        
        if hasattr(response, 'error') and response.error:
            logger.error(f"Supabase error: {response.error}")
            raise Exception(f"Error inserting to cache: {response.error}")
            
        logger.info(f"Successfully inserted result for {brand}")
            
    except Exception as e:
        logger.error(f"Error inserting result to cache: {str(e)}")
        raise

async def get_cached_result(
    brand: str,
    period: str
) -> Optional[Dict[str, Any]]:
    """
    Retrieve a cached analytics result.
    
    Args:
        brand: The brand name
        period: The time period
        
    Returns:
        The cached result if found and not expired, None otherwise
    """
    if not supabase:
        logger.warning("Supabase client not initialized. Skipping cache retrieval.")
        return None

    try:
        response = supabase.table("analytics_cache")\
            .select("result")\
            .eq("brand", brand)\
            .eq("period", period)\
            .gt("expires_at", datetime.now().isoformat())\
            .execute()
            
        if hasattr(response, 'error') and response.error:
            raise Exception(f"Error getting from cache: {response.error}")
            
        if not response.data:
            return None
            
        return response.data[0]["result"]
        
    except Exception as e:
        logger.error(f"Error getting cached result: {str(e)}")
        return None

async def get_or_generate_analytics(
    brand: str,
    period: str,
    analyze_brand_func: callable
) -> Dict[str, Any]:
    """
    Get analytics from cache or generate new if not found.
    
    Args:
        brand: The brand name
        period: The time period
        analyze_brand_func: Function to generate new analytics
        
    Returns:
        The analytics result
    """
    # Try to get from cache first
    cached_result = await get_cached_result(brand, period)
    if cached_result:
        logger.info(f"Returning cached result for {brand} {period}")
        return cached_result
        
    # If not in cache, generate new result
    logger.info(f"Generating new result for {brand} {period}")
    result = await analyze_brand_func(brand, period)
    
    # Cache the result
    await insert_result_to_cache(brand, period, result)
    
    return result 