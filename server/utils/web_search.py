import os
import json
import re
from dotenv import load_dotenv
import aiohttp
from bs4 import BeautifulSoup
from transformers import PegasusForConditionalGeneration, PegasusTokenizer
import torch
import logging  # Import the logging module

load_dotenv()

# Load the Pegasus model and tokenizer
model_name = "google/pegasus-xsum"
model = PegasusForConditionalGeneration.from_pretrained(model_name)
tokenizer = PegasusTokenizer.from_pretrained(model_name)

# Move model to GPU if available
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)

# Function to search query and fetch results from Google's custom search
async def search_query(search_term, length, api_key, search_engine_id):
    url = f'https://www.googleapis.com/customsearch/v1?q={search_term}&key={api_key}&cx={search_engine_id}'
    async with aiohttp.ClientSession() as session:
        async with session.get(url, ssl=False) as response:
            results = await response.json()
            return results

# Function to extract links from search results
def extract_links(search_results):
    links = []
    for item in search_results.get('items', []):
        links.append(item.get('link'))
    return links

# Function to save links to a file
def save_links_to_file(links, filename='output.txt'):
    try:
        with open(filename, 'w') as file:
            for link in links:
                file.write(link + '\n')
    except Exception as e:
        print(f"Error saving links to file: {e}")

# Function to fetch and extract paragraphs from a URL
async def fetch_and_extract_paragraphs(url):
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url) as response:
                if response.status != 200:
                    print(f"Failed to retrieve the page {url}")
                    return None, None
                
                soup = BeautifulSoup(await response.text(), 'html.parser')
                paragraphs = soup.find_all('p')
                text = "\n".join(para.get_text() for para in paragraphs)
                image_tag = soup.find('img')
                image_url = image_tag['src'] if image_tag and 'src' in image_tag.attrs else None
                return text, image_url
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return None, None

# Function to clean the text corpus
def clean_text_corpus(corpus):
    text = re.sub(r'[^A-Za-z0-9\s.,!?;:]', '', corpus)
    text = re.sub(r'http\S+|www\S+', '', text)
    text = re.sub(r'\S+@\S+', '', text)
    text = ' '.join(text.split())
    return text

# Function to summarize using Pegasus
async def pegasus_summarizer(text, search_query, length):
    # Tokenize the input text
    inputs = tokenizer(
        text,
        return_tensors="pt",
        max_length=1024,  # Ensure the input does not exceed the model's max length
        truncation=True,
        padding=True
    ).to(device)

    logging.info(f"Tokenized input IDs: {inputs.input_ids}")

    # Generate summary with the appropriate settings
    summary_ids = model.generate(
        inputs.input_ids,
        max_length=200,  # Adjust the length of the summary
        min_length=50,
        length_penalty=2.0,
        num_beams=4,
        early_stopping=True
    )

    # Decode the summary and return it
    summary = tokenizer.decode(summary_ids[0], skip_special_tokens=True)
    return summary

# Main summarization function
async def llm_summarize(text, search_query, length):
    return await pegasus_summarizer(text, search_query, length)

# Function to fetch image URLs from search results
async def fetch_image_urls(search_query, api_key, search_engine_id):
    url = f'https://www.googleapis.com/customsearch/v1?q={search_query}&key={api_key}&cx={search_engine_id}&searchType=image'
    async with aiohttp.ClientSession() as session:
        async with session.get(url, ssl=False) as response:
            results = await response.json()
            image_urls = []
            for item in results.get('items', []):
                image_urls.append(item.get('link'))
            return image_urls