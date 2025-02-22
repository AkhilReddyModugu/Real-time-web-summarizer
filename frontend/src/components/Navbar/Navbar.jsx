import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Brain } from 'lucide-react';

const Navbar = () => {
  const { isLoggedIn, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-indigo-100 py-4 shadow-md border-b">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-4">
        <div className="flex items-center space-x-2">
          <Brain className="w-6 h-6 text-black" />
          <Link to="/" className="text-2xl font-semibold text-indigo-600 hover:text-indigo-800 no-underline">
            ConciseWeb
          </Link>
        </div>

        <div className="flex space-x-4 text-lg">
          <Link 
            to="/about" 
            className="px-4 py-2 rounded-md bg-black text-blue-400 border border-transparent hover:bg-white border-indigo-600 transition-colors no-underline"
          >
            About
          </Link>
          <Link 
            to="/contact" 
            className="px-4 py-2 rounded-md bg-black text-blue-400 border border-transparent hover:bg-white border-indigo-600 transition-colors no-underline"
          >
            Contact
          </Link>

          {isLoggedIn ? (
            <button 
              onClick={handleLogout} 
              className="px-4 py-2 rounded-md bg-red-500 text-white border border-transparent hover:border-red-600 transition-colors"
            >
              Logout
            </button>
          ) : (
            <>
              <Link 
                to="/login" 
                className="px-4 py-2 rounded-md bg-white border border-transparent text-blue-400 hover:text-indigo-500 hover:border-indigo-600 transition-colors no-underline"
              >
                Login
              </Link>
              <Link 
                to="/signup" 
                className="px-4 py-2 rounded-md bg-black text-white border border-transparent hover:bg-gray-700 text-indigo-500 hover:border-indigo-600 transition-colors no-underline"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
