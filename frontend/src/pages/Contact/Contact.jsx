import React, { useState } from 'react';
import axios from 'axios';

const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [indicator, setIndicator] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !message) {
      setIndicator('Please fill in all fields.');
      setSuccess(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:5001/api/send-email', { name, email, message });

      if (response.status === 200) {
        setIndicator('Your message has been sent successfully!');
        setSuccess(true);
      }
    } catch (error) {
      setIndicator('Error sending message. Please try again.');
      setSuccess(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white border rounded-lg shadow-md p-8">
        <h2 className="text-3xl font-bold mb-6">Contact Us</h2>

        {indicator && (
          <p className={`text-sm mb-4 ${success ? 'text-green-500' : 'text-red-500'}`}>
            {indicator}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-1">Name</label>
            <input
              type="text"
              placeholder="Your name"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-1">Email</label>
            <input
              type="email"
              placeholder="your@email.com"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-1">Message</label>
            <textarea
              placeholder="How can we help you?"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows="4"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded-md font-semibold hover:bg-gray-800 transition"
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
