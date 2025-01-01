import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Navbar = () => {
  const { isLoggedIn, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gray-800 p-4 shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="text-2xl font-semibold text-white">
          <Link to="/">Real-Time Web Summarizer</Link>
        </div>

        <div className="space-x-6 text-lg">
          <Link to="/" className="text-white hover:text-primary font-medium transition-colors">
            Home
          </Link>
          <Link to="/contact" className="text-white hover:text-primary font-medium transition-colors">
            Contact
          </Link>
          <Link to="/about" className="text-white hover:text-primary font-medium transition-colors">
            About
          </Link>

          {isLoggedIn ? (
            <>
              <button className="text-red-500 text-lg" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-white">Login</Link>
              <Link to="/signup" className="text-white">Signup</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;