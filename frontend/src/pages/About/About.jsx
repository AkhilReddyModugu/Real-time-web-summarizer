import React from 'react';

const About = () => {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="bg-white shadow-md rounded-lg overflow-hidden p-8">
        <h1 className="text-3xl font-bold mb-4">About Web Summarizer</h1>
        <p className="text-lg text-gray-600 mb-6">
          Web Summarizer is an advanced tool that helps you quickly understand and digest web content through AI-powered summarization and intelligent search capabilities.
        </p>

        <h2 className="text-2xl font-bold mb-2">Our Mission</h2>
        <p className="text-lg text-gray-600 mb-6">
          We aim to make information consumption more efficient and accessible by providing smart tools that help you extract key insights from any web content.
        </p>

        <h2 className="text-2xl font-bold mb-2">Features</h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-600">
          <li>Intelligent content summarization</li>
          <li>Advanced search capabilities</li>
          <li>Real-time processing</li>
          <li>Multi-source integration</li>
          <li>Customizable summaries</li>
        </ul>
      </div>
    </div>
  );
};

export default About;
