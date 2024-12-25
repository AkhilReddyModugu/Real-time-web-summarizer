import requests
from bs4 import BeautifulSoup
from sumy.parsers.plaintext import PlaintextParser
from sumy.nlp.tokenizers import Tokenizer
from sumy.summarizers.lsa import LsaSummarizer
# import nltk

# Download the punkt tokenizer
# nltk.download('punkt')

# Function to fetch and extract paragraphs from a URL
def fetch_and_extract_paragraphs(url):
    # Fetch the webpage
    response = requests.get(url)
    
    # Check if the request was successful
    if response.status_code != 200:
        print(f"Failed to retrieve the page. Status code: {response.status_code}")
        return None
    
    # Parse the HTML content
    soup = BeautifulSoup(response.text, 'html.parser')
    
    # Find all paragraph tags
    paragraphs = soup.find_all('p')
    
    # Extract and return the text from each paragraph
    content = [para.get_text() for para in paragraphs]
    return content

# Function to summarize text
def summarize_text(text, num_sentences=5):
    parser = PlaintextParser.from_string(text, Tokenizer("english"))
    summarizer = LsaSummarizer()
    
    summary = summarizer(parser.document, num_sentences)
    summarized_text = ' '.join([str(sentence) for sentence in summary])
    return summarized_text

# URL of the webpage
url = 'https://www.revelo.com/blog/how-to-make-an-ai'

# Fetch and print the paragraphs
paragraphs = fetch_and_extract_paragraphs(url)
if paragraphs:
    full_text = ' '.join(paragraphs)
    summary = summarize_text(full_text)
    print("Summary:")
    print(summary)
