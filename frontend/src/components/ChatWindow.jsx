import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { io } from 'socket.io-client';

const ChatWindow = ({ chatId, otherUser }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Fetch existing messages
    const fetchMessages = async () => {
      try {
        const { data } = await api.get(`/messages/${chatId}`);
        setMessages(data);
      } catch (error) {
        console.error('Failed to fetch messages');
      }
    };

    fetchMessages();

    // Setup socket connection
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      secure: socketUrl.startsWith('https'),
      withCredentials: true,
      reconnectionAttempts: 5,
    });
    setSocket(newSocket);

    newSocket.on('connect', () => console.log('Socket connected:', newSocket.id));
    newSocket.on('connect_error', (err) => console.error('Socket connect error:', err));

    newSocket.emit('join', user._id);

    newSocket.on('receiveMessage', (data) => {
      if (data.chatId === chatId) {
        setMessages((prev) => [...prev, data]);
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [chatId, user._id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const { data } = await api.post('/messages', {
        chatId,
        receiverId: otherUser._id,
        message: newMessage
      });

      setMessages((prev) => [...prev, data]);
      
      if (socket) {
        socket.emit('sendMessage', {
          receiverId: otherUser._id,
          senderId: user._id,
          message: newMessage,
          chatId
        });
      }

      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message');
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="bg-blue-600 text-white p-4 flex items-center space-x-3">
        <img
          src={otherUser.profilePic}
          alt={otherUser.name}
          className="w-10 h-10 rounded-full"
        />
        <div>
          <p className="font-semibold">{otherUser.name}</p>
          <p className="text-xs text-blue-100">{otherUser.email}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {messages.length === 0 ? (
          <p className="text-center text-gray-500 mt-8">No messages yet. Start the conversation!</p>
        ) : (
          messages.map((msg, index) => {
            const isOwn = msg.senderId._id === user._id;
            return (
              <div
                key={index}
                className={`flex mb-4 ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    isOwn
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-800 border'
                  }`}
                >
                  <p>{msg.message}</p>
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
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="border-t p-4 bg-white">
        <div className="flex space-x-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            maxLength={1000}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            disabled={!newMessage.trim()}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;