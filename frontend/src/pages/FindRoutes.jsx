import { useState, useEffect } from 'react';
import api from '../services/api';
import RouteCard from '../components/RouteCard';

const FindRoutes = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    source: '',
    destination: '',
    date: ''
  });

  const fetchRoutes = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.source) params.append('source', filters.source);
      if (filters.destination) params.append('destination', filters.destination);
      if (filters.date) params.append('date', filters.date);

      const { data } = await api.get(`/routes?${params.toString()}`);
      setRoutes(data);
    } catch (error) {
      console.error('Failed to fetch routes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchRoutes();
  };

  const handleClearFilters = () => {
    setFilters({ source: '', destination: '', date: '' });
    setTimeout(fetchRoutes, 0);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Find Routes</h1>

        {/* Search Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Source</label>
                <input
                  type="text"
                  name="source"
                  value={filters.source}
                  onChange={handleFilterChange}
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Enter source city"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Destination</label>
                <input
                  type="text"
                  name="destination"
                  value={filters.destination}
                  onChange={handleFilterChange}
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Enter destination city"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Date</label>
                <input
                  type="date"
                  name="date"
                  value={filters.date}
                  onChange={handleFilterChange}
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Search
              </button>
              <button
                type="button"
                onClick={handleClearFilters}
                className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition"
              >
                Clear Filters
              </button>
            </div>
          </form>
        </div>

        {/* Routes List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 mt-4">Loading routes...</p>
          </div>
        ) : routes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-600 text-lg">No routes found matching your criteria.</p>
            <p className="text-gray-500 mt-2">Try adjusting your search filters.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {routes.map((route) => (
              <RouteCard key={route._id} route={route} onRequestSent={fetchRoutes} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FindRoutes;