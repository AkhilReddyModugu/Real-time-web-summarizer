import React, { useState } from 'react';

const NewChatForm = ({ onCreateChat }) => {
  const [chatName, setChatName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (chatName.trim()) {
      onCreateChat(chatName);
      setChatName('');
    }
  };

  return (
    <div className="w-full p-4 bg-gray-100 rounded-lg shadow-sm mb-4">
      <h3 className="text-xl font-semibold mb-4">Create a New Chat</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={chatName}
          onChange={(e) => setChatName(e.target.value)}
          className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter a name for the new chat"
        />
        <button
          type="submit"
          className="w-full p-2 bg-blue-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Create Chat
        </button>
      </form>
    </div>
  );
};

export default NewChatForm;
