// frontend/src/pages/Home.jsx
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6">
            Travel Together, <br />
            <span className="text-blue-600">Help Each Other</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10">
            Connect with fellow travelers on similar routes. Share rides, carry items, 
            or offer assistance. Make traveling easier and more connected.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <>
                <Link
                  to="/find-routes"
                  className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition shadow-lg"
                >
                  🔍 Find Routes
                </Link>
                <Link
                  to="/post-route"
                  className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition shadow-lg border-2 border-blue-600"
                >
                  ✈️ Post Route
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/signup"
                  className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition shadow-lg"
                >
                  Get Started
                </Link>
                <Link
                  to="/login"
                  className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition shadow-lg border-2 border-blue-600"
                >
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
          How It Works
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white rounded-lg p-8 shadow-lg text-center">
            <div className="text-5xl mb-4">📍</div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Post Your Route</h3>
            <p className="text-gray-600">
              Share your travel plans including source, destination, date, and mode of transport.
            </p>
          </div>

          <div className="bg-white rounded-lg p-8 shadow-lg text-center">
            <div className="text-5xl mb-4">🤝</div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Connect & Request</h3>
            <p className="text-gray-600">
              Find travelers on similar routes and send help requests for assistance.
            </p>
          </div>

          <div className="bg-white rounded-lg p-8 shadow-lg text-center">
            <div className="text-5xl mb-4">💬</div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Chat & Coordinate</h3>
            <p className="text-gray-600">
              Use real-time chat to coordinate details and finalize arrangements.
            </p>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Why Choose OnTheWay?
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="flex items-start space-x-4">
              <div className="text-3xl">✅</div>
              <div>
                <h4 className="font-bold text-gray-800 mb-2">Safe & Verified</h4>
                <p className="text-gray-600">Connect with verified travelers in a secure environment.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="text-3xl">💰</div>
              <div>
                <h4 className="font-bold text-gray-800 mb-2">Cost Effective</h4>
                <p className="text-gray-600">Share rides and expenses to make travel more affordable.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="text-3xl">🌍</div>
              <div>
                <h4 className="font-bold text-gray-800 mb-2">Community Driven</h4>
                <p className="text-gray-600">Join a community of helpful travelers worldwide.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="text-3xl">⚡</div>
              <div>
                <h4 className="font-bold text-gray-800 mb-2">Real-Time Updates</h4>
                <p className="text-gray-600">Get instant notifications and live chat support.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;