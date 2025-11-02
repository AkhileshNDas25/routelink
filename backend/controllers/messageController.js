import Message from '../models/Message.js';

// @desc    Send message
// @route   POST /api/messages
// @access  Private
export const sendMessage = async (req, res) => {
  try {
    const { receiverId, message, chatId } = req.body;

    const newMessage = await Message.create({
      chatId,
      senderId: req.user._id,
      receiverId,
      message
    });

    const populatedMessage = await Message.findById(newMessage._id)
      .populate('senderId', 'name profilePic')
      .populate('receiverId', 'name profilePic');

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get chat messages
// @route   GET /api/messages/:chatId
// @access  Private
export const getChatMessages = async (req, res) => {
  try {
    const messages = await Message.find({ chatId: req.params.chatId })
      .populate('senderId', 'name profilePic')
      .populate('receiverId', 'name profilePic')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all user chats
// @route   GET /api/messages/chats
// @access  Private
export const getUserChats = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { senderId: req.user._id },
        { receiverId: req.user._id }
      ]
    })
      .populate('senderId', 'name profilePic')
      .populate('receiverId', 'name profilePic')
      .sort({ createdAt: -1 });

    // Get unique chats
    const chatsMap = new Map();
    messages.forEach(msg => {
      if (!chatsMap.has(msg.chatId)) {
        chatsMap.set(msg.chatId, msg);
      }
    });

    const chats = Array.from(chatsMap.values());
    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};