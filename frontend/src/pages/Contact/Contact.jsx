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
      <div className="w-full max-w-4xl bg-white border rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-semibold text-center mb-6">Contact Us</h2>

        <p className="text-lg mb-4">
          We’d love to hear from you! If you have any questions, feedback, or suggestions, please don’t hesitate to reach out.
        </p>

        {indicator && (
          <p className={`text-sm mb-4 ${success ? 'text-green-500' : 'text-red-500'}`}>
            {indicator}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Your Name"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <input
              type="email"
              placeholder="Your Email"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <textarea
              placeholder="Your Message"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows="4"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary text-white py-2 rounded-lg font-semibold hover:bg-primary-dark transition"
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
