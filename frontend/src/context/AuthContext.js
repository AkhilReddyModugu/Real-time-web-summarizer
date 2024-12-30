  import React, { createContext, useState, useEffect } from 'react';

  // Create context
  export const AuthContext = createContext();

  // AuthProvider component
  export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userDetails, setUserDetails] = useState(null);

    // Check if user is logged in on app load
    useEffect(() => {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('userDetails'));
      if (token && user) {
        setIsLoggedIn(true);
        setUserDetails(user);
      }
    }, []);

    const login = (token, user) => {
      localStorage.setItem('token', token);
      localStorage.setItem('userDetails', JSON.stringify(user));
      setIsLoggedIn(true);
      setUserDetails(user);
    };

    const logout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('userDetails');
      setIsLoggedIn(false);
      setUserDetails(null);
    };

    return (
      <AuthContext.Provider value={{ isLoggedIn, userDetails, login, logout }}>
        {children}
      </AuthContext.Provider>
    );
  };
