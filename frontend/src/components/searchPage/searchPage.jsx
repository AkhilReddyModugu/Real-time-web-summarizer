import React, { useState } from 'react';
import { SearchResult } from '../searchResult/searchResult';
import axios from 'axios';
import './styles.css';

export const SearchPage = () => {
    const [summaryLength, setSummaryLength] = useState('');
    const [query, setQuery] = useState('');
    const [searchResponse, setSearchResponse] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [imageUrl, setImageUrl] = useState('');

    const handleChange = (event) => {
        setQuery(event.target.value);
        if (event.target.value.trim() !== '') {
            setErrorMessage('');
        }
    };

    const handleSubmit = async () => {
        if (query.trim() === '') {
            setErrorMessage('Please enter a query');
            return;
        }
        if (!summaryLength) {
            setErrorMessage('Please select a summary length');
            return;
        }
    
        setLoading(true);
        setErrorMessage('');
        setSearchResponse('');
        setImageUrl('');
    
        const api = `http://localhost:5001/api/summarize`;
        const body = {
            query: query,
            length: summaryLength === 'small' ? 200 : summaryLength === 'medium' ? 450 : 700,
        };
    
        try {
            const response = await axios.post(api, body, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            setSearchResponse(response.data.summary);
            setImageUrl(response.data.image_url);
        } catch (error) {
            console.error('Error:', error);
            if (error.response) {
                const backendErrorMessage = error.response.data.error;
                setSearchResponse(backendErrorMessage || 'An unexpected error occurred.');
            } else {
                setSearchResponse('Network error. Please check your connection.');
            }
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="w-full max-w-3xl p-6 bg-white rounded-lg shadow-lg">
                <h2 className="text-3xl font-semibold text-center text-gray-800 mb-4">Search and Summarize</h2>
                <div className="space-y-4">
                    <div>
                        <input
                            type="text"
                            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your query"
                            value={query}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label htmlFor="summary-length" className="block text-sm font-medium text-gray-700">
                            Select Summary Length:
                        </label>
                        <select
                            id="summary-length"
                            className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={summaryLength}
                            onChange={(e) => setSummaryLength(e.target.value)}
                        >
                            <option value="">Select Summary Length</option>
                            <option value="small">Small</option>
                            <option value="medium">Medium</option>
                            <option value="large">Large</option>
                        </select>
                    </div>
                    {errorMessage && (
                        <p className="text-sm text-red-500 mt-2 mb-4">{errorMessage}</p>
                    )}
                    <div className="flex space-x-4">
                        <button
                            className="w-full md:w-auto px-6 py-3 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            onClick={handleSubmit}
                        >
                            Search
                        </button>
                        <button
                            className="w-full md:w-auto px-6 py-3 text-white bg-gray-300 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                            onClick={() => {
                                setQuery('');
                                setErrorMessage('');
                            }}
                        >
                            Clear
                        </button>
                        <button
                            className="w-full md:w-auto px-6 py-3 text-white bg-red-500 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                            onClick={() => {
                                setSearchResponse('');
                                setImageUrl('');
                            }}
                        >
                            Clear Result
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center text-gray-500 mt-4">Loading...</div>
                ) : (
                    <div>
                        {imageUrl && (
                            <div className="mt-4 flex justify-center">
                                <img
                                    src={imageUrl}
                                    alt={query}
                                    className="max-w-full max-h-96 object-contain rounded-lg shadow-md"
                                />
                            </div>
                        )}
                        {searchResponse && <SearchResult content={searchResponse} />}
                        {!searchResponse && !imageUrl && !errorMessage && (
                            <div className="mt-4 text-center text-gray-500"></div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
