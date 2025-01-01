import os
import json
import re
from dotenv import load_dotenv
import aiohttp
from bs4 import BeautifulSoup

load_dotenv()

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
        # Open the file in write mode to clear its contents before appending new links
        with open(filename, 'w') as file:  # Open in write mode (clears the file)
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

                # Extract paragraphs
                paragraphs = soup.find_all('p')
                text = "\n".join(para.get_text() for para in paragraphs)

                # Extract the first image URL (if any)
                image_tag = soup.find('img')
                image_url = image_tag['src'] if image_tag and 'src' in image_tag.attrs else None

                return text, image_url
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return None, None

# Function to clean the text corpus
def clean_text_corpus(corpus):
    # Remove non-alphanumeric characters
    text = re.sub(r'[^A-Za-z0-9\s.,!?;:]', '', corpus)

    # Remove URLs and emails
    text = re.sub(r'http\S+|www\S+', '', text)
    text = re.sub(r'\S+@\S+', '', text)

    # Remove extra spaces
    text = ' '.join(text.split())

    return text

# Function to summarize using Gemini model
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
        - **Relevance**: If data appears inconsistent or irrelevant to the query, utilize your expertise to ensure the summary remains pertinent.
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
                response.raise_for_status()  # Check if request was successful
                res_json = await response.json()
                if 'candidates' in res_json:
                    result = res_json['candidates'][0]['content']['parts'][0]['text']
                    return result
                else:
                    return "Error: No candidates found in the response."
        except Exception as e:
            return f"Error: {e}"

# Main summarization function
async def llm_summarize(text, search_query, length):
    return await gemini_summarizer(text, search_query, length)

# Function to fetch image URLs using Google Custom Search API
async def fetch_image_urls(query: str, API_KEY: str, SEARCH_ENGINE_ID: str):
    """Fetch 3-4 image URLs for a given query using Google Custom Search API."""
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
                if "items" in data and data["items"]:
                    image_urls = [item["link"] for item in data["items"]]
                else:
                    print("No image results found.")
    except Exception as e:
        print("Error fetching image URLs:", e)
    
    return image_urls
