import React, { useState } from 'react';
import { HiArrowRight } from 'react-icons/hi';
import axios from 'axios';

const ChatInput = ({ onSendMessage }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [summaryLength, setSummaryLength] = useState('');

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
  
    // Set the query message in the chat state
    onSendMessage(query.trim(), true); // This triggers the state update in the parent component
  
    // Make the backend call to get the summary
    const api = `http://localhost:5001/api/summarize`;  // Update the API endpoint accordingly
    const body = {
      query: query.trim(),
      length: summaryLength === 'small' ? 200 : summaryLength === 'medium' ? 450 : 700,
    };
  
    try {
      const response = await axios.post(api, body);
  
      // Send the response message (summary) to the chat
      onSendMessage(response.data.summary, false);
    } catch (error) {
      console.error('Error:', error);
      if (error.response) {
        setErrorMessage(error.response.data.error || 'An unexpected error occurred.');
      } else {
        setErrorMessage('Network error. Please check your connection.');
      }
    } finally {
      setLoading(false);
      setQuery('');
    }
  };
  

  return (
    <div className="flex items-center space-x-2 bg-gray-200 p-4 flex-none">
      <textarea
        className="flex-grow p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        placeholder="Type your message..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div>
        <label htmlFor="summary-length" className="block text-sm font-medium text-gray-700 mb-2">
          Select Summary Length:
        </label>
        <select
          id="summary-length"
          className="block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={summaryLength}
          onChange={(e) => setSummaryLength(e.target.value)}
        >
          <option value="">Select Summary Length</option>
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </select>
      </div>
      <button
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none"
        onClick={handleSend}
        disabled={loading}
      >
        <HiArrowRight />
      </button>
    </div>
  );
};

export default ChatInput;