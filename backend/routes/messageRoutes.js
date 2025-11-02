import express from 'express';
import { sendMessage, getChatMessages, getUserChats } from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, sendMessage);
router.get('/chats', protect, getUserChats);
router.get('/:chatId', protect, getChatMessages);

export default router;