import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './utils/api';
import './Collectors.css';

const Collectors = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userData, setUserData] = useState(null);
  const [userType, setUserType] = useState(null);
  const [collectorLocation, setCollectorLocation] = useState('');
  const [showLocationForm, setShowLocationForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("greenovation_user"));
    const storedUserType = localStorage.getItem("greenovation_user_type");
    
    if (!storedUser || storedUserType !== 'collector') {
      navigate('/');
      return;
    }
    
    setUserData(storedUser);
    setUserType(storedUserType);
    
    if (storedUser) {
      fetchRequests();
      // Load collector's saved location
      if (storedUser.gps) {
        const gpsStr = typeof storedUser.gps === 'object' ? `${storedUser.gps.x}, ${storedUser.gps.y}` : storedUser.gps;
        setCollectorLocation(gpsStr);
      }
    }
  }, [navigate]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/requests/all');
      setRequests(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch requests');
      setLoading(false);
    }
  };

  const handleCollectRequest = async (requestId) => {
    try {
      if (!collectorLocation) {
        setError('Please set your location first');
        setShowLocationForm(true);
        return;
      }

      const response = await api.put('/api/requests/collect', {
        request_id: requestId,
        collector_location: collectorLocation
      });

      // Update request status in local state
      setRequests(requests.map(req => 
        req.id === requestId 
          ? { ...req, status: 'assigned', collector_id: userData.id }
          : req
      ));
      alert('Request collected successfully!');
    } catch (err) {
      setError('Failed to collect request');
    }
  };

  const handleCompleteRequest = async (requestId) => {
    try {
      const response = await api.put('/api/requests/complete', {
        request_id: requestId
      });

      // Update request status in local state
      setRequests(requests.map(req => 
        req.id === requestId 
          ? { ...req, status: 'completed', completed_at: new Date().toISOString() }
          : req
      ));
      alert('Request completed successfully!');
    } catch (err) {
      setError('Failed to complete request');
    }
  };

  const handleGetGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCollectorLocation(`${latitude},${longitude}`);
        },
        (error) => {
          setError("Failed to get GPS location");
          console.error("Geolocation error:", error);
        }
      );
    } else {
      setError("Browser does not support geolocation");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ffc107';
      case 'assigned': return '#28a745';
      case 'in_progress': return '#007bff';
      case 'completed': return '#6c757d';
      default: return '#6c757d';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return '⏳ Pending';
      case 'assigned': return '✅ Assigned';
      case 'in_progress': return '🔄 In Progress';
      case 'completed': return '✅ Completed';
      default: return status;
    }
  };

  if (!userData) {
    return <div className="collectors-container">
      <div className="auth-message">
        <h2>🔒 Authentication Required</h2>
        <p>Please log in as a collector to access this page.</p>
        <button onClick={() => navigate('/')} className="home-btn">Go to Home</button>
      </div>
    </div>;
  }

  return (
    <div className="collectors-container">
      <div className="collectors-header">
        <h1>🚛️ Collector Dashboard</h1>
        <p>Available collection requests in your area</p>
      </div>

      {/* Location Setup */}
      <div className="location-section">
        <div className="location-header">
          <h3>📍 Your Location</h3>
          <button 
            onClick={() => setShowLocationForm(!showLocationForm)}
            className="location-toggle-btn"
          >
            {showLocationForm ? 'Hide' : 'Update'} Location
          </button>
        </div>
        
        {showLocationForm && (
          <div className="location-form">
            <div className="form-group">
              <label>GPS Coordinates</label>
              <div className="gps-input-group">
                <input
                  type="text"
                  value={collectorLocation}
                  onChange={(e) => setCollectorLocation(e.target.value)}
                  placeholder="latitude,longitude"
                  className="gps-input"
                />
                <button
                  type="button"
                  onClick={handleGetGPS}
                  className="gps-btn"
                >
                  📍 Get GPS
                </button>
              </div>
            </div>
          </div>
        )}
        
        {collectorLocation && !showLocationForm && (
          <div className="current-location">
            <strong>Current Location:</strong> {collectorLocation}
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError('')} className="close-error">×</button>
        </div>
      )}

      {/* Requests List */}
      <div className="requests-section">
        <h2>📦 All Requests</h2>
        
        {loading ? (
          <div className="loading">Loading requests...</div>
        ) : requests.length === 0 ? (
          <div className="no-requests">
            <h3>No requests available</h3>
            <p>Check back later for new collection requests.</p>
          </div>
        ) : (
          <div className="requests-grid">
            {requests.map(request => (
              <div key={request.id} className="request-card">
                <div className="request-header">
                  <span className="request-id">#{request.id}</span>
                  <span 
                    className="request-status"
                    style={{ backgroundColor: getStatusColor(request.status) }}
                  >
                    {getStatusText(request.status)}
                  </span>
                </div>
                
                <div className="request-content">
                  <div className="request-info">
                    <h4>📦 Weight: {request.weight} kg</h4>
                    <p>📍 Location: {request.location}</p>
                    {request.description && (
                      <p>📝 Description: {request.description}</p>
                    )}
                    {request.gps && (
                      <p>🗺️ GPS: {typeof request.gps === 'object' ? `${request.gps.x}, ${request.gps.y}` : request.gps}</p>
                    )}
                    {request.collector_id && (
                      <p>👤 Assigned to Collector: #{request.collector_id}</p>
                    )}
                  </div>
                  
                  <div className="request-meta">
                    <small>Created: {new Date(request.created_at).toLocaleDateString()}</small>
                    {request.collected_at && (
                      <small>Collected: {new Date(request.collected_at).toLocaleDateString()}</small>
                    )}
                  </div>
                </div>
                
                <div className="request-actions">
                  {request.status === 'pending' ? (
                    <button
                      onClick={() => handleCollectRequest(request.id)}
                      className="collect-btn"
                    >
                      🚛️ Collect Request
                    </button>
                  ) : (request.status === 'assigned' || request.status === 'in_progress') && request.collector_id === userData.id ? (
                    <button
                      onClick={() => handleCompleteRequest(request.id)}
                      className="complete-btn"
                    >
                      ✅ Mark as Completed
                    </button>
                  ) : (
                    <div className="request-status-info">
                      {request.status === 'assigned' && request.collector_id !== userData.id && (
                        <span>🔒 Already assigned to another collector</span>
                      )}
                      {request.status === 'in_progress' && request.collector_id !== userData.id && (
                        <span>🔄 In progress with another collector</span>
                      )}
                      {request.status === 'completed' && (
                        <span>✅ Request completed</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* My Collections */}
      <div className="my-collections-section">
        <h2>📋 My Collections</h2>
        <div className="collections-grid">
          {requests
            .filter(request => request.collector_id === userData.id)
            .map(request => (
              <div key={request.id} className="collection-card">
                <div className="collection-header">
                  <span className="request-id">#{request.id}</span>
                  <span 
                    className="request-status"
                    style={{ backgroundColor: getStatusColor(request.status) }}
                  >
                    {getStatusText(request.status)}
                  </span>
                </div>
                
                <div className="collection-info">
                  <h4>📦 {request.weight} kg</h4>
                  <p>📍 {request.location}</p>
                  <small>Collected: {new Date(request.created_at).toLocaleDateString()}</small>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Collectors;
