import express from 'express';
import { createChat, getChats, sendMessage, getMessages, deleteChat, editName} from '../controllers/chatController.js';

const router = express.Router();

// Define the routes
router.post('/create', createChat); // POST to create a chat
router.get('/user/:userId', getChats); // GET all chats for a user
router.get('/:chatId/messages', getMessages); // GET messages for a specific chat
router.post('/:chatId/messages', sendMessage); // POST to send a message
router.delete('/:chatId',deleteChat); // delete a chat
router.put('/:chatId',editName); // edit chat name

export default router;