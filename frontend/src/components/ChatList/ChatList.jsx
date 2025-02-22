import React, { useState } from 'react';
import { FaPlus, FaCheck, FaPencilAlt, FaTrash } from 'react-icons/fa';

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
    <div className="w-80 bg-gray-900 flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <button
          className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium"
          onClick={createNewChat}
        >
          <FaPlus className="w-4 h-4" />
          New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <ul className="space-y-1 p-2">
          {chats.map((chat) => (
            <li
              key={chat._id}
              className="group rounded-lg hover:bg-gray-800 transition-colors"
            >
              <div className="p-3 flex items-start gap-3">
                <div 
                  onClick={() => selectChat(chat)} 
                  className="flex-1 min-w-0 cursor-pointer"
                >
                  {editingChatId === chat._id ? (
                    <input
                      value={newChatName}
                      onChange={(e) => setNewChatName(e.target.value)}
                      className="w-full px-2 py-1 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-blue-500"
                    />
                  ) : (
                    <>
                      <h3 className="text-gray-100 font-medium truncate">{chat.name}</h3>

                    </>
                  )}
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {editingChatId === chat._id ? (
                    <button
                      onClick={() => handleSaveEdit(chat._id)}
                      className="p-1 text-green-400 hover:text-green-300 transition-colors"
                    >
                      <FaCheck className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleEditClick(chat)}
                      className="p-1 text-gray-400 hover:text-gray-300 transition-colors"
                    >
                      <FaPencilAlt className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => onDeleteChat(chat._id)}
                    className="p-1 text-red-400 hover:text-red-300 transition-colors"
                  >
                    <FaTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ChatList;
