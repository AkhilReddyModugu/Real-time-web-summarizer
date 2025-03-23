import os
import re
from dotenv import load_dotenv
import aiohttp  
from bs4 import BeautifulSoup
import logging

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Function to search query and fetch results from Google's custom search
async def search_query(search_term, length, api_key, search_engine_id):
    url = f'https://www.googleapis.com/customsearch/v1?q={search_term}&key={api_key}&cx={search_engine_id}'
    async with aiohttp.ClientSession() as session:
        async with session.get(url, ssl=False) as response:
            if response.status != 200:
                raise Exception(f"Search query failed with status code: {response.status}")
            results = await response.json()
            return results

# Function to extract links from search results
def extract_links(search_results):
    links = []
    for item in search_results.get('items', []):
        link = item.get('link')
        if link:
            links.append(link)
    return links

# Function to save links to a file
def save_links_to_file(links, filename='output.txt'):
    try:
        with open(filename, 'w') as file:
            for link in links:
                file.write(link + '\n')
    except Exception as e:
        logger.error(f"Error saving links to file: {e}")

# Function to fetch and extract paragraphs from a URL with per-request timeout
async def fetch_and_extract_paragraphs(url):
    PER_REQUEST_TIMEOUT = 5  # seconds
    try:
        timeout = aiohttp.ClientTimeout(total=PER_REQUEST_TIMEOUT)
        async with aiohttp.ClientSession(timeout=timeout) as session:
            async with session.get(url) as response:
                if response.status != 200:
                    logger.warning(f"Failed to retrieve the page {url} with status {response.status}")
                    return None, None
                
                html_text = await response.text()
                soup = BeautifulSoup(html_text, 'html.parser')

                # Extract paragraphs
                paragraphs = soup.find_all('p')
                text = "\n".join(para.get_text() for para in paragraphs)

                # Extract the first image URL (if any)
                image_tag = soup.find('img')
                image_url = image_tag['src'] if image_tag and image_tag.has_attr('src') else None

                return text, image_url
    except asyncio.TimeoutError:
        logger.warning(f"Timeout while fetching {url}")
        return None, None
    except Exception as e:
        logger.error(f"Error fetching {url}: {e}")
        return None, None

# Function to clean the text corpus
def clean_text_corpus(corpus):
    text = re.sub(r'[^A-Za-z0-9\s.,!?;:]', '', corpus)
    text = re.sub(r'http\S+|www\S+', '', text)
    text = re.sub(r'\S+@\S+', '', text)
    text = ' '.join(text.split())
    return text

# Function to summarize using Gemini API
async def gemini_summarizer(text, search_query, length):
    url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent'
    params = {
        'key': os.getenv('GEMINI_API_KEY')
    }
    prompt = f"""
        You are an expert summarizer tasked with condensing information from multiple sources.

        ### Instructions:
        - **Query**: "{search_query}"
        - **Data**: Aggregated from various websites, presented below.

        ### Data from the Internet:
        {text}

        ### Requirements:
        - **Length**: Approximately {length} words.
        - **Emphasis**: Prioritize information corroborated by multiple sources; assign greater weight to frequently mentioned details.
        - **Relevance**: If data appears inconsistent or irrelevant to the query, ensure the summary remains pertinent.
        - **Format**: Provide the summary in plain text without special characters or HTML tags.
        - **Clarity**: Ensure the summary is coherent and easily understandable.

        Begin your summary below:
    """

    body = {
        'contents': [
            {
                'parts': [{
                    'text': prompt
                }]
            }
        ]
    }
    headers = {
        'Content-Type': 'application/json'
    }

    async with aiohttp.ClientSession() as session:
        try:
            async with session.post(url, headers=headers, params=params, json=body) as response:
                response.raise_for_status()
                res_json = await response.json()
                candidates = res_json.get('candidates')
                if candidates and isinstance(candidates, list) and candidates[0].get('content'):
                    return candidates[0]['content']['parts'][0]['text']
                else:
                    logger.error("No valid candidates found in the summarization response.")
                    return "Error: No summary could be generated."
        except Exception as e:
            logger.error(f"Error in gemini_summarizer: {e}")
            return f"Error: {e}"

# Main summarization function
async def llm_summarize(text, search_query, length):
    return await gemini_summarizer(text, search_query, length)

# Function to fetch image URLs using Google Custom Search API
async def fetch_image_urls(query: str, API_KEY: str, SEARCH_ENGINE_ID: str):
    search_url = "https://www.googleapis.com/customsearch/v1"
    params = {
        "key": API_KEY,
        "cx": SEARCH_ENGINE_ID,
        "q": query,
        "searchType": "image",
        "num": 3
    }

    image_urls = []
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(search_url, params=params) as response:
                response.raise_for_status()
                data = await response.json()
                if "items" in data:
                    image_urls = [item.get("link") for item in data["items"] if item.get("link")]
                else:
                    logger.info("No image results found.")
    except Exception as e:
        logger.error(f"Error fetching image URLs: {e}")
    
    return image_urls
