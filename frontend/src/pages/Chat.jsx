import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ChatWindow from '../components/ChatWindow';

const Chat = () => {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId');
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    if (userId && user) {
      // Generate chatId and fetch user details
      const chatId = [user._id, userId].sort().join('_');
      fetchUserDetails(userId, chatId);
    }
  }, [userId, user]);

  const fetchChats = async () => {
    try {
      const { data } = await api.get('/messages/chats');
      setChats(data);
    } catch (error) {
      console.error('Failed to fetch chats');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async (otherUserId, chatId) => {
    try {
      // For simplicity, we'll create a temporary user object
      // In production, you'd have an endpoint to fetch user details
      setSelectedChat(chatId);
      // Note: You might want to add an API endpoint to get user by ID
      // For now, we'll handle this in the ChatWindow component
    } catch (error) {
      console.error('Failed to fetch user details');
    }
  };

  const handleChatSelect = (chat) => {
    const otherUserId =
      chat.senderId._id === user._id ? chat.receiverId._id : chat.senderId._id;
    const otherUserData =
      chat.senderId._id === user._id ? chat.receiverId : chat.senderId;
    
    const chatId = [user._id, otherUserId].sort().join('_');
    setSelectedChat(chatId);
    setOtherUser(otherUserData);
  };

  // Get other user from URL if provided
  useEffect(() => {
    if (userId && chats.length > 0) {
      const existingChat = chats.find(
        (chat) =>
          chat.senderId._id === userId || chat.receiverId._id === userId
      );
      if (existingChat) {
        handleChatSelect(existingChat);
      }
    }
  }, [userId, chats]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 mt-4">Loading chats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex">
      {/* Sidebar - Chat List */}
      <div className="w-80 bg-white border-r flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">Messages</h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          {chats.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">No conversations yet.</p>
              <p className="text-sm text-gray-500 mt-2">
                Accept a connection request to start chatting.
              </p>
            </div>
          ) : (
            chats.map((chat, index) => {
              const otherUserData =
                chat.senderId._id === user._id ? chat.receiverId : chat.senderId;
              const chatId = [user._id, otherUserData._id].sort().join('_');
              const isSelected = selectedChat === chatId;

              return (
                <div
                  key={index}
                  onClick={() => {
                    setSelectedChat(chatId);
                    setOtherUser(otherUserData);
                  }}
                  className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition ${
                    isSelected ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={otherUserData.profilePic}
                      alt={otherUserData.name}
                      className="w-12 h-12 rounded-full"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 truncate">
                        {otherUserData.name}
                      </p>
                      <p className="text-sm text-gray-600 truncate">{chat.message}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat && otherUser ? (
          <ChatWindow chatId={selectedChat} otherUser={otherUser} />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <p className="text-gray-600 text-lg">Select a conversation to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
