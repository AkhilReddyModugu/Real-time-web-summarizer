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
    summarize_text_abstractive,  # Updated abstractive summarization function
    save_links_to_file
)

load_dotenv()

API_KEY = os.environ["API_KEY"]
SEARCH_ENGINE_ID = os.environ["SEARCH_ENGINE_ID"]

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins; change in production
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
        content, _ = await fetch_and_extract_paragraphs(link)
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

    try:
        results = await asyncio.gather(*[fetch_data(link) for link in links])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during data fetching: {str(e)}")

    text_corpus = "\n".join(filter(None, results))
    cleaned_text = clean_text_corpus(text_corpus)
    
    print("Time for scraping: ", time.time() - start)

    # Generate abstractive summary using Hugging Face Transformers
    summary = summarize_text_abstractive(cleaned_text, length)

    with open("summary.txt", 'w') as f:
        f.write(summary)

    return {"summary": summary}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
