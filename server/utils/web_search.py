import os
import json
import re
import aiohttp
from bs4 import BeautifulSoup
from dotenv import load_dotenv
from transformers import PegasusForConditionalGeneration, PegasusTokenizer
import torch
import logging

load_dotenv()

API_KEY = os.getenv("API_KEY")
SEARCH_ENGINE_ID = os.getenv("SEARCH_ENGINE_ID")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Load Pegasus model and tokenizer
model_name = "google/pegasus-xsum"
model = PegasusForConditionalGeneration.from_pretrained(model_name)
tokenizer = PegasusTokenizer.from_pretrained(model_name)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)

async def search_query(search_term, length, api_key=API_KEY, search_engine_id=SEARCH_ENGINE_ID):
    url = f'https://www.googleapis.com/customsearch/v1?q={search_term}&key={api_key}&cx={search_engine_id}'
    async with aiohttp.ClientSession() as session:
        async with session.get(url, ssl=False) as response:
            if response.status != 200:
                logging.error(f"Google Search API request failed with status {response.status}")
                return None
            results = await response.json()
            return results

def extract_links(search_results):
    if not search_results:
        return []
    return [item.get('link') for item in search_results.get('items', []) if item.get('link')]

def save_links_to_file(links, filename='output.txt'):
    try:
        with open(filename, 'w') as file:
            file.writelines(f"{link}\n" for link in links)
    except Exception as e:
        logging.error(f"Error saving links to file: {e}")

async def fetch_and_extract_paragraphs(url):
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url) as response:
                if response.status != 200:
                    logging.error(f"Failed to retrieve {url}, status: {response.status}")
                    return None, None
                soup = BeautifulSoup(await response.text(), 'html.parser')
                paragraphs = [para.get_text() for para in soup.find_all('p')]
                image_tag = soup.find('img')
                image_url = image_tag['src'] if image_tag and 'src' in image_tag.attrs else None
                return "\n".join(paragraphs), image_url
    except Exception as e:
        logging.error(f"Error fetching {url}: {e}")
        return None, None

def clean_text_corpus(corpus):
    if not corpus:
        return ""
    text = re.sub(r'[^A-Za-z0-9\s.,!?;:]', '', corpus)
    text = re.sub(r'http\S+|www\S+', '', text)
    text = re.sub(r'\S+@\S+', '', text)
    return ' '.join(text.split())

async def pegasus_summarizer(text, search_query, length):
    if not text:
        return "No content to summarize."
    
    inputs = tokenizer(
        text,
        return_tensors="pt",
        max_length=1024,
        truncation=True,
        padding=True
    ).to(device)

    logging.info(f"Tokenized input IDs: {inputs.input_ids.shape}")

    summary_ids = model.generate(
        inputs.input_ids,
        max_length=200,
        min_length=50,
        length_penalty=2.0,
        num_beams=4,
        early_stopping=True
    )
    
    return tokenizer.decode(summary_ids[0], skip_special_tokens=True)

async def llm_summarize(text, search_query, length):
    return await pegasus_summarizer(text, search_query, length)

async def fetch_image_urls(search_query, api_key=API_KEY, search_engine_id=SEARCH_ENGINE_ID):
    url = f'https://www.googleapis.com/customsearch/v1?q={search_query}&key={api_key}&cx={search_engine_id}&searchType=image'
    async with aiohttp.ClientSession() as session:
        async with session.get(url, ssl=False) as response:
            if response.status != 200:
                logging.error(f"Image search request failed with status {response.status}")
                return []
            results = await response.json()
            return [item.get('link') for item in results.get('items', []) if item.get('link')]
