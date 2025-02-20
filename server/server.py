from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv
import asyncio
import uvicorn
import time
import logging

from sentence_transformers import SentenceTransformer
from transformers import T5Tokenizer, T5ForConditionalGeneration, LEDTokenizer, LEDForConditionalGeneration

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

# Load models
sbert_model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
t5_model_name = "t5-small"
t5_tokenizer = T5Tokenizer.from_pretrained(t5_model_name)
t5_model = T5ForConditionalGeneration.from_pretrained(t5_model_name)
led_model_name = "allenai/led-base-16384"
led_tokenizer = LEDTokenizer.from_pretrained(led_model_name)
led_model = LEDForConditionalGeneration.from_pretrained(led_model_name)

# Function to fetch data from a link
async def fetch_data(link):
    from utils.web_search import fetch_and_extract_paragraphs
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
    from utils.web_search import (
        search_query,
        extract_links,
        clean_text_corpus,
        save_links_to_file,
        fetch_image_urls,
        llm_summarize
    )
    from utils.summarization_pipeline import (
        semantic_chunking,
        summarize_with_t5,
        summarize_with_led
    )

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

    # Fetch data and image URLs concurrently
    try:
        results = await asyncio.gather(*[fetch_data(link) for link in links])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during data fetching: {str(e)}")

    text_corpus = "\n".join(filter(None, (result for result in results)))
    image_urls = await fetch_image_urls(search_string, API_KEY, SEARCH_ENGINE_ID)
    valid_image_urls = [url for url in image_urls if url.lower().endswith((".png", ".jpg", ".jpeg", ".gif", ".bmp"))]
    cleaned_text = clean_text_corpus(text_corpus)
    
    logging.info("Time for scraping: %s seconds", time.time() - start)

    # Chunking using SBERT
    chunks = semantic_chunking(cleaned_text, sbert_model)
    
    # Summarize each chunk with T5
    summarized_chunks = [summarize_with_t5(chunk, t5_tokenizer, t5_model) for chunk in chunks]
    merged_summary = " ".join(summarized_chunks)
    
    # Generate final summary with LED
    final_summary = summarize_with_led(merged_summary, led_tokenizer, led_model)

    # Write the summary to a text file
    with open("summary.txt", 'w') as f:
        f.write(final_summary)

    return {"summary": final_summary, "image_urls": valid_image_urls}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)