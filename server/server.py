from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv
import asyncio
import uvicorn
from concurrent.futures import ThreadPoolExecutor, as_completed
import time

from utils.web_search import (
    search_query,
    extract_links,
    fetch_and_extract_paragraphs,
    clean_text_corpus,
    llm_summarize,
    save_links_to_file,
    fetch_image_url
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
    length: int

# Function to fetch data from a link
def fetch_data(link):
    try:
        content = asyncio.run(fetch_and_extract_paragraphs(link))
        if content is None:
            raise ValueError(f"No content fetched from {link}")
        return content
    except Exception as e:
        # raise RuntimeError(f"Error fetching {link}: {e}")
        raise RuntimeError(f"Error fetching {link}")

@app.get("/")
async def read_root():
    return {"Hello": "World"}

@app.post("/summarize")
async def summarize(search_request: SearchRequest):
    search_string = search_request.query
    length = search_request.length
    llm = "Gemini" 
    
    print(f"Searching for: {search_string}")
    try:
        start = time.time()
        search_result = await search_query(search_string, length, API_KEY, SEARCH_ENGINE_ID)
        links = extract_links(search_result)
        save_links_to_file(links)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    print(f"Found {len(links)} links")

    # Set the failure threshold
    failure_threshold = 3
    failure_count = 0
    results = []

    with ThreadPoolExecutor() as executor:
        future_to_link = {executor.submit(fetch_data, link): link for link in links}
        for future in as_completed(future_to_link):
            link = future_to_link[future]
            try:
                result = future.result()
                results.append(result)
            except Exception as e:
                print(f"Fetching failed for {link}")
                # print(f"Fetching failed for {link}: {e}")
                failure_count += 1
                # Check if failure threshold is exceeded
                if failure_count >= failure_threshold:
                    print("Failure threshold exceeded. Terminating process.")
                    raise HTTPException(status_code=500, detail="Failed to fetch sufficient data from the internet. Please try again later or try with a more specific query.")

    text_corpus = "\n".join(filter(None, results))
    cleaned_text = clean_text_corpus(text_corpus)
    print("Time for scraping: ", time.time()-start)

    summary = llm_summarize(text=cleaned_text, search_query=search_string, length=length)

    with open("summary.txt", 'w') as f:
        f.write(summary)

    image_url = await fetch_image_url(search_string, API_KEY, SEARCH_ENGINE_ID)
    print(image_url)
    
    return {"summary": summary, "image_url": image_url}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
