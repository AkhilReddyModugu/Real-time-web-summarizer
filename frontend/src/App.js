import React, { useContext } from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import { SearchPage } from './components/searchPage/searchPage';
import LoginPage from './pages/Login/Login';
import SignupPage from './pages/Signup/Signup';
import ContactPage from './pages/Contact/Contact';
import AboutPage from './pages/About/About';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Home from './pages/Home/Home';
// import Footer from './components/Footer/Footer';
import ChatApp from './components/ChatApp/ChatApp';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <AppRoutes />
          {/* <Footer /> */}
        </div>
      </Router>
    </AuthProvider>
  );
}

const AppRoutes = () => {
  const { isLoggedIn } = useContext(AuthContext); 

  return (
    <div className="container mx-auto p-4">
      <Routes>
        <Route path="/" 
          element={isLoggedIn ? <ChatApp /> : <Home />} 
        />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/chat" element={<SearchPage/>} />
      </Routes>
    </div>
  );
}

export default App;
