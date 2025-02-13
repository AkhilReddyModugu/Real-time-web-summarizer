from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv
import asyncio
import uvicorn
import time
import logging

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

API_KEY = os.getenv("API_KEY")
SEARCH_ENGINE_ID = os.getenv("SEARCH_ENGINE_ID")

app = FastAPI()

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

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

async def fetch_data(link):
    try:
        logging.info(f"Fetching data from link: {link}")
        content, _ = await fetch_and_extract_paragraphs(link)
        logging.info(f"Fetched content from link: {link}")
        return content
    except Exception as e:
        logging.error(f"Error fetching data from link: {link}, Error: {e}")
        raise HTTPException(status_code=500, detail="Error fetching data")

@app.get("/")
async def read_root():
    return {"message": "API is running"}

@app.post("/summarize")
async def summarize(search_request: SearchRequest):
    search_string = search_request.query
    length = search_request.length
    
    logging.info(f"Searching for: {search_string}")
    
    try:
        start = time.time()
        search_result = await search_query(search_string, length, API_KEY, SEARCH_ENGINE_ID)
        links = extract_links(search_result)
        save_links_to_file(links)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during search or link extraction: {str(e)}")
    
    logging.info(f"Found {len(links)} links")

    try:
        results = await asyncio.gather(*[fetch_data(link) for link in links])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during data fetching: {str(e)}")

    text_corpus = "\n".join(filter(None, results))
    logging.info(f"Text corpus: {text_corpus[:500]}")

    image_urls = await fetch_image_urls(search_string, API_KEY, SEARCH_ENGINE_ID)
    valid_image_urls = [url for url in image_urls if url.lower().endswith((".png", ".jpg", ".jpeg", ".gif", ".bmp"))]

    cleaned_text = clean_text_corpus(text_corpus)
    logging.info(f"Cleaned text: {cleaned_text[:500]}")
    
    logging.info("Time for scraping: %s seconds", time.time() - start)

    try:
        logging.info("Starting summarization...")
        summary = await llm_summarize(text=cleaned_text, search_query=search_string, length=length)
        logging.info(f"Summary: {summary[:500]}")
    except Exception as e:
        logging.error(f"Error during summarization: {e}")
        raise HTTPException(status_code=500, detail="Error during summarization")

    with open("summary.txt", 'w', encoding="utf-8") as f:
        f.write(summary)

    logging.info("Summarized text saved to summary.txt")

    return {"summary": summary, "image_urls": valid_image_urls}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
