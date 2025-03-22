import React, { useState } from 'react';
import { HiArrowRight } from 'react-icons/hi';
import axios from 'axios';

const ChatInput = ({ onSendMessage }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [summaryLength, setSummaryLength] = useState('');
  const [images, setImages] = useState([]);

  const handleSend = async () => {
    if (query.trim() === '') {
      setErrorMessage('Please enter a message');
      return;
    }
    if (!summaryLength) {
      setErrorMessage('Please select a summary length');
      return;
    }
    setErrorMessage('');
    setLoading(true);

    onSendMessage(query.trim(), images, true);

    const api = `http://localhost:5001/api/summarize`;
    const body = {
      query: query.trim(),
      length: summaryLength === 'small' ? 200 : summaryLength === 'medium' ? 450 : 700,
    };

    try {
      const response = await axios.post(api, body);
      onSendMessage(response.data.summary, response.data.image_urls, false);
      console.log(response.data);
    } catch (error) {
      console.error('Error:', error);
      if (error.response) {
        onSendMessage(error.response.data.error, [], false);
      } else {
        onSendMessage('Network error. Please check your connection.', [], false);
      }
    } finally {
      setLoading(false);
      setQuery('');
      setImages([]);
    }
  };

  return (
    <div className="flex items-center space-x-4 bg-gray-100 p-4 flex-none border-t border-gray-300"> 
      <textarea
        className="flex-grow p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        placeholder="Type your message..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div>
        <label htmlFor="summary-length" className="block text-sm font-medium text-gray-700 mb-1">
          Summary Length:
        </label>
        <select
          id="summary-length"
          className="block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={summaryLength}
          onChange={(e) => setSummaryLength(e.target.value)}
        >
          <option value="">Select Length</option>
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </select>
      </div>
      <button
        className={`px-4 py-2 rounded-lg text-white ${loading ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'} focus:outline-none`}
        onClick={handleSend}
        disabled={loading}
      >
        <HiArrowRight />
      </button>
    </div>
  );
};

export default ChatInput;
