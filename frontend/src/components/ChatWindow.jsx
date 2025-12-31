// frontend/src/components/ChatWindow.jsx
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { io } from 'socket.io-client';

const ChatWindow = ({ chatId, otherUser }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Fetch existing messages
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/messages/${chatId}`);
        setMessages(data);
      } catch (error) {
        console.error('Failed to fetch messages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // Setup socket connection
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    // Join with user ID
    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      newSocket.emit('join', user._id);
    });

    // Listen for incoming messages
    newSocket.on('receiveMessage', (data) => {
      console.log('Message received:', data);
      if (data.chatId === chatId) {
        setMessages((prev) => [...prev, {
          _id: Date.now().toString(),
          chatId: data.chatId,
          senderId: { _id: data.senderId },
          message: data.message,
          createdAt: data.timestamp || new Date()
        }]);
      }
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    // Cleanup on unmount
    return () => {
      console.log('Disconnecting socket');
      newSocket.disconnect();
    };
  }, [chatId, user._id]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;

    const messageToSend = newMessage.trim();
    setSending(true);

    try {
      // Save to database
      const { data } = await api.post('/messages', {
        chatId,
        receiverId: otherUser._id,
        message: messageToSend
      });

      // Add to local state immediately
      setMessages((prev) => [...prev, data]);

      // Send via socket for real-time delivery
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit('sendMessage', {
          receiverId: otherUser._id,
          senderId: user._id,
          message: messageToSend,
          chatId
        });
        console.log('Message sent via socket');
      } else {
        console.warn('Socket not connected, message saved to DB only');
      }

      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (date) => {
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (d.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.createdAt).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="bg-white border-b p-4 flex items-center space-x-3 shadow-sm">
        <img
          src={otherUser.profilePic}
          alt={otherUser.name}
          className="w-12 h-12 rounded-full"
        />
        <div>
          <p className="font-semibold text-gray-800">{otherUser.name}</p>
          <p className="text-xs text-gray-500">{otherUser.email}</p>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-gray-500 mt-2 text-sm">Loading messages...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <div className="text-center">
              <div className="text-5xl mb-3">👋</div>
              <p className="text-gray-600">No messages yet.</p>
              <p className="text-sm text-gray-500 mt-1">Start the conversation!</p>
            </div>
          </div>
        ) : (
          <>
            {Object.keys(groupedMessages).map((date) => (
              <div key={date}>
                {/* Date Separator */}
                <div className="flex justify-center my-4">
                  <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                    {formatDate(new Date(date))}
                  </span>
                </div>

                {/* Messages for this date */}
                {groupedMessages[date].map((msg, index) => {
                  const isOwn = msg.senderId._id === user._id || msg.senderId === user._id;
                  
                  return (
                    <div
                      key={msg._id || index}
                      className={`flex mb-4 ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                          isOwn
                            ? 'bg-blue-600 text-white rounded-br-sm'
                            : 'bg-white text-gray-800 border rounded-bl-sm shadow-sm'
                        }`}
                      >
                        <p className="break-words">{msg.message}</p>
                        <p
                          className={`text-xs mt-1 ${
                            isOwn ? 'text-blue-100' : 'text-gray-500'
                          }`}
                        >
                          {formatTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="border-t p-4 bg-white">
        <div className="flex space-x-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 border rounded-full px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
            maxLength={1000}
            disabled={sending}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            disabled={!newMessage.trim() || sending}
          >
            {sending ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </span>
            ) : (
              'Send'
            )}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          {newMessage.length}/1000 characters
        </p>
      </form>
    </div>
  );
};

export default ChatWindow;