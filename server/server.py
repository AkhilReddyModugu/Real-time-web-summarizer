from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv
import asyncio
import uvicorn
from concurrent.futures import ThreadPoolExecutor
import time

from utils.web_search import (
    search_query,
    extract_links,
    fetch_and_extract_paragraphs,
    clean_text_corpus,
    llm_summarize,
    save_links_to_file
)

load_dotenv()

API_KEY = os.environ["API_KEY"]
SEARCH_ENGINE_ID = os.environ["SEARCH_ENGINE_ID"]

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins, change this to specific origins in production
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)

# Define the request body using Pydantic
class SearchRequest(BaseModel):
    query: str

def fetch_data(link):
    try:
        content = asyncio.run(fetch_and_extract_paragraphs(link))
        return content
    except:
        return None

@app.get("/")
async def read_root():
    return {"Hello": "World"}

@app.post("/summarize")
async def summarize(search_request: SearchRequest):
    search_string = search_request.query
    llm = "Gemini"
    
    # Search the web and extract links
    print(f"Searching for: {search_string}")
    try:
        start = time.time()
        search_result = await search_query(search_string, API_KEY, SEARCH_ENGINE_ID)
        links = extract_links(search_result)
        save_links_to_file(links)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    print(f"Found {len(links)} links")

    # Use ThreadPoolExecutor to fetch data concurrently
    with ThreadPoolExecutor() as executor:
        futures = [executor.submit(fetch_data, link) for link in links]
        results = [future.result() for future in futures]

    # Combine and clean the text corpus
    text_corpus = "\n".join(filter(None, results))
    cleaned_text = clean_text_corpus(text_corpus)
    print("Time for scraping: ", time.time()-start)

    summary = llm_summarize(text=text_corpus, search_query=search_string)

    with open("summary.txt", 'w') as f:
        f.write(summary)
    
    return {
        "summary": summary
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)