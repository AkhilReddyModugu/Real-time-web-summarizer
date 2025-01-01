import React, { useState } from 'react';
import { HiArrowRight } from 'react-icons/hi';
import axios from 'axios';

const ChatInput = ({ onSendMessage }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [summaryLength, setSummaryLength] = useState('');

  const handleSend = async () => {
    // Check if the query is empty or if the summary length is not selected
    if (query.trim() === '') {
      setErrorMessage('Please enter a message');
      return;
    }
    if (!summaryLength) {
      setErrorMessage('Please select a summary length');
      return;
    }
    setErrorMessage(''); // Reset error message
    setLoading(true);
  
    // Send the user's query to the chat
    onSendMessage(query.trim(), true); // 'true' to indicate it's the user's message
  
    // API call to get the summary from the backend
    const api = `http://localhost:5001/api/summarize`; // Replace with your correct API URL
    const body = {
      query: query.trim(),
      length: summaryLength === 'small' ? 200 : summaryLength === 'medium' ? 450 : 700,
    };
  
    try {
      const response = await axios.post(api, body);
  
      // On success, send the response (summary) to the chat
      onSendMessage(response.data.summary, false); // 'false' to indicate it's a bot response
    } catch (error) {
      console.error('Error:', error);
      if (error.response) {
        // Send backend error message to the chat
        onSendMessage(error.response.data.error, false);
      } else {
        // If it's a network issue, send a general error message
        onSendMessage('Network error. Please check your connection.', false);
      }
    } finally {
      setLoading(false); // Reset loading state
      setQuery(''); // Clear the input field
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
