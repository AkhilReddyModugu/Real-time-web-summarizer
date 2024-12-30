import os
import json
import re
import requests
import numpy as np
from dotenv import load_dotenv
from bs4 import BeautifulSoup
import aiohttp

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
    with open(filename, 'w') as file:
        for link in links:
            file.write(link + '\n')

# Function to fetch and extract paragraphs from a URL
async def fetch_and_extract_paragraphs(url):
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url) as response:
                if response.status != 200:
                    print(f"Failed to retrieve the page {url}")
                    # print(f"Failed to retrieve the page {url}. Status code: {response.status}")
                    return None
                
                soup = BeautifulSoup(await response.text(), 'html.parser')
                paragraphs = soup.find_all('p')
                return "\n".join(para.get_text() for para in paragraphs)
    except Exception as e:
        print(f"Error fetching {url}")
        # print(f"Error fetching {url}: {e}")
        return None

# Function to clean the text corpus
    
# def clean_text_corpus(corpus):
#     text = re.sub(r'[^A-Za-z0-9\s.,!?;:]', '', corpus)
#     text = ' '.join(text.split())
#     return text

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
def gemini_summarizer(text, search_query, length):
    url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent'
    params = {
        'key': os.getenv('GEMINI_API_KEY')
    }
    prompt = f"Given the following data from the internet on the given query:  \"{search_query}\" \n Data from the internet : {text} \n \
        Give a summary of the search in about {length} words. Don't use any special characters. \
        If the data from the internet doesn't seem relevant to the search query, use your own knowledge to make the answer relevant to the search query. \
        Use markup to generate the response, do NOT use any html tags."
    
    prompt = f"""
        Given the following data aggregated from multiple websites on the query: "{search_query}",

        Data from the internet:
        {text}

        Please provide a concise summary of approximately {length} words.
        Note that the information has been scraped from various sources; 
        therefore, assign higher weight to details corroborated by multiple sites. 
        If the data appears inconsistent or irrelevant to the search query, utilize your own knowledge to ensure the summary's relevance. 
        Use plain text for the response without any special characters or HTML tags.
    """

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
    try:
        res = requests.post(url, headers=headers, params=params, data=json.dumps(body))
        res.raise_for_status()  # Check if request was successful
        res_json = res.json()
        if 'candidates' in res_json:
            result = res_json['candidates'][0]['content']['parts'][0]['text']
            return result
        else:
            return "Error: No candidates found in the response."
    except Exception as e:
        return f"Error: {e}"

# Main summarization function
def llm_summarize(text, search_query, length):
    return gemini_summarizer(text, search_query, length)

async def fetch_image_url(query: str, API_KEY: str, SEARCH_ENGINE_ID: str):
    """Fetch the first image URL for a given query using Google Custom Search API."""
    search_url = "https://www.googleapis.com/customsearch/v1"
    params = {
        "key": API_KEY,
        "cx": SEARCH_ENGINE_ID,
        "q": query,
        "searchType": "image",
        "num": 1
    }

    try:
        response = requests.get(search_url, params=params)
        response.raise_for_status()
        data = response.json()
        if "items" in data and data["items"]:
            return data["items"][0]["link"]
        else:
            print("No image results found.")
            return None
    except Exception as e:
        print("Error fetching image URL:", e)
        return None
