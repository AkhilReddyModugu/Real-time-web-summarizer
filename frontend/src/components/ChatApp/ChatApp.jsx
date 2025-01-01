import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import ChatList from '../ChatList/ChatList';
import ChatWindow from '../ChatWindow/ChatWindow';
import axios from 'axios';

const ChatApp = () => {
  const { userDetails } = useContext(AuthContext);
  const [selectedChat, setSelectedChat] = useState(null);
  const [allChats, setAllChats] = useState([]);

  
  useEffect(() => {
    if (userDetails && userDetails.id) {
      const fetchChats = async () => {
        try {
          const response = await axios.get(`http://localhost:5001/api/chat/user/${userDetails.id}`);
          setAllChats(response.data.chats);
        } catch (error) {
          console.error('Error fetching chats:', error);
        }
      };

      fetchChats();
    }
  }, [userDetails]);

  const handleDeleteChat = async (chatId) => {
    try {
      await axios.delete(`http://localhost:5001/api/chat/${chatId}`);
      setAllChats((prevChats) => prevChats.filter((chat) => chat._id !== chatId));
      if (selectedChat && selectedChat._id === chatId) {
        setSelectedChat(null);
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  const handleEditChatName = async (chatId, newName) => {
    try {
      const response = await axios.put(`http://localhost:5001/api/chat/${chatId}`, { name: newName });
      setAllChats((prevChats) =>
        prevChats.map((chat) => (chat._id === chatId ? { ...chat, name: response.data.name } : chat))
      );
    } catch (error) {
      console.error('Error editing chat name:', error);
    }
  };

  const handleSendMessage = async (newMessage, isUser) => {
    if (!selectedChat) return;
  
    try {
      const response = await axios.post(`http://localhost:5001/api/chat/${selectedChat._id}/messages`, {
        sender: isUser ? 'user' : 'model',
        content: newMessage.text,
        images: newMessage.image_urls, // Send images as part of the message
      });
  
      setSelectedChat((prevChat) => ({
        ...prevChat,
        messages: [...prevChat.messages, response.data],
      }));
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
  

  const selectChat = (chat) => {
    setSelectedChat(chat);
  };

  const createNewChat = async () => {
    try {
      const response = await axios.post('http://localhost:5001/api/chat/create', {
        name: 'New Chat',
        userId: userDetails.id,
      });
      const newChat = response.data;
      setAllChats((prevChats) => [...prevChats, newChat]);
      setSelectedChat(newChat);
    } catch (error) {
      console.error('Error creating new chat:', error);
    }
  };

  return (
    <div className="flex h-screen">
      <ChatList
        chats={allChats}
        selectChat={selectChat}
        onDeleteChat={handleDeleteChat}
        onEditChatName={handleEditChatName}
        createNewChat={createNewChat}
      />
      <ChatWindow
        selectedChat={selectedChat}
        onSendMessage={handleSendMessage}
        onCreateNewChat={createNewChat}
      />
    </div>
  );
};

export default ChatApp;
