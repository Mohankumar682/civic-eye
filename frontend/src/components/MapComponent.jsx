import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import '../styles/MapComponent.css';

// Fix Leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const getMarkerColor = (priority) => {
  const colors = {
    high: '#dc2626',
    medium: '#f59e0b',
    low: '#10b981'
  };
  return colors[priority] || '#6b7280';
};

const createCustomIcon = (priority) => {
  const color = getMarkerColor(priority);
  return L.divIcon({
    className: 'custom-icon',
    html: `<div style="
      background-color: ${color};
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 4px 6px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      color: white;
      font-size: 14px;
    ">●</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

function ChangeView({ center, zoom }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

const MapComponent = ({ issues = [] }) => {
  const [center, setCenter] = useState([20.5937, 78.9629]); // India center
  const [allIssues, setAllIssues] = useState(issues);

  useEffect(() => {
    if (issues && issues.length > 0) {
      setAllIssues(issues);
      // Calculate center from issues
      const avgLat = issues.reduce((sum, i) => sum + (i.location?.lat || 0), 0) / issues.length;
      const avgLng = issues.reduce((sum, i) => sum + (i.location?.lng || 0), 0) / issues.length;
      if (avgLat && avgLng) {
        setCenter([avgLat, avgLng]);
      }
    } else {
      // Fetch all issues if not provided
      fetchIssues();
    }
  }, [issues]);

  const fetchIssues = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/issues');
      if (res.data && res.data.length > 0) {
        setAllIssues(res.data);
        const avgLat = res.data.reduce((sum, i) => sum + (i.location?.lat || 0), 0) / res.data.length;
        const avgLng = res.data.reduce((sum, i) => sum + (i.location?.lng || 0), 0) / res.data.length;
        if (avgLat && avgLng) {
          setCenter([avgLat, avgLng]);
        }
      }
    } catch (err) {
      console.error('Error fetching issues:', err);
    }
  };

  return (
    <div className="map-wrapper">
      <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%' }} className="map">
        <ChangeView center={center} zoom={12} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {allIssues && allIssues.map(issue => (
          issue?.location?.lat && issue?.location?.lng && (
            <Marker 
              key={issue._id} 
              position={[issue.location.lat, issue.location.lng]} 
              icon={createCustomIcon(issue.priority)}
            >
              <Popup className="map-popup">
                <div className="popup-content">
                  <h4>{issue.title}</h4>
                  <p className="category">{issue.category}</p>
                  <p className="description">{issue.description.substring(0, 80)}...</p>
                  <div className="popup-badges">
                    <span className={`badge priority-${issue.priority}`}>{issue.priority.toUpperCase()}</span>
                    <span className={`badge status-${issue.status}`}>{issue.status.toUpperCase()}</span>
                  </div>
                  <p className="upvotes">👍 {issue.upvotes?.length || 0}</p>
                </div>
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>
    </div>
  );
};

export default MapComponent;

