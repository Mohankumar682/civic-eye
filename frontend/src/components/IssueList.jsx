import { useState, useEffect } from 'react';
import axios from 'axios';
import IssueCard from './IssueCard';
import { Search, Filter, Loader } from 'lucide-react';
import '../styles/IssueList.css';

export default function IssueList({ showAdmin = false }) {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    priority: '',
    sort: 'newest'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchIssues();
  }, [filters]);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.priority) queryParams.append('priority', filters.priority);
      if (filters.sort) queryParams.append('sort', filters.sort);

      const res = await axios.get(`http://localhost:5000/api/issues?${queryParams}`);
      let data = res.data;

      if (searchTerm) {
        data = data.filter(issue =>
          issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          issue.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      setIssues(data);
    } catch (err) {
      console.error('Error fetching issues:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === filters[key] ? '' : value
    }));
  };

  const handleDelete = (issueId) => {
    setIssues(issues.filter(i => i._id !== issueId));
  };

  const handleUpdate = (updatedIssue) => {
    setIssues(issues.map(i => i._id === updatedIssue._id ? updatedIssue : i));
  };

  return (
    <div className="issue-list-container">
      <div className="list-controls">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search issues..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              fetchIssues();
            }}
          />
        </div>
        <button 
          className={`btn-filters ${showFilters ? 'active' : ''}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter size={20} />
          Filters
        </button>
      </div>

      {showFilters && (
        <div className="filters-panel">
          <div className="filter-group">
            <h4>Status</h4>
            <div className="filter-options">
              {['pending', 'in-progress', 'resolved'].map(status => (
                <button
                  key={status}
                  className={`filter-btn ${filters.status === status ? 'active' : ''}`}
                  onClick={() => handleFilterChange('status', status)}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <h4>Category</h4>
            <div className="filter-options">
              {['Garbage', 'Roads', 'Streetlights', 'Water', 'Drainage', 'Other'].map(category => (
                <button
                  key={category}
                  className={`filter-btn ${filters.category === category ? 'active' : ''}`}
                  onClick={() => handleFilterChange('category', category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <h4>Priority</h4>
            <div className="filter-options">
              {['high', 'medium', 'low'].map(priority => (
                <button
                  key={priority}
                  className={`filter-btn ${filters.priority === priority ? 'active' : ''}`}
                  onClick={() => handleFilterChange('priority', priority)}
                >
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <h4>Sort By</h4>
            <select 
              value={filters.sort} 
              onChange={(e) => setFilters(prev => ({ ...prev, sort: e.target.value }))}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="upvotes">Most Upvoted</option>
            </select>
          </div>
        </div>
      )}

      <div className="issues-count">
        <h3>{issues.length} issues found</h3>
      </div>

      {loading ? (
        <div className="loading">
          <Loader className="loader-spin" size={40} />
          <p>Loading issues...</p>
        </div>
      ) : issues.length === 0 ? (
        <div className="no-issues">
          <p>No issues found. Be the first to report one!</p>
        </div>
      ) : (
        <div className="issues-grid">
          {issues.map(issue => (
            <IssueCard
              key={issue._id}
              issue={issue}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              showAdmin={showAdmin}
            />
          ))}
        </div>
      )}
    </div>
  );
}
