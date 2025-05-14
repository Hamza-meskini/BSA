import asyncio
import httpx  # For asynchronous HTTP requests
from fastapi.concurrency import run_in_threadpool  # Crucial for running sync code in async
import praw
import time
import pandas as pd
from datetime import datetime, timedelta
import dateparser
from urllib.parse import urlparse
import re
from transformers import AutoTokenizer, AutoModelForSequenceClassification, pipeline
import importlib.util
from sklearn.feature_extraction.text import CountVectorizer
import os
import nltk
from dotenv import load_dotenv
import logging

# --- Logger Setup ---
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(module)s - %(funcName)s - %(lineno)d - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)
# --- End Logger Setup ---

# Load environment variables
load_dotenv()
logger.info("Environment variables loaded (API7.py).")

# --- Global Configuration ---
MAX_TWITTER_PAGES = 1  # Max pages to fetch from Twitter
HTTP_TIMEOUT = 20  # Timeout for HTTP requests in seconds

# Download NLTK resources at startup
try:
    nltk.data.find('corpora/stopwords')
    logger.info("NLTK stopwords found.")
except LookupError:
    logger.info("NLTK stopwords not found, downloading...")
    nltk.download('stopwords', quiet=True)
    logger.info("NLTK stopwords downloaded.")
try:
    nltk.data.find('tokenizers/punkt')
    logger.info("NLTK punkt tokenizer found.")
except LookupError:
    logger.info("NLTK punkt tokenizer not found, downloading...")
    nltk.download('punkt', quiet=True)
    logger.info("NLTK punkt tokenizer downloaded.")

# Check if PyTorch is installed
torch_installed = importlib.util.find_spec("torch") is not None
logger.info(f"PyTorch installed: {torch_installed}")

# Initialize emotion detection model globally
emotion_model_load_start = time.time()
logger.info("Loading emotion detection model: bhadresh-savani/distilbert-base-uncased-emotion")
emotion_model_name = "bhadresh-savani/distilbert-base-uncased-emotion"
emotion_tokenizer = AutoTokenizer.from_pretrained(emotion_model_name)
emotion_model = AutoModelForSequenceClassification.from_pretrained(emotion_model_name)
emotion_pipeline = pipeline("text-classification", model=emotion_model, tokenizer=emotion_tokenizer, top_k=1,
                            truncation=True, max_length=512)
logger.info(f"Emotion detection model loaded in {time.time() - emotion_model_load_start:.2f} seconds.")

# Define emotion to sentiment mapping
emotion_to_sentiment = {
    # Positive emotions
    "joy": "positive",
    "love": "positive",
    "admiration": "positive",
    "amusement": "positive",
    "approval": "positive",
    "caring": "positive",
    "excitement": "positive",
    "gratitude": "positive",
    "optimism": "positive",
    "pride": "positive",
    "relief": "positive",
    "realization": "positive",
    
    # Negative emotions
    "anger": "negative",
    "annoyance": "negative",
    "disappointment": "negative",
    "disapproval": "negative",
    "disgust": "negative",
    "embarrassment": "negative",
    "fear": "negative",
    "grief": "negative",
    "nervousness": "negative",
    "remorse": "negative",
    "sadness": "negative",
    
    # Neutral emotions
    "confusion": "neutral",
    "curiosity": "neutral",
    "desire": "neutral",
    "surprise": "neutral",
    "neutral": "neutral"
}

# --- Synchronous Helper Functions (to be run in threadpool if CPU/IO bound) ---

def _format_twitter_date_sync(date_str):
    try:
        dt = datetime.strptime(date_str, "%a %b %d %H:%M:%S %z %Y")
        return dt.strftime("%Y-%m-%d %H:%M")
    except Exception:
        parsed_dt = dateparser.parse(date_str)
        if parsed_dt:
            return parsed_dt.strftime("%Y-%m-%d %H:%M")
        logger.warning(f"Could not parse Twitter date: '{date_str}'")
        return None


def _process_reddit_posts_sync(brand_name: str, days_ago: int, cutoff_date: datetime):
    logger.info(f"Initializing PRAW for Reddit data for r/{brand_name}...")
    reddit_praw_start = time.time()
    try:
        reddit = praw.Reddit(
            client_id=os.getenv("REDDIT_CLIENT_ID"),
            client_secret=os.getenv("REDDIT_CLIENT_SECRET"),
            user_agent=os.getenv("REDDIT_USER_AGENT"),
            # Add username and password if needed for specific PRAW features or private subreddits
            # username=os.getenv("REDDIT_USERNAME"),
            # password=os.getenv("REDDIT_PASSWORD"),
        )
        # Check if PRAW instance is read-only or authenticated
        logger.info(
            f"PRAW Reddit instance initialized in {time.time() - reddit_praw_start:.2f}s. Read-only: {reddit.read_only}")
        subreddit = reddit.subreddit(brand_name.lower())  # Ensure brand name is consistent for subreddit
        _ = subreddit.display_name  # Access an attribute to confirm validity
        logger.info(f"Accessed subreddit r/{subreddit.display_name}.")
    except Exception as e:
        logger.warning(
            f"Could not access subreddit r/{brand_name}. It might not exist or PRAW setup is incomplete. Error: {e}")
        return []

    all_reddit_posts = []
    processed_count = 0
    fetch_reddit_start_time = time.time()
    try:
        for post in subreddit.new(limit=30):  # PRAW's .new() is a generator
            post_date = datetime.fromtimestamp(post.created_utc)
            if post_date.replace(tzinfo=None) < cutoff_date.replace(tzinfo=None):
                continue  # Assuming posts are sorted new to old, could break early

            text_content = post.title.strip()
            if post.selftext:
                text_content += " " + post.selftext.strip()

            # Basic check for empty content after stripping
            if not text_content:
                continue

            reddit_post_data = {
                "Platform": "Reddit",
                "Date": post_date.strftime("%Y-%m-%d %H:%M"),
                "Text": text_content,
                "Score": post.score,
                "Link": f"https://www.reddit.com{post.permalink}",  # Construct full permalink
            }
            all_reddit_posts.append(reddit_post_data)
            processed_count += 1
        logger.info(
            f"Fetched and processed {processed_count} Reddit posts from r/{subreddit.display_name} in {time.time() - fetch_reddit_start_time:.2f} seconds.")
    except praw.exceptions.PRAWException as e:
        logger.error(f"PRAW specific error fetching Reddit data for r/{subreddit.display_name}: {e}", exc_info=True)
    except Exception as e:
        logger.error(f"General Reddit fetch error for r/{subreddit.display_name}: {e}", exc_info=True)
    return all_reddit_posts


# --- Asynchronous Data Fetching Functions ---
async def fetch_tweets(client: httpx.AsyncClient, brand_name: str, days_ago: int, cutoff_date: datetime, cursor=""):
    twitter_url = "https://api.twitterapi.io/twitter/tweet/advanced_search"  # Example, adjust if different
    twitter_headers = {"X-API-Key": os.getenv("TWITTER_API_KEY")}  # Example, adjust

    # Ensure TWITTER_API_KEY is loaded
    if not twitter_headers["X-API-Key"]:
        logger.error("TWITTER_API_KEY not found in environment variables. Skipping Twitter fetch.")
        return [], None

    fetch_tweets_start_time = time.time()
    since_time_dt = datetime.now() - timedelta(days=days_ago)
    # Ensure that the 'since' parameter respects the overall 'days_ago' logic and doesn't fetch too old tweets
    # that would be filtered out by cutoff_date later anyway.
    # Twitter API might have specific formats or limitations for 'since'.
    # For this example, we'll rely on the cutoff_date for filtering after fetching.

    querystring = {
        "queryType": "Top",  # Or "Latest"
        "query": brand_name,
        "lang": "en",
        "cursor": cursor,
        # "since": since_time_dt.strftime("%Y-%m-%dT%H:%M:%SZ"), # Example format, check API docs
        "limit": "100"  # API limit per request
    }

    tweets_data = []
    next_page_cursor = None

    try:
        logger.info(f"Fetching Twitter data for '{brand_name}' with cursor: '{cursor[:10]}...'")
        response = await client.get(twitter_url, headers=twitter_headers, params=querystring, timeout=HTTP_TIMEOUT)
        response.raise_for_status()
        data = response.json()

        raw_tweets = data.get("tweets", [])
        processed_count = 0
        for tweet in raw_tweets:
            created_at_str = tweet.get("createdAt")
            # Run synchronous date formatting in threadpool to avoid blocking
            formatted_date = await run_in_threadpool(_format_twitter_date_sync,
                                                     created_at_str) if created_at_str else None

            if tweet.get("text") and formatted_date:
                # Parse formatted_date back to datetime for comparison
                tweet_dt = dateparser.parse(formatted_date)
                if tweet_dt and tweet_dt.replace(tzinfo=None) >= cutoff_date.replace(tzinfo=None):
                    tweets_data.append({
                        "Platform": "Twitter",
                        "Date": formatted_date,
                        "Text": tweet.get("text", ""),
                        "Score": tweet.get("likeCount", 0) + tweet.get("retweetCount", 0),
                        "Link": tweet.get("url", ""),
                    })
                    processed_count += 1

        next_page_cursor = data.get("next_cursor")
        logger.info(
            f"Fetched and processed {processed_count} tweets from this batch in {time.time() - fetch_tweets_start_time:.2f} seconds.")
    except httpx.HTTPStatusError as e:
        logger.error(f"HTTP error fetching Twitter data: {e.response.status_code} - {e.response.text}", exc_info=True)
    except httpx.RequestError as e:
        logger.error(f"Request error fetching Twitter API: {e}", exc_info=True)
    except Exception as e:
        logger.error(f"Unexpected error during Twitter fetch: {e}", exc_info=True)

    return tweets_data, next_page_cursor


async def fetch_serper_news(client: httpx.AsyncClient, brand_name: str, cutoff_date: datetime):
    serper_url = "https://google.serper.dev/news"
    serper_headers = {
        "X-API-KEY": os.getenv("SERPER_API_KEY"),
        "Content-Type": "application/json",
    }
    if not serper_headers["X-API-KEY"]:
        logger.error("SERPER_API_KEY not found. Skipping Google News fetch.")
        return []

    fetch_serper_start_time = time.time()
    logger.info(f"Fetching Serper news for '{brand_name}'...")
    source_weights = {  # Example weights
        "bbc.com": 500, "bbc.co.uk": 500, "cnn.com": 500, "reuters.com": 450,
        "apnews.com": 430, "nytimes.com": 400, "wsj.com": 400, "forbes.com": 350,
        "bloomberg.com": 350, "techcrunch.com": 320, "theverge.com": 320,
        "wired.com": 300, "medium.com": 200, "blogspot.com": 150,
    }
    payload = {"q": f"{brand_name} news", "num": 20}  # Max 20-50 often for news APIs per page
    all_news_articles = []
    processed_count = 0
    try:
        response = await client.post(serper_url, headers=serper_headers, json=payload, timeout=HTTP_TIMEOUT)
        response.raise_for_status()
        results = response.json().get("news", [])

        for item in results:
            raw_date = item.get("date", "")
            if not raw_date: continue

            pub_date_dt = await run_in_threadpool(dateparser.parse, raw_date)  # dateparser can be slow
            if not pub_date_dt or pub_date_dt.replace(tzinfo=None) < cutoff_date.replace(tzinfo=None):
                continue

            google_news_date = pub_date_dt.strftime("%Y-%m-%d %H:%M")
            source_url = item.get("link", "")
            domain = urlparse(source_url).netloc.replace("www.", "")
            score = source_weights.get(domain, 100)  # Default score
            title = item.get("title", "").strip()
            snippet = item.get("snippet", "").strip()
            if not title and not snippet: continue

            all_news_articles.append({
                "Platform": "Google News", "Date": google_news_date,
                "Text": f"{title} - {snippet}" if title and snippet else title or snippet,
                "Score": score, "Link": source_url,
            })
            processed_count += 1
        logger.info(
            f"Fetched and processed {processed_count} Serper news articles in {time.time() - fetch_serper_start_time:.2f} seconds.")
    except httpx.HTTPStatusError as e:
        logger.error(f"HTTP error fetching Serper news: {e.response.status_code} - {e.response.text}", exc_info=True)
    except httpx.RequestError as e:
        logger.error(f"Request error fetching Serper API: {e}", exc_info=True)
    except Exception as e:
        logger.error(f"Unexpected error during Serper news fetch: {e}", exc_info=True)
    return all_news_articles


async def scrape_brand_data(brand_name: str, days_ago: int):
    overall_scrape_start_time = time.time()
    logger.info(f"Starting data scraping for brand: '{brand_name}', days_ago: {days_ago}")

    cutoff_date = datetime.now() - timedelta(days=days_ago)
    logger.info(f"Data cutoff date: {cutoff_date.strftime('%Y-%m-%d %H:%M')}")

    all_tweets = []
    all_reddit_posts = []
    all_news_articles = []

    async with httpx.AsyncClient() as client:
        # --- Twitter Fetching ---
        twitter_fetch_overall_start = time.time()
        logger.info(f"Starting Twitter data fetch for {brand_name}...")
        twitter_cursor = ""
        for page_num in range(MAX_TWITTER_PAGES):
            logger.info(f"Fetching Twitter page {page_num + 1}/{MAX_TWITTER_PAGES}")
            tweets_batch, next_cursor = await fetch_tweets(client, brand_name, days_ago, cutoff_date, twitter_cursor)
            all_tweets.extend(tweets_batch)
            if not next_cursor:
                logger.info("No more Twitter data or error occurred, stopping Twitter fetch.")
                break
            twitter_cursor = next_cursor
            if page_num < MAX_TWITTER_PAGES - 1:  # Avoid sleep after last page
                await asyncio.sleep(1)  # Rate limiting
        logger.info(
            f"Twitter fetching completed in {time.time() - twitter_fetch_overall_start:.2f} seconds. Total tweets: {len(all_tweets)}")

        # --- Reddit Fetching (run synchronous PRAW code in threadpool) ---
        reddit_fetch_overall_start = time.time()
        logger.info(f"Starting Reddit data fetch for {brand_name}...")
        # _process_reddit_posts_sync is synchronous, so run it in a threadpool
        all_reddit_posts = await run_in_threadpool(_process_reddit_posts_sync, brand_name, days_ago, cutoff_date)
        logger.info(
            f"Reddit fetching completed in {time.time() - reddit_fetch_overall_start:.2f} seconds. Total Reddit posts: {len(all_reddit_posts)}")

        # --- Serper News Fetching ---
        serper_fetch_overall_start = time.time()
        all_news_articles = await fetch_serper_news(client, brand_name, cutoff_date)
        logger.info(
            f"Serper news fetching completed in {time.time() - serper_fetch_overall_start:.2f} seconds. Total news articles: {len(all_news_articles)}")

    combined_data = all_tweets + all_reddit_posts + all_news_articles
    if not combined_data:
        logger.warning("No data collected from any source.")
        return pd.DataFrame()

    # --- DataFrame Creation and Pre-processing (Synchronous Pandas code) ---
    def create_and_process_dataframe_sync(data_list):
        if not data_list: return pd.DataFrame()
        df_creation_start = time.time()
        df = pd.DataFrame(data_list)
        # Ensure 'Date' column exists and attempt conversion
        if 'Date' in df.columns:
            df['Date'] = pd.to_datetime(df['Date'], errors='coerce')
            df = df.dropna(subset=['Date'])  # Drop rows where date conversion failed
            df = df.sort_values(by='Date', ascending=False)
        else:
            logger.warning("No 'Date' column found in combined data for DataFrame processing.")
            # Return an empty DataFrame or df as is, depending on desired error handling
            return pd.DataFrame()  # Or df, if partial processing is acceptable
        logger.info(
            f"DataFrame created and pre-processed in {time.time() - df_creation_start:.2f} seconds. Shape: {df.shape}")
        return df

    df = await run_in_threadpool(create_and_process_dataframe_sync, combined_data)
    logger.info(
        f"Total data scraping for brand '{brand_name}' completed in {time.time() - overall_scrape_start_time:.2f} seconds.")
    return df


# --- Text Cleaning and NLP (Synchronous functions, applied via threadpool) ---
def clean_text_sync(text):
    # Define slang to emotion mapping
    SLANG_TO_EMOTION_MAP = {
        "snapped": "joy",
        "fire": "joy",
        "slaps": "admiration",
        "ate": "pride",
        "ate it up": "joy",
        "goes hard": "admiration",
        "chef's kiss": "satisfaction",
        "dead": "amusement",
        "i'm dead": "amusement",
        "no cap": "confidence",
        "lowkey": "uncertainty",
        "highkey": "confidence",
        "vibe": "calm",
        "vibes": "joy",
        "go off": "empowerment",
        "periodt": "assertiveness",
        "flex": "pride",
        "crying": "amusement",
        "that's wild": "surprise",
        "mad good": "joy"
    }
    
    # Convert text to string and lowercase
    text = str(text).lower()
    
    # Check for slang phrases first (longer phrases before shorter ones)
    for slang, emotion in sorted(SLANG_TO_EMOTION_MAP.items(), key=len, reverse=True):
        if slang in text:
            # Replace the slang with its emotion to help the model understand the context
            text = text.replace(slang, emotion)
    
    # Regular text cleaning
    text = re.sub(r"http\S+", "", text)  # Remove URLs
    text = re.sub(r"@\w+", "", text)  # Remove mentions
    text = re.sub(r"#(\w+)", r"\1", text)  # Remove hashtag symbol but keep the word
    
    # Keep emojis by removing only punctuation, not unicode symbols
    text = re.sub(r"[^\w\s\u263a-\U0001f645]", "", text)  # Allow basic emoji ranges
    
    text = re.sub(r"\s+", " ", text)  # Normalize whitespace
    return text.strip()


def get_emotion_output_sync(row):
    text = row["CleanText"]
    # Default values
    emotion, emotion_score = "neutral", 0.5
    sentiment = "neutral"
    sentiment_score = 0.5

    if not text or text.isspace():
        row["Emotion"] = emotion
        row["EmotionScore"] = emotion_score
        row["Sentiment"] = sentiment
        row["SentimentScore"] = sentiment_score
        return row

    try:
        # Get emotion from the model
        emotion_result = emotion_pipeline(text)[0][0]
        emotion = emotion_result["label"]
        emotion_score = round(emotion_result["score"], 4)
        
        # Map emotion to sentiment
        sentiment = emotion_to_sentiment.get(emotion, "neutral")
        sentiment_score = emotion_score  # Use the same confidence score for sentiment
        
    except Exception as e:
        pass  # Keep default neutral values

    row["Emotion"] = emotion
    row["EmotionScore"] = emotion_score
    row["Sentiment"] = sentiment
    row["SentimentScore"] = sentiment_score
    return row


# --- Chart Data Functions (Synchronous Pandas-heavy operations) ---
# These will be run in threadpool. Logging within them is okay but can be verbose.

def create_sentiment_trend_sync(df, days_ago):
    if df.empty or 'Date' not in df.columns: return []
    df_copy = df.copy()  # Avoid SettingWithCopyWarning
    df_copy['DateOnly'] = pd.to_datetime(df_copy['Date']).dt.date
    actual_dates = sorted(df_copy['DateOnly'].unique())
    trend_data = []
    for date_obj in actual_dates:
        date_str = date_obj.strftime("%Y-%m-%d")
        date_df = df_copy[df_copy['DateOnly'] == date_obj]
        sentiment_counts = date_df['Sentiment'].value_counts()
        trend_data.append({
            "date": date_str,
            "positive": int(sentiment_counts.get("positive", 0)),
            "negative": int(sentiment_counts.get("negative", 0)),
            "neutral": int(sentiment_counts.get("neutral", 0))
        })
    return sorted(trend_data, key=lambda x: x["date"])


def create_emotion_trend_sync(df, days_ago):
    if df.empty or 'Date' not in df.columns: return []
    df_copy = df.copy()
    df_copy['DateOnly'] = pd.to_datetime(df_copy['Date']).dt.date
    actual_dates = sorted(df_copy['DateOnly'].unique())
    trend_data = []
    
    # Get top 7 emotions from the entire dataset
    all_emotions = [
        "admiration", "amusement", "anger", "annoyance", "approval", "caring", "confusion", 
        "curiosity", "desire", "disappointment", "disapproval", "disgust", "embarrassment", 
        "excitement", "fear", "gratitude", "grief", "joy", "love", "nervousness", "optimism", 
        "pride", "realization", "relief", "remorse", "sadness", "surprise", "neutral"
    ]
    
    # Get top 7 emotions by frequency
    emotion_counts = df_copy['Emotion'].value_counts()
    top_emotions = emotion_counts.head(7).index.tolist()
    # Always include 'neutral' if not in top 7
    if 'neutral' not in top_emotions:
        top_emotions = top_emotions[:6] + ['neutral']
    
    for date_obj in actual_dates:
        date_str = date_obj.strftime("%Y-%m-%d")
        date_df = df_copy[df_copy['DateOnly'] == date_obj]
        emotion_counts = date_df['Emotion'].value_counts()
        date_emotions = {"date": date_str}
        for emotion in top_emotions:
            date_emotions[emotion] = int(emotion_counts.get(emotion, 0))
        trend_data.append(date_emotions)
    return sorted(trend_data, key=lambda x: x["date"])


def create_sentiment_word_cloud_sync(df, top_n=30):
    from nltk.corpus import stopwords  # Import here as it's NLTK specific
    nltk_stop_words = list(stopwords.words('english'))
    # Add common brand-related or generic words if needed
    # nltk_stop_words.extend(["rt", "amp", "co", "https", "http", brand_name.lower()])

    word_cloud_data = []
    sentiments = ["positive", "negative", "neutral"]
    if df.empty or 'CleanText' not in df.columns or 'Sentiment' not in df.columns: return []

    # Ensure top_n is reasonable
    words_per_sentiment = max(top_n // len(sentiments), 5) if sentiments else top_n

    for sentiment_val in sentiments:  # Changed variable name
        sentiment_texts = df[df["Sentiment"] == sentiment_val]["CleanText"].tolist()
        if not sentiment_texts: continue

        corpus = " ".join(sentiment_texts)
        if not corpus.strip(): continue

        try:
            # Use token_pattern to better handle words
            vectorizer = CountVectorizer(stop_words=nltk_stop_words, ngram_range=(1, 1),
                                         token_pattern=r'\b[a-zA-Z]{3,}\b')
            X = vectorizer.fit_transform([corpus])
            feature_names = vectorizer.get_feature_names_out()
            counts = X.toarray()[0]

            word_counts = {word: int(count) for word, count in zip(feature_names, counts)}
            # Filter out potential brand name from word cloud if it's too dominant
            # if brand_name.lower() in word_counts:
            #     del word_counts[brand_name.lower()]

            sorted_words = sorted(word_counts.items(), key=lambda x: x[1], reverse=True)

            for word, frequency in sorted_words[:words_per_sentiment]:
                word_cloud_data.append({"text": word, "frequency": frequency, "sentiment": sentiment_val})
        except ValueError as e:
            logger.warning(f"Could not vectorize text for sentiment '{sentiment_val}' in word cloud: {e}")
            continue

    if word_cloud_data:  # Sort all collected words by frequency for final top_n
        word_cloud_data = sorted(word_cloud_data, key=lambda x: x["frequency"], reverse=True)[:top_n]
    return word_cloud_data


def create_platform_sentiment_comparison_sync(df):
    if df.empty or 'Platform' not in df.columns or 'Sentiment' not in df.columns: return []
    platform_mapping = {"Twitter": "twitter", "Reddit": "reddit", "Google News": "news"}
    df_copy = df.copy()
    df_copy['PlatformMapped'] = df_copy['Platform'].map(platform_mapping).fillna('other')

    platform_data = []
    # Ensure all sentiments are present as columns, even if with 0 counts
    platform_sentiment = df_copy.groupby(['PlatformMapped', 'Sentiment']).size().unstack(fill_value=0)
    sentiments_to_include = ["positive", "negative", "neutral"]
    for sentiment_col in sentiments_to_include:
        if sentiment_col not in platform_sentiment.columns:
            platform_sentiment[sentiment_col] = 0

    for platform, row in platform_sentiment.iterrows():
        platform_entry = {"platform": platform}
        for sentiment_col in sentiments_to_include:
            platform_entry[sentiment_col] = int(row.get(sentiment_col, 0))
        platform_data.append(platform_entry)
    return platform_data


def create_platform_emotion_comparison_sync(df):
    if df.empty or 'Platform' not in df.columns or 'Emotion' not in df.columns: return []
    platform_mapping = {"Twitter": "twitter", "Reddit": "reddit", "Google News": "news"}
    df_copy = df.copy()
    df_copy['PlatformMapped'] = df_copy['Platform'].map(platform_mapping).fillna('other')
    
    # Get top 7 emotions by frequency
    emotion_counts = df_copy['Emotion'].value_counts()
    top_emotions = emotion_counts.head(7).index.tolist()
    # Always include 'neutral' if not in top 7
    if 'neutral' not in top_emotions:
        top_emotions = top_emotions[:6] + ['neutral']
    
    platform_data = []
    platform_emotion = df_copy.groupby(['PlatformMapped', 'Emotion']).size().unstack(fill_value=0)
    
    for platform, row in platform_emotion.iterrows():
        platform_entry = {"platform": platform}
        for emotion_col in top_emotions:
            platform_entry[emotion_col] = int(row.get(emotion_col, 0))
        platform_data.append(platform_entry)
    return platform_data


def create_overall_sentiment_distribution_sync(df):
    all_sentiments = ["positive", "negative", "neutral"]
    default_distribution = {s: 0.0 for s in all_sentiments}
    default_distribution["neutral"] = 100.0

    if df.empty or 'Sentiment' not in df.columns or 'Score' not in df.columns:
        return default_distribution

    # Weighted by score if scores are meaningful and positive
    sentiment_weight_sum = df.groupby('Sentiment')['Score'].sum()
    total_score = df['Score'].sum()  # Sum of all scores for normalization

    distribution = {s: 0.0 for s in all_sentiments}

    if total_score > 0:  # Use weighted average if total_score is positive
        for sentiment in all_sentiments:
            distribution[sentiment] = round(100 * float(sentiment_weight_sum.get(sentiment, 0)) / total_score, 1)
    else:  # Fallback to count-based if scores are zero, negative, or not present
        sentiment_counts = df['Sentiment'].value_counts()
        total_counts = len(df)
        if total_counts > 0:
            for sentiment in all_sentiments:
                distribution[sentiment] = round(100 * float(sentiment_counts.get(sentiment, 0)) / total_counts, 1)
        else:  # No data at all
            return default_distribution

    # Normalize to sum to 100% (due to rounding or edge cases)
    current_sum = sum(distribution.values())
    if 99.0 < current_sum < 101.0 and current_sum != 100.0:  # Minor rounding diff
        diff = 100.0 - current_sum
        # Add difference to the largest component, or neutral if it's substantial
        if distribution["neutral"] > 0:
            distribution["neutral"] = round(distribution["neutral"] + diff, 1)
        elif distribution["positive"] > 0:
            distribution["positive"] = round(distribution["positive"] + diff, 1)
        elif distribution["negative"] > 0:
            distribution["negative"] = round(distribution["negative"] + diff, 1)

    elif current_sum == 0 and len(df) > 0:  # All calculated distributions are 0 but there's data
        return default_distribution  # Fallback to neutral 100%
    elif current_sum != 100.0 and current_sum > 0:  # Major diff, re-normalize proportionally
        factor = 100.0 / current_sum
        for k_norm in distribution: distribution[k_norm] = round(distribution[k_norm] * factor, 1)
        # Final check for 100 sum after re-normalization
        final_sum = sum(distribution.values())
        if final_sum != 100.0:
            diff = 100.0 - final_sum
            if "neutral" in distribution: distribution["neutral"] = round(distribution["neutral"] + diff, 1)

    # Ensure neutral is not negative after adjustments
    if "neutral" in distribution and distribution["neutral"] < 0: distribution["neutral"] = 0.0

    return distribution


def create_overall_emotion_distribution_sync(df):
    if df.empty or 'Emotion' not in df.columns or 'Score' not in df.columns:
        return {"neutral": 100.0}
    
    # Get top 7 emotions by frequency
    emotion_counts = df['Emotion'].value_counts()
    top_emotions = emotion_counts.head(7).index.tolist()
    # Always include 'neutral' if not in top 7
    if 'neutral' not in top_emotions:
        top_emotions = top_emotions[:6] + ['neutral']
    
    emotion_weight_sum = df.groupby('Emotion')['Score'].sum()
    total_score = df['Score'].sum()
    
    distribution = {e: 0.0 for e in top_emotions}
    
    if total_score > 0:
        for emotion in top_emotions:
            distribution[emotion] = round(100 * float(emotion_weight_sum.get(emotion, 0)) / total_score, 1)
    else:
        emotion_counts = df['Emotion'].value_counts()
        total_counts = len(df)
        if total_counts > 0:
            for emotion in top_emotions:
                distribution[emotion] = round(100 * float(emotion_counts.get(emotion, 0)) / total_counts, 1)
        else:
            return {"neutral": 100.0}
    
    # Normalize
    current_sum = sum(distribution.values())
    if 99.0 < current_sum < 101.0 and current_sum != 100.0:
        diff = 100.0 - current_sum
        if distribution.get("neutral", 0) > 0:
            distribution["neutral"] = round(distribution["neutral"] + diff, 1)
        else:
            max_emo = max(distribution, key=distribution.get)
            distribution[max_emo] = round(distribution[max_emo] + diff, 1)
    
    elif current_sum != 100.0 and current_sum > 0:
        factor = 100.0 / current_sum
        for k_norm in distribution: distribution[k_norm] = round(distribution[k_norm] * factor, 1)
        final_sum = sum(distribution.values())
        if final_sum != 100.0:
            diff = 100.0 - final_sum
            if "neutral" in distribution: distribution["neutral"] = round(distribution["neutral"] + diff, 1)
    
    if "neutral" in distribution and distribution["neutral"] < 0: distribution["neutral"] = 0.0
    
    return distribution


def create_total_sentiment_engagement_scores_sync(df):
    base_scores = {"positive": 0, "negative": 0, "neutral": 0}
    if df.empty or 'Sentiment' not in df.columns or 'Score' not in df.columns: return base_scores

    # Ensure 'Score' is numeric
    df_copy = df.copy()
    df_copy['Score'] = pd.to_numeric(df_copy['Score'], errors='coerce').fillna(0)

    sentiment_scores_series = df_copy.groupby('Sentiment')['Score'].sum().astype(int)
    result = base_scores.copy()
    result.update(sentiment_scores_series.to_dict())
    return result


def create_total_emotion_engagement_scores_sync(df):
    if df.empty or 'Emotion' not in df.columns or 'Score' not in df.columns:
        return {"neutral": 0}
    
    # Get top 7 emotions by frequency
    emotion_counts = df['Emotion'].value_counts()
    top_emotions = emotion_counts.head(7).index.tolist()
    # Always include 'neutral' if not in top 7
    if 'neutral' not in top_emotions:
        top_emotions = top_emotions[:6] + ['neutral']
    
    df_copy = df.copy()
    df_copy['Score'] = pd.to_numeric(df_copy['Score'], errors='coerce').fillna(0)
    
    emotion_scores_series = df_copy.groupby('Emotion')['Score'].sum().astype(int)
    result = {emotion: 0 for emotion in top_emotions}
    result.update({k: v for k, v in emotion_scores_series.to_dict().items() if k in top_emotions})
    return result


# --- Helper for DataFrame processing in threadpool ---
def _process_dataframe_sync(df_input: pd.DataFrame, brand_name: str):
    if df_input.empty:
        return df_input, {"sentiment": "neutral", "percentage": 100.0}, 0, "Neutral"
    
    # 1. Clean Text
    logger.info(f"Starting text cleaning for {len(df_input)} rows.")
    df_input["CleanText"] = df_input["Text"].apply(clean_text_sync)
    
    # Remove rows where CleanText is empty after cleaning
    df_input = df_input[df_input["CleanText"].str.strip().astype(bool)]
    initial_rows_before_dedup = len(df_input)
    if initial_rows_before_dedup == 0:
        logger.warning("No data remaining after text cleaning (all texts were empty).")
        return pd.DataFrame(), {"sentiment": "neutral", "percentage": 100.0}, 0, "Neutral"
    
    df_input = df_input.drop_duplicates(subset="CleanText", keep='first').reset_index(drop=True)
    logger.info(f"Text cleaning and deduplication (from {initial_rows_before_dedup} to {len(df_input)} rows) done.")
    
    if df_input.empty:
        logger.warning("No data remaining for brand after cleaning and deduplication.")
        return pd.DataFrame(), {"sentiment": "neutral", "percentage": 100.0}, 0, "Neutral"
    
    # 2. Get emotion and sentiment for each row
    logger.info(f"Starting NLP analysis (emotion/sentiment) for {len(df_input)} items...")
    df_output = df_input.apply(get_emotion_output_sync, axis=1)
    logger.info(f"NLP analysis for {len(df_output)} items completed.")
    
    # 3. Calculate overall scores and summaries
    summary_calc_start_time = time.time()
    sentiment_weights = {"positive": 1, "neutral": 0, "negative": -1}
    
    df_output['Score'] = pd.to_numeric(df_output['Score'], errors='coerce').fillna(0)
    
    df_output["WeightedSentimentValue"] = df_output["Sentiment"].map(sentiment_weights).fillna(0)
    df_output["WeightedSentimentScore"] = df_output["WeightedSentimentValue"] * df_output["Score"]
    
    total_post_score_sum = df_output["Score"].sum()
    total_weighted_sentiment_score_sum = df_output["WeightedSentimentScore"].sum()
    
    normalized_score = 0.0
    if total_post_score_sum > 0:
        normalized_score = total_weighted_sentiment_score_sum / total_post_score_sum
    elif not df_output.empty:
        normalized_score = df_output["WeightedSentimentValue"].mean()
    
    normalized_score = max(-1.0, min(1.0, float(normalized_score)))
    total_mentions = len(df_output)
    
    # Calculate sentiment distribution
    sentiment_counts = df_output['Sentiment'].value_counts()
    total_sentiments = len(df_output)
    if total_sentiments > 0:
        sentiment_weight_sum = df_output.groupby('Sentiment')['Score'].sum()
        total_score = df_output['Score'].sum()
        
        if total_score > 0:
            distribution = {}
            for sentiment in ["positive", "negative", "neutral"]:
                distribution[sentiment] = round(100 * float(sentiment_weight_sum.get(sentiment, 0)) / total_score, 1)
        else:
            distribution = {}
            for sentiment in ["positive", "negative", "neutral"]:
                distribution[sentiment] = round(100 * float(sentiment_counts.get(sentiment, 0)) / total_sentiments, 1)
        
        dominant_sentiment = max(distribution.items(), key=lambda x: x[1])
        sentiment_info = {
            "sentiment": dominant_sentiment[0],
            "percentage": dominant_sentiment[1]
        }
    else:
        sentiment_info = {
            "sentiment": "neutral",
            "percentage": 100.0
        }
    
    # Get top emotion from the top 7 emotions
    top_emotion = "Neutral"
    if not df_output.empty and 'Emotion' in df_output.columns and 'Score' in df_output.columns:
        emotion_counts = df_output['Emotion'].value_counts()
        top_emotions = emotion_counts.head(7).index.tolist()
        if 'neutral' not in top_emotions:
            top_emotions = top_emotions[:6] + ['neutral']
        
        weighted_emotion_scores = df_output[df_output['Emotion'].isin(top_emotions)].groupby('Emotion')['Score'].sum()
        if not weighted_emotion_scores.empty and weighted_emotion_scores.sum() > 0:
            if normalized_score < -0.15:
                negative_emotions = ['anger', 'sadness', 'fear', 'disgust', 'disappointment', 'disapproval']
                top_negative_emotions = weighted_emotion_scores[
                    weighted_emotion_scores.index.isin(negative_emotions) & (weighted_emotion_scores > 0)]
                if not top_negative_emotions.empty:
                    top_emotion = top_negative_emotions.idxmax().capitalize()
                else:
                    top_emotion = weighted_emotion_scores.idxmax().capitalize()
            else:
                top_emotion = weighted_emotion_scores.idxmax().capitalize()
        elif not df_output['Emotion'].mode().empty:
            top_emotion = df_output['Emotion'].mode()[0].capitalize()
    
    logger.info(f"Summary calculations took {time.time() - summary_calc_start_time:.2f}s.")
    
    # Save DataFrame to CSV with all columns
    os.makedirs("data", exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # Ensure all columns are included in the saved DataFrame
    columns_to_save = [
        "Platform", "Date", "Text", "CleanText", "Score", 
        "Emotion", "EmotionScore", "Sentiment", "SentimentScore",
        "WeightedSentimentValue", "WeightedSentimentScore", "Link"
    ]
    
    # Save the processed DataFrame with all columns
    df_output[columns_to_save].to_csv(f"data/{brand_name}_data_{timestamp}.csv", index=False, encoding='utf-8')
    
    return df_output, sentiment_info, total_mentions, top_emotion


# --- Main API Function ---
async def analyze_brand(brand_name: str, days_ago: int):
    request_start_time = time.time()
    logger.info(
        f"Received analyze_brand call for: '{brand_name}', days_ago: {days_ago}. Request ID (example): {os.urandom(4).hex()}")

    # --- Default empty response structure ---
    current_date_str = datetime.now().strftime("%Y-%m-%d")
    empty_emotions_dict = {e: 0.0 for e in ["joy", "anger", "sadness", "fear", "disgust", "surprise", "neutral"]}
    empty_emotions_dict["neutral"] = 100.0
    empty_emotion_scores_dict = {e: 0 for e in ["joy", "anger", "sadness", "fear", "disgust", "surprise", "neutral"]}

    empty_response = {
        "summary": {
            "sentimentScore": {"sentiment": "neutral", "percentage": 100.0},
            "totalMentions": 0,
            "topEmotion": "Neutral"
        },
        "charts": {
            "overallSentimentDistribution": {"positive": 0.0, "negative": 0.0, "neutral": 100.0},
            "sentimentTrend": [{"date": current_date_str, "positive": 0, "negative": 0, "neutral": 0}],
            "overallEmotionDistribution": empty_emotions_dict,
            "emotionTrend": [{"date": current_date_str, **empty_emotion_scores_dict}],
            "wordCloud": [],
            "totalSentimentEngagementScores": {"positive": 0, "negative": 0, "neutral": 0},
            "totalEmotionEngagementScores": empty_emotion_scores_dict,
            "platformComparison": [],
            "platformEmotionComparison": []
        },
        "message": f"No data processed for brand: {brand_name}"
    }
    # --- End default empty response structure ---

    try:
        # 1. Scrape data (asynchronously)
        df_scraped = await scrape_brand_data(brand_name, days_ago)

        if df_scraped.empty:
            logger.warning(f"No data found for brand: {brand_name} after scraping.")
            empty_response["message"] = f"No data found for brand: {brand_name} from any source."
            return empty_response

        # 2. Clean, NLP process, and calculate initial summaries (run sync Pandas in threadpool)
        df_processed, sentiment_info, total_mentions, top_emotion = await run_in_threadpool(
            _process_dataframe_sync, df_scraped, brand_name
        )

        if df_processed.empty or total_mentions == 0:
            logger.warning(f"No data remaining for brand: {brand_name} after cleaning and NLP.")
            empty_response["message"] = f"No processable data found for brand: {brand_name} after cleaning."
            return empty_response

        # 3. Create data for all chart components (run sync Pandas chart functions in threadpool)
        charts_data_start_time = time.time()
        logger.info("Starting creation of chart data...")

        # Await all chart functions concurrently using asyncio.gather
        chart_tasks = [
            run_in_threadpool(create_overall_sentiment_distribution_sync, df_processed),
            run_in_threadpool(create_sentiment_trend_sync, df_processed, days_ago),
            run_in_threadpool(create_overall_emotion_distribution_sync, df_processed),
            run_in_threadpool(create_emotion_trend_sync, df_processed, days_ago),
            run_in_threadpool(create_sentiment_word_cloud_sync, df_processed, 30),
            run_in_threadpool(create_total_sentiment_engagement_scores_sync, df_processed),
            run_in_threadpool(create_total_emotion_engagement_scores_sync, df_processed),
            run_in_threadpool(create_platform_sentiment_comparison_sync, df_processed),
            run_in_threadpool(create_platform_emotion_comparison_sync, df_processed)
        ]

        chart_results = await asyncio.gather(*chart_tasks)

        logger.info(f"Chart data generation completed in {time.time() - charts_data_start_time:.2f}s.")

        response_data = {
            "summary": {
                "sentimentScore": sentiment_info,
                "totalMentions": total_mentions,
                "topEmotion": top_emotion
            },
            "charts": {
                "overallSentimentDistribution": chart_results[0],
                "sentimentTrend": chart_results[1],
                "overallEmotionDistribution": chart_results[2],
                "emotionTrend": chart_results[3],
                "wordCloud": chart_results[4],
                "totalSentimentEngagementScores": chart_results[5],
                "totalEmotionEngagementScores": chart_results[6],
                "platformComparison": chart_results[7],
                "platformEmotionComparison": chart_results[8]
            },
            "message": f"Successfully analyzed brand: {brand_name}"
        }

        logger.info(f"Request for '{brand_name}' completed in {time.time() - request_start_time:.2f}s.")

        # Create an async function to store results
        async def store_results_async():
            try:
                # Create a results directory if it doesn't exist
                results_dir = "analysis_results"
                if not os.path.exists(results_dir):
                    os.makedirs(results_dir)
                
                # Create filename with timestamp
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                filename = f"{results_dir}/{brand_name}_{timestamp}.txt"
                
                # Write results to file
                with open(filename, 'w', encoding='utf-8') as f:
                    f.write(f"Analysis Results for {brand_name}\n")
                    f.write(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
                    f.write(f"Period: Last {days_ago} days\n")
                    f.write("\n=== Summary ===\n")
                    f.write(f"Sentiment Score: {response_data['summary']['sentimentScore']['sentiment']} ({response_data['summary']['sentimentScore']['percentage']:.1f}%)\n")
                    f.write(f"Total Mentions: {response_data['summary']['totalMentions']}\n")
                    f.write(f"Top Emotion: {response_data['summary']['topEmotion']}\n")
                    f.write("\n=== Charts Data ===\n")
                    f.write("Overall Sentiment Distribution:\n")
                    f.write(f"Positive: {response_data['charts']['overallSentimentDistribution']['positive']:.1f}%\n")
                    f.write(f"Negative: {response_data['charts']['overallSentimentDistribution']['negative']:.1f}%\n")
                    f.write(f"Neutral: {response_data['charts']['overallSentimentDistribution']['neutral']:.1f}%\n")
                    f.write("\n=== Full Results ===\n")
                    f.write(str(response_data))
                logger.info(f"Analysis results saved to {filename}")
            except Exception as e:
                logger.error(f"Error saving results to file: {e}")

        # Start storing results asynchronously without waiting
        asyncio.create_task(store_results_async())

        return response_data

    except Exception as e:
        logger.error(f"Critical error in analyze_brand for '{brand_name}': {e}", exc_info=True)
        raise