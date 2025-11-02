import api from '../services/api';

const RequestCard = ({ request, type, onUpdate }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleAccept = async () => {
    try {
      await api.put(`/requests/${request._id}`, { status: 'accepted' });
      alert('Request accepted!');
      if (onUpdate) onUpdate();
    } catch (error) {
      alert('Failed to accept request');
    }
  };

  const handleReject = async () => {
    try {
      await api.put(`/requests/${request._id}`, { status: 'rejected' });
      alert('Request rejected');
      if (onUpdate) onUpdate();
    } catch (error) {
      alert('Failed to reject request');
    }
  };

  const otherUser = type === 'incoming' ? request.senderId : request.receiverId;

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    accepted: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800'
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-3">
          <img
            src={otherUser.profilePic}
            alt={otherUser.name}
            className="w-12 h-12 rounded-full"
          />
          <div>
            <p className="font-semibold text-gray-800">{otherUser.name}</p>
            <p className="text-sm text-gray-500">{otherUser.email}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[request.status]}`}>
          {request.status}
        </span>
      </div>

      {request.routeId && (
        <div className="bg-gray-50 rounded p-3 mb-3">
          <p className="text-sm font-medium text-gray-700">
            {request.routeId.source} → {request.routeId.destination}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {formatDate(request.routeId.date)} • {request.routeId.mode}
          </p>
        </div>
      )}

      {request.message && (
        <p className="text-gray-700 mb-3 italic">"{request.message}"</p>
      )}

      <p className="text-xs text-gray-400 mb-3">
        Sent {formatDate(request.createdAt)}
      </p>

      {type === 'incoming' && request.status === 'pending' && (
        <div className="flex space-x-3">
          <button
            onClick={handleAccept}
            className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
          >
            Accept
          </button>
          <button
            onClick={handleReject}
            className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700 transition"
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );
};

export default RequestCard;