from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv
import asyncio
import uvicorn
import time

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

# Function to fetch data from a link
async def fetch_data(link):
    try:
        content = await fetch_and_extract_paragraphs(link)
        if content is None:
            raise ValueError(f"No content fetched from {link}")
        return content
    except Exception as e:
        raise RuntimeError(f"Error fetching {link}: {str(e)}")

@app.get("/")
async def read_root():
    return {"Hello": "World"}

@app.post("/summarize")
async def summarize(search_request: SearchRequest):
    search_string = search_request.query
    length = search_request.length
    
    print(f"Searching for: {search_string}")
    
    try:
        start = time.time()
        search_result = await search_query(search_string, length, API_KEY, SEARCH_ENGINE_ID)
    
        links = extract_links(search_result)
        
        save_links_to_file(links)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during search or link extraction: {str(e)}")
    
    print(f"Found {len(links)} links")

    # Fetch data and image URLs concurrently
    try:
        # Use asyncio.gather to fetch data concurrently
        results = await asyncio.gather(*[fetch_data(link) for link in links])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during data fetching: {str(e)}")

    # Separate text corpus and image URLs
    text_corpus = "\n".join(filter(None, (result[0] for result in results)))
    image_urls = await fetch_image_urls(search_string, API_KEY, SEARCH_ENGINE_ID)  # Fetch images for the query
    
    # Filter image URLs to only include valid image URLs
    valid_image_urls = [url for url in image_urls if url.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp'))]

    cleaned_text = clean_text_corpus(text_corpus)
    
    print("Time for scraping: ", time.time() - start)

    # Generate summary using LLM
    summary = await llm_summarize(text=cleaned_text, search_query=search_string, length=length)

    # Write the summary to a text file
    with open("summary.txt", 'w') as f:
        f.write(summary)

    return {"summary": summary, "image_urls": valid_image_urls}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)