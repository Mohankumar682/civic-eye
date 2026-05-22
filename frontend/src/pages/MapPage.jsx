import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import MapComponent from '../components/MapComponent';
import { AuthContext } from '../context/AuthContext';
import { MapPin, Filter, RefreshCw } from 'lucide-react';

const MapPage = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    fetchIssues();
  }, [filter]);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      let queryParam = '';
      if (filter !== 'all') {
        queryParam = `?status=${filter}`;
      }
      const res = await axios.get(`http://localhost:5000/api/issues${queryParam}`);
      setIssues(res.data || []);
    } catch (err) {
      console.error('Error fetching issues:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredIssues = issues.filter(issue => issue.location?.lat && issue.location?.lng);

  const statusFilters = [
    { value: 'all', label: 'All Issues' },
    { value: 'pending', label: 'Pending' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'resolved', label: 'Resolved' },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
              <MapPin className="text-primary" size={32} />
              Civic Issues Map
            </h1>
            <p className="text-slate-400 mt-2">
              {isAdmin
                ? 'View all reported issues across the city with precise locations'
                : 'Explore civic issues in your area'
              }
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            {isAdmin && (
              <div className="flex gap-2">
                {statusFilters.map((item) => (
                  <button
                    key={item.value}
                    onClick={() => setFilter(item.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      filter === item.value
                        ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={fetchIssues}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/20 text-secondary border border-secondary/30 hover:bg-secondary/30 transition-all duration-200"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-4 text-sm text-slate-400">
          <span className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            High Priority
          </span>
          <span className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            Medium Priority
          </span>
          <span className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            Low Priority
          </span>
          <span className="ml-4 text-slate-300">
            {filteredIssues.length} issues shown on map
          </span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="glass-card p-6"
      >
        <div className="h-[70vh] rounded-2xl overflow-hidden border border-white/10">
          {loading ? (
            <div className="flex h-full items-center justify-center bg-slate-950 text-slate-400">
              <div className="text-center">
                <RefreshCw className="mx-auto mb-4 animate-spin" size={32} />
                <p>Loading map...</p>
              </div>
            </div>
          ) : (
            <MapComponent issues={filteredIssues} />
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default MapPage;