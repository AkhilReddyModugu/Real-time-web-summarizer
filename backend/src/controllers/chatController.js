import Chat from '../models/chatModel.js';
import Message from '../models/messageModel.js';
import User from '../models/userModel.js';
import mongoose from 'mongoose';

// Create a new chat with a name
export const createChat = async (req, res) => {
  const { userId, name } = req.body;

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ error: true, message: 'Invalid user ID' });
  }

  if (!name) {
    return res.status(400).json({ error: true, message: 'Chat name is required' });
  }

  try {
    const newChat = new Chat({
      name,
      user: userId,
    });

    const savedChat = await newChat.save();

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: true, message: 'User not found' });
    }

    user.chats.push(savedChat._id);
    await user.save();

    res.status(201).json(savedChat);
  } catch (error) {
    console.error('Error creating chat:', error);
    res.status(500).json({ error: true, message: 'Error creating chat' });
  }
};


// Get all chats for a user
export const getChats = async (req, res) => {
  const { userId } = req.params;

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ error: true, message: "Invalid user ID" });
  }

  try {
    // Fetch all chats for the user (where the user is the primary participant in the chat)
    const chats = await Chat.find({ user: userId });

    // Populate the chat with messages and user info
    const populatedChats = await Chat.populate(chats, {
      path: 'user', // Populate the user field
      select: 'name email' // Select the fields you want to return from the user model
    });

    return res.status(200).json({ error: false, chats: populatedChats });
  } catch (error) {
    console.error("Error fetching chats:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};


// Get messages for a specific chat
export const getMessages = async (req, res) => {
  const { chatId } = req.params;

  try {
    const chat = await Chat.findById(chatId).populate('messages');
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    res.status(200).json(chat.messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Error fetching messages' });
  }
};

// Send a message to a specific chat
export const sendMessage = async (req, res) => {
  const { chatId } = req.params;
  const { sender, content, images} = req.body; // sender: 'user' or 'model'

  if (!content || !sender) {
    return res.status(400).json({ error: 'Sender and content are required' });
  }

  try {
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    // Create a new message object and save it to the database
    const newMessage = new Message({
      chat: chatId,
      sender,
      content,
      images
    });

    // Save the message to the database
    await newMessage.save();

    // Push the saved message to the chat's message array (this will not cause duplication)
    chat.messages.push(newMessage._id);
    await chat.save();

    // Return the saved message back to the frontend
    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Error sending message' });
  }
};


//delete a chat
export const deleteChat = async (req, res) => {
    const { chatId } = req.params;

    try {
        // Find the chat by its ID
        const chat = await Chat.findById(chatId).populate('user');
        if (!chat) {
            return res.status(404).json({ error: 'Chat not found' });
        }

        // Remove the chat reference from the user's chats array
        const user = chat.user;
        user.chats = user.chats.filter(chat => chat.toString() !== chatId);
        await user.save();

        // Delete all messages related to this chat
        await Message.deleteMany({ chat: chatId });

        // Delete the chat itself
        await Chat.findByIdAndDelete(chatId);

        res.status(200).json({ message: 'Chat and related messages deleted successfully' });
    } catch (error) {
        console.error('Error deleting chat:', error);
        res.status(500).json({ error: 'Error deleting chat' });
    }
};

// Edit Chat Name
export const editName = async (req, res) => {
  const { chatId } = req.params;
  const { name } = req.body;

  try {
      // Find the chat by its ID
      const chat = await Chat.findById(chatId);
      if (!chat) {
          return res.status(404).json({ error: 'Chat not found' });
      }

      // Update the chat name
      chat.name = name;
      await chat.save();

      res.status(200).json({ name: chat.name });
  } catch (error) {
      console.error('Error editing chat name:', error);
      res.status(500).json({ error: 'Error editing chat name' });
  }
};


