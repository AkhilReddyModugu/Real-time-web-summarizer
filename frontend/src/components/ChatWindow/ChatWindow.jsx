import { useRef, useLayoutEffect, useState, useEffect } from 'react';
import ChatInput from '../ChatInput/ChatInput';
import axios from 'axios';

const ChatWindow = ({ selectedChat, onSendMessage, onCreateNewChat }) => {
  const bottomRef = useRef(null);
  const [messages, setMessages] = useState([]);

  useLayoutEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        if (selectedChat) {
          const response = await axios.get(
            `http://localhost:5001/api/chat/${selectedChat._id}/messages`
          );
          // Map messages to identify the sender
          setMessages(
            response.data.map((msg) => ({
              text: msg.content,
              isUser: msg.sender === 'user', // Check if the sender is 'user'
            }))
          );
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
  }, [selectedChat]);

  const handleSendMessage = (messageText, isUserMessage) => {
    if (messageText.trim()) {
      const newMessage = {
        text: messageText,
        isUser: isUserMessage,
      };

      // Optimistically update local state
      setMessages((prevMessages) => [...prevMessages, newMessage]);

      // Notify parent component of new message
      onSendMessage(newMessage, isUserMessage);
    }
  };

  return (
    <div className="w-3/4 bg-gray-100 flex flex-col h-full">
      {selectedChat ? (
        <>
          {/* Header Section */}
          <div className="p-4 bg-gray-400 text-lg font-semibold flex-none">
            {selectedChat.name}
          </div>

          {/* Messages Section */}
          <div className="flex-grow overflow-y-auto p-4 space-y-2 bg-gray-100">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`p-2 rounded-lg max-w-max ${
                  message.isUser
                    ? 'bg-blue-500 text-white ml-auto w-4/6' // User's message
                    : 'bg-gray-200 text-black mr-auto w-4/6' // Model's message
                }`}
              >
                {message.text}
              </div>
            ))}
            <div ref={bottomRef}></div>
          </div>

          <ChatInput onSendMessage={handleSendMessage} />
        </>
      ) : (
        <div className="flex-grow flex flex-col items-center justify-center text-gray-500">
          <p className="block">Select a chat to start messaging</p>
          <button
            onClick={onCreateNewChat}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none"
          >
            New Chat
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
