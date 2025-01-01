import React, { useState } from 'react';
import { FaPencilAlt, FaTrash, FaCheck } from 'react-icons/fa';

const ChatList = ({ chats = [], selectChat, onDeleteChat, onEditChatName, createNewChat }) => {
  const [editingChatId, setEditingChatId] = useState(null);
  const [newChatName, setNewChatName] = useState('');

  const handleEditClick = (chat) => {
    setEditingChatId(chat._id);
    setNewChatName(chat.name);
  };

  const handleSaveEdit = (chatId) => {
    onEditChatName(chatId, newChatName);
    setEditingChatId(null);
  };

  return (
    <div className="w-1/4 bg-gray-800 p-2 overflow-y-auto h-full ">
      <div className="flex justify-between items-center p-2">
        <h2 className="text-white text-xl mb-4">Chats</h2>
        <button
          className="text-white bg-gray-400 p-2"
          onClick={createNewChat}
        >
          New Chat
        </button>  
      </div>

      <ul className="space-y-2">
        {chats.map((chat) => (
          <li
            key={chat._id}
            className="bg-gray-700 p-2 rounded-lg flex justify-between items-center hover:bg-gray-600"
          >
            <div onClick={() => selectChat(chat)} className="w-full">
              {editingChatId === chat._id ? (
                <input
                  value={newChatName}
                  onChange={(e) => setNewChatName(e.target.value)}
                  className="p-1 bg-gray-600 text-white rounded w-full"
                />
              ) : (
                <p className="text-white">{chat.name}</p>
              )}
              <p className="text-sm text-gray-400 truncate">
                {chat.messages[chat.messages.length - 1]?.content}
              </p>
            </div>
            <div className="flex space-x-2">
              {editingChatId === chat._id ? (
                <button
                  onClick={() => handleSaveEdit(chat._id)}
                  className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 flex items-center"
                >
                  <FaCheck />
                </button>
              ) : (
                <button
                  onClick={() => handleEditClick(chat)}
                  className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center"
                >
                  <FaPencilAlt />
                </button>
              )}
              <button
                onClick={() => onDeleteChat(chat._id)}
                className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 flex items-center"
              >
                <FaTrash />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChatList;
