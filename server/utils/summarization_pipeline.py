from sentence_transformers import SentenceTransformer, util
from transformers import T5Tokenizer, T5ForConditionalGeneration, LEDTokenizer, LEDForConditionalGeneration

def semantic_chunking(text, model, threshold=0.5):
    """ Splits text into meaningful chunks based on semantic similarity. """
    sentences = text.split(". ")  # Simple sentence split
    embeddings = model.encode(sentences, convert_to_tensor=True)
    
    similarities = util.pytorch_cos_sim(embeddings[:-1], embeddings[1:])
    
    chunk_indices = [0]
    for i in range(len(similarities)):
        if similarities[i] < threshold:
            chunk_indices.append(i + 1)
    
    chunks = [" ".join(sentences[chunk_indices[i]:chunk_indices[i + 1]]) for i in range(len(chunk_indices) - 1)]
    chunks.append(" ".join(sentences[chunk_indices[-1]:]))  # Add last chunk
    return chunks

def summarize_with_t5(chunk, tokenizer, model, max_input=512, max_output=150):
    """ Summarizes text using T5 model. """
    input_text = "summarize: " + chunk
    inputs = tokenizer.encode(input_text, return_tensors="pt", max_length=max_input, truncation=True)
    
    summary_ids = model.generate(inputs, max_length=max_output, min_length=50, length_penalty=2.0, num_beams=4, early_stopping=True)
    
    return tokenizer.decode(summary_ids[0], skip_special_tokens=True)

def summarize_with_led(text, tokenizer, model, max_input=16384, max_output=300):
    """ Summarizes text using LED model. """
    inputs = tokenizer.encode(text, return_tensors="pt", max_length=max_input, truncation=True)
    
    summary_ids = model.generate(inputs, max_length=max_output, min_length=100, length_penalty=2.0, num_beams=4, early_stopping=True)
    
    return tokenizer.decode(summary_ids[0], skip_special_tokens=True)