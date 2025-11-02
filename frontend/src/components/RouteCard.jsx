import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const RouteCard = ({ route, onRequestSent }) => {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const isOwnRoute = user && route.userId._id === user._id;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleSendRequest = async () => {
    if (!message.trim()) {
      alert('Please enter a message');
      return;
    }

    setLoading(true);
    try {
      await api.post('/requests', {
        receiverId: route.userId._id,
        routeId: route._id,
        message
      });
      alert('Request sent successfully!');
      setShowModal(false);
      setMessage('');
      if (onRequestSent) onRequestSent();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to send request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-800">
              {route.source} → {route.destination}
            </h3>
            <p className="text-gray-600 text-sm mt-1">{formatDate(route.date)}</p>
          </div>
          <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
            {route.mode}
          </span>
        </div>

        <p className="text-gray-700 mb-4">{route.description}</p>

        <div className="flex items-center justify-between border-t pt-4">
          <div className="flex items-center space-x-3">
            <img
              src={route.userId.profilePic}
              alt={route.userId.name}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <p className="font-medium text-gray-800">{route.userId.name}</p>
              <p className="text-sm text-gray-500">{route.userId.email}</p>
            </div>
          </div>

          {!isOwnRoute && user && (
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Request Help
            </button>
          )}
        </div>
      </div>

      {/* Request Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Send Help Request</h3>
            <p className="text-gray-600 mb-4">
              Send a message to {route.userId.name} about this route.
            </p>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Explain what help you need..."
              className="w-full border rounded-lg p-3 mb-4 h-32 resize-none focus:ring-2 focus:ring-blue-500 outline-none"
              maxLength={300}
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded hover:bg-gray-50 transition"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleSendRequest}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RouteCard;