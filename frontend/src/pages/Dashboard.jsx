import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import RequestCard from '../components/RequestCard';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('routes');
  const [myRoutes, setMyRoutes] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [routesRes, incomingRes, outgoingRes, connectionsRes] = await Promise.all([
        api.get('/routes/my-routes'),
        api.get('/requests/incoming'),
        api.get('/requests/outgoing'),
        api.get('/requests/connections')
      ]);

      setMyRoutes(routesRes.data);
      setIncomingRequests(incomingRes.data);
      setOutgoingRequests(outgoingRes.data);
      setConnections(connectionsRes.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const tabs = [
    { id: 'routes', label: 'My Routes', count: myRoutes.length },
    { id: 'incoming', label: 'Incoming Requests', count: incomingRequests.length },
    { id: 'outgoing', label: 'Outgoing Requests', count: outgoingRequests.length },
    { id: 'connections', label: 'Connections', count: connections.length }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 mt-4">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <Link
            to="/post-route"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
          >
            + Post New Route
          </Link>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-6 py-4 font-medium transition whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab.label}
                <span className="ml-2 bg-gray-200 px-2 py-1 rounded-full text-xs">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* My Routes Tab */}
          {activeTab === 'routes' && (
            <>
              {myRoutes.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                  <p className="text-gray-600 text-lg mb-4">You haven't posted any routes yet.</p>
                  <Link
                    to="/post-route"
                    className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
                  >
                    Post Your First Route
                  </Link>
                </div>
              ) : (
                myRoutes.map((route) => (
                  <div key={route._id} className="bg-white rounded-lg shadow-md p-6">
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
                    <p className="text-gray-700">{route.description}</p>
                  </div>
                ))
              )}
            </>
          )}

          {/* Incoming Requests Tab */}
          {activeTab === 'incoming' && (
            <>
              {incomingRequests.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                  <p className="text-gray-600 text-lg">No incoming requests yet.</p>
                </div>
              ) : (
                incomingRequests.map((request) => (
                  <RequestCard
                    key={request._id}
                    request={request}
                    type="incoming"
                    onUpdate={fetchData}
                  />
                ))
              )}
            </>
          )}

          {/* Outgoing Requests Tab */}
          {activeTab === 'outgoing' && (
            <>
              {outgoingRequests.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                  <p className="text-gray-600 text-lg mb-4">You haven't sent any requests yet.</p>
                  <Link
                    to="/find-routes"
                    className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
                  >
                    Find Routes
                  </Link>
                </div>
              ) : (
                outgoingRequests.map((request) => (
                  <RequestCard
                    key={request._id}
                    request={request}
                    type="outgoing"
                    onUpdate={fetchData}
                  />
                ))
              )}
            </>
          )}

          {/* Connections Tab */}
          {activeTab === 'connections' && (
            <>
              {connections.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                  <p className="text-gray-600 text-lg">No active connections yet.</p>
                </div>
              ) : (
                connections.map((connection) => {
                  const otherUser =
                    connection.senderId._id === JSON.parse(localStorage.getItem('user'))._id
                      ? connection.receiverId
                      : connection.senderId;

                  return (
                    <div key={connection._id} className="bg-white rounded-lg shadow-md p-6">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                          <img
                            src={otherUser.profilePic}
                            alt={otherUser.name}
                            className="w-16 h-16 rounded-full"
                          />
                          <div>
                            <p className="font-bold text-gray-800 text-lg">{otherUser.name}</p>
                            <p className="text-sm text-gray-500">{otherUser.email}</p>
                            {connection.routeId && (
                              <p className="text-sm text-gray-600 mt-1">
                                Route: {connection.routeId.source} → {connection.routeId.destination}
                              </p>
                            )}
                          </div>
                        </div>
                        <Link
                          to={`/chat?userId=${otherUser._id}`}
                          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                        >
                          💬 Chat
                        </Link>
                      </div>
                    </div>
                  );
                })
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;