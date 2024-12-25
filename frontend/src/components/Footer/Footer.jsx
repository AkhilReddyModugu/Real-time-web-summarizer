import React from 'react';

const Footer = () => (
  <footer className="bg-gray-800 text-white py-4 mt-8">
    <div className="container mx-auto text-center">
      <p>&copy; {new Date().getFullYear()} Real-Time Content Summarizer. All rights reserved.</p>
      <p>
        <a href="/contact" className="text-blue-400 hover:text-blue-600">Contact Us</a> |{' '}
        <a href="/" className="text-blue-400 hover:text-blue-600">Privacy Policy</a> |{' '}
        <a href="/" className="text-blue-400 hover:text-blue-600">Terms of Service</a>
      </p>
    </div>
  </footer>
);

export default Footer;
