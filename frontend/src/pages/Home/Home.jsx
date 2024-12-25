import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  const redirectToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-semibold mb-4">Welcome to Real-Time Content Summarizer</h1>
      <p className="text-lg mb-6">It condenses long pieces of content into brief, easy-to-read summaries</p>
      <button
        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        onClick={redirectToLogin}
      >
        Get Started
      </button>
    </div>
  );
};

export default Home;
