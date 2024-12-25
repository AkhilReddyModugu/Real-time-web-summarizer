import React from 'react';

const About = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-4xl bg-white border rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-semibold text-center mb-6">About Real-Time Content Summarizer</h2>
        <p className="text-lg mb-4">
          The <strong>Real-Time Content Summarizer</strong> is an innovative tool that helps you condense long pieces of content into brief, easy-to-read summaries. 
        </p>
        <p className="text-lg mb-4">
          Whether you are reading news articles, blogs, or research papers, the Real-Time Content Summarizer helps you save time by delivering quick summaries.
          Simply paste the text you want to summarize, and get a concise version in seconds!
        </p>
        <p className="text-lg mb-4">
          Key Features:
        </p>
        <ul className="list-disc ml-8">
          <li className="text-lg">Real-time content summarization</li>
          <li className="text-lg">Accurate and concise summaries</li>
          <li className="text-lg">Easy-to-use interface</li>
        </ul>
      </div>
    </div>
  );
};

export default About;
