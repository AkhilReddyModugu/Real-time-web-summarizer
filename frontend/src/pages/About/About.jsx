import React from 'react';

const About = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-4xl bg-white border rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-semibold text-center mb-6">About Real-Time Web Summarizer</h2>
        <p className="text-lg mb-4">
          The <strong>Real-Time Web Summarizer</strong> is a powerful tool that helps you quickly search and condense content from across the web into concise, easy-to-read summaries. 
        </p>
        <p className="text-lg mb-4">
          Whether you're researching a topic, reading articles, or browsing blogs, our tool streamlines the process by providing summarized versions of web pages in real-time. Simply enter a search query, let the tool gather and analyze the data, and receive a summarized output in seconds.
        </p>
        <p className="text-lg mb-4">
          Key Features:
        </p>
        <ul className="list-disc ml-8">
          <li className="text-lg">Real-time search and summarization from multiple sources</li>
          <li className="text-lg">Accurate, concise, and relevant summaries</li>
          <li className="text-lg">Streamlined user experience with minimal effort</li>
          <li className="text-lg">Leverages advanced AI (Gemini API) for high-quality summaries</li>
        </ul>
      </div>
    </div>
  );
};

export default About;
