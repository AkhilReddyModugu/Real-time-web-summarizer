import React, { useState } from 'react';
import { SearchResult } from '../searchResult/searchResult';
import axios from 'axios';
import './styles.css';

export const SearchPage = () => {
    const [query, setQuery] = useState('');
    const [searchResponse, setSearchResponse] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleChange = (event) => {
        setQuery(event.target.value);
        if (event.target.value.trim() !== '') {
            setErrorMessage('');
        }
    };

    const handleSubmit = () => {
        if (query.trim() === '') {
            setErrorMessage('Please enter a query');
            return;
        }
        setLoading(true);
        setErrorMessage('');
        setSearchResponse('');
        const api = `http://localhost:5001/api/summarize`;
        const body = {
            query: query
        };

        axios
            .post(api, body, {
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            .then((response) => {
                console.log(response.data);
                setSearchResponse(response.data.summary);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error:', error);
                setLoading(false);
                setErrorMessage('An error occurred while fetching the summary.');
            });
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
                        {errorMessage && <p className="text-sm text-red-500 mt-1">{errorMessage}</p>}
                    </div>
                    <div className="flex space-x-4">
                        <button
                            className="w-full md:w-auto px-6 py-3 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            onClick={handleSubmit}
                        >
                            Search
                        </button>
                        <button
                            className="w-full md:w-auto px-6 py-3 text-white bg-gray-300 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                            onClick={() => setQuery('')}
                        >
                            Clear
                        </button>
                        <button
                            className="w-full md:w-auto px-6 py-3 text-white bg-red-500 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                            onClick={() => setSearchResponse('')}
                        >
                            Clear Result
                        </button>
                    </div>
                </div>
                {loading ? (
                    <div className="text-center text-gray-500 mt-4">Loading...</div>
                ) : (
                    <div className="mt-6">
                        {searchResponse && <SearchResult content={searchResponse} />}
                    </div>
                )}
            </div>
        </div>
    );
};
