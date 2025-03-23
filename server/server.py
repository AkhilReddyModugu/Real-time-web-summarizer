from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv
import asyncio
import uvicorn
import time
import logging
import aiohttp  # Ensure aiohttp is imported here if needed

from utils.web_search import (
    search_query,
    extract_links,
    fetch_and_extract_paragraphs,
    clean_text_corpus,
    llm_summarize,
    save_links_to_file,
    fetch_image_urls, 
)

load_dotenv()

API_KEY = os.environ["API_KEY"]
SEARCH_ENGINE_ID = os.environ["SEARCH_ENGINE_ID"]

app = FastAPI()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SearchRequest(BaseModel):
    query: str
    length: int

# Global timeout in seconds for the entire process
GLOBAL_TIMEOUT = 30

# Function to fetch data from a link with improved error handling
async def fetch_data(link):
    try:
        content, image_url = await fetch_and_extract_paragraphs(link)
        if content is None:
            logger.warning(f"No content fetched from {link}")
            return None, None
        return content, image_url
    except Exception as e:
        logger.error(f"Error fetching {link}: {str(e)}")
        return None, None

@app.get("/")
async def read_root():
    return {"Hello": "World"}

@app.post("/summarize")
async def summarize(search_request: SearchRequest):
    search_string = search_request.query
    length = search_request.length
    
    logger.info(f"Searching for: {search_string}")
    
    start_time = time.time()
    try:
        # Wrap the search and processing in a global timeout
        result = await asyncio.wait_for(process_summary(search_string, length, start_time), timeout=GLOBAL_TIMEOUT)
        return result
    except asyncio.TimeoutError:
        logger.error("The process took too long. Request timed out.")
        return {"summary": "The request took too long. Please provide a more specific prompt to narrow down the search.", "image_urls": []}
    except Exception as e:
        logger.exception("Error in the summarization endpoint")
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")

async def process_summary(search_string, length, start_time):
    # Search and extract links
    try:
        search_result = await search_query(search_string, length, API_KEY, SEARCH_ENGINE_ID)
        links = extract_links(search_result)
        if not links:
            raise HTTPException(status_code=404, detail="No links found for the query.")
        save_links_to_file(links)
    except Exception as e:
        logger.exception("Error during search or link extraction")
        raise HTTPException(status_code=500, detail=f"Error during search or link extraction: {str(e)}")
    
    logger.info(f"Found {len(links)} links")
    
    # Fetch data concurrently from all links
    try:
        results = await asyncio.gather(*[fetch_data(link) for link in links], return_exceptions=True)
        valid_results = []
        for result in results:
            if isinstance(result, Exception):
                logger.error(f"Error in fetching one of the links: {result}")
            elif result and result[0]:
                valid_results.append(result)
    except Exception as e:
        logger.exception("Error during concurrent data fetching")
        raise HTTPException(status_code=500, detail=f"Error during data fetching: {str(e)}")
    
    # Combine text corpus from valid results
    text_corpus = "\n".join(result[0] for result in valid_results if result[0])
    
    # Fetch images
    try:
        image_urls = await fetch_image_urls(search_string, API_KEY, SEARCH_ENGINE_ID)
    except Exception as e:
        logger.error(f"Error fetching image URLs: {str(e)}")
        image_urls = []
    
    valid_image_urls = [url for url in image_urls if url.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp'))]

    cleaned_text = clean_text_corpus(text_corpus)
    
    logger.info("Time for scraping: {:.2f} seconds".format(time.time() - start_time))

    # Generate summary using the Gemini API
    try:
        summary = await llm_summarize(text=cleaned_text, search_query=search_string, length=length)
    except Exception as e:
        logger.exception("Error during summary generation")
        raise HTTPException(status_code=500, detail=f"Error during summary generation: {str(e)}")

    # Save summary to file (if fails, log error and continue)
    try:
        with open("summary.txt", 'w') as f:
            f.write(summary)
    except Exception as e:
        logger.error(f"Error writing summary to file: {str(e)}")

    return {"summary": summary, "image_urls": valid_image_urls}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
