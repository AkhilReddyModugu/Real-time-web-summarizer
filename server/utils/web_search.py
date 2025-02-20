import os
import re
import aiohttp
from bs4 import BeautifulSoup
from dotenv import load_dotenv

load_dotenv()

# Function to search query and fetch results from Google's Custom Search API
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

# Function to fetch and extract paragraphs and images from a URL
async def fetch_and_extract_paragraphs(url):
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url) as response:
                if response.status != 200:
                    print(f"Failed to retrieve the page {url}")
                    return None, None
                soup = BeautifulSoup(await response.text(), 'html.parser')
                # Extract paragraphs
                paragraphs = soup.find_all('p')
                text = "\n".join(para.get_text() for para in paragraphs)
                # Extract first image from the main content if available
                main_content = soup.find("main") or soup.body
                image_url = None
                if main_content:
                    image_tag = main_content.find("img")
                    if image_tag and image_tag.get("src"):
                        img_src = image_tag["src"]
                        image_url = img_src if img_src.startswith("http") else url + img_src
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

# Abstractive Summarization using Hugging Face Transformers
from transformers import pipeline

# Initialize the summarization pipeline globally for performance
summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

def summarize_text_abstractive(text, length):
    # Map desired word length to min and max token length
    # You may need to fine-tune these numbers for your application
    if length <= 200:
        min_length = 50
        max_length = 100
    elif length <= 450:
        min_length = 100
        max_length = 200
    else:
        min_length = 150
        max_length = 300
    try:
        summary = summarizer(text, min_length=min_length, max_length=max_length, do_sample=False)
        return summary[0]['summary_text']
    except Exception as e:
        return f"Error during summarization: {e}"
