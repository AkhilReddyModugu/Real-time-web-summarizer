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
          setMessages(
            response.data.map((msg) => ({
              text: msg.content,
              images: msg.images || [],
              isUser: msg.sender === 'user',
            }))
          );
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
  }, [selectedChat]);

  const handleSendMessage = (messageText, image_urls = [], isUserMessage) => {
    if (messageText.trim() || image_urls.length > 0) {
      const newMessage = {
        text: messageText,
        images: image_urls,
        isUser: isUserMessage,
      };
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      onSendMessage(newMessage, isUserMessage);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white">
      {selectedChat ? (
        <>
          <div className="px-6 py-4 border-t-black border-b border-gray-200 bg-slate-300">
            <h2 className="text-xl font-semibold text-gray-800">{selectedChat.name}</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[70%] space-y-2`}>
                {message.images && message.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-3">
                    {message.images.map((img, idx) => (
                      <div key={idx} className="overflow-hidden rounded-lg border border-gray-200">
                        <img
                          src={img}
                          alt={`response-image-${idx}`}
                          className="w-full h-50 object-contain"
                        />
                      </div>
                    ))}
                  </div>
                )}
                  <div
                    className={`p-4 rounded-2xl ${
                      message.isUser
                        ? 'bg-blue-600 text-white ml-auto'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.text}</p>
                  </div>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <ChatInput onSendMessage={handleSendMessage} />
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="text-center space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">Welcome to Chat</h3>
            <p className="text-gray-500">Select a chat to start messaging or create a new one</p>
            <button
              onClick={onCreateNewChat}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start New Chat
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
