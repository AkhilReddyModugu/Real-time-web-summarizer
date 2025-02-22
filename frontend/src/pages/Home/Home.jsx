import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Cpu, Zap } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();

  const redirectToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 px-4">
      {/* Header Section */}
      <h1 className="text-5xl font-bold text-gray-800 mb-4">
        ConciseWeb
      </h1>
      <p className="text-xl text-gray-500 mb-8 text-center">
        Transform the way you consume web content with AI-powered summaries and <br />
        intelligent search
      </p>
      <button
        className="px-6 py-3 bg-black text-white rounded-lg shadow-lg hover:bg-gray-800 hover:shadow-xl transition"
        onClick={redirectToLogin}
      >
        Get Started
      </button>

      {/* Feature Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 max-w-4xl">
        <div className="bg-white rounded-lg shadow-md p-6 text-center border">
          <Search className="w-12 h-12 mx-auto text-gray-800 mb-4" />
          <h3 className="text-xl font-semibold text-gray-800">Smart Search</h3>
          <p className="text-gray-500">
            Advanced search capabilities across multiple sources
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 text-center border">
          <Cpu className="w-12 h-12 mx-auto text-gray-800 mb-4" />
          <h3 className="text-xl font-semibold text-gray-800">AI-Powered Summaries</h3>
          <p className="text-gray-500">
            Get instant, accurate summaries of web content
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 text-center border">
          <Zap className="w-12 h-12 mx-auto text-gray-800 mb-4" />
          <h3 className="text-xl font-semibold text-gray-800">Real-Time Processing</h3>
          <p className="text-gray-500">
            Process and analyze content in real-time
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
