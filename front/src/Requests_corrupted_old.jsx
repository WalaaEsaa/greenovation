import React, { useState, useEffect } from 'react';
import './Requests.css';

function Requests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [userData, setUserData] = useState(null);
  const [userType, setUserType] = useState(null);

  const [form, setForm] = useState({
    weight: '',
    location: '',
    description: '',
    gps: ''
  });

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("greenovation_user"));
    const storedUserType = localStorage.getItem("greenovation_user_type");
    setUserData(storedUser);
    setUserType(storedUserType);
    
    if (storedUser) {
      fetchRequests(storedUser, storedUserType);
    }
  }, []);

  const fetchRequests = async (user, type) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:4000/api/requests/user/${user.id}`);
      const data = await response.json();
      
      if (response.ok) {
        setRequests(data);
      } else {
        setError(data.error || 'Failed to fetch requests');
      }
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch requests');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.weight || !form.location) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      console.log('Creating request with user_id walaaaaa:', userData.id);
      console.log('Form data:', form);
      
      const response = await fetch('http://localhost:4000/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          user_id: userData.id,
          weight: parseFloat(form.weight),
          gps: form.gps || null
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setRequests([data.request, ...requests]);
        setForm({ weight: '', location: '', description: '', gps: '' });
        setShowForm(false);
        setError('');
      } else {
        setError(data.error || 'Failed to create request');
      }
    } catch (err) {
      setError('Failed to create request');
    }
  };

  const handleRespondToRequest = async (requestId, action) => {
    try {
      const response = await fetch('http://localhost:4000/api/requests/respond', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_id: requestId,
          user_id: userData.id,
          action: action // 'accept' or 'reject'
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        // Update request in local state
        setRequests(requests.map(req => 
          req.id === requestId ? data.request : req
        ));
        alert(`Request ${action}ed successfully!`);
      } else {
        setError(data.error || `Failed to ${action} request`);
      }
    } catch (err) {
      setError(`Failed to ${action} request`);
    }
  };

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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
      case 'assigned': return '✅ Assigned to Collector';
      case 'in_progress': return '🔄 In Progress';
      case 'completed': return '✅ Completed';
      default: return status;
    }
  };

  if (!userData) {
    return <div className="requests-container">
      <h2>Please login to view requests</h2>
    </div>;
  }

  if (loading) {
    return <div className="requests-container">
      <div className="loading">Loading requests...</div>
    </div>;
  }

  return (
    <div className="requests-container">
      <h1>My Requests</h1>
      
      {userType === 'user' && (
        <button 
          className="add-request-btn"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : '+ New Request'}
        </button>
      )}

      {error && <div className="error-message">{error}</div>}

      {showForm && userType === 'user' && (
        <div className="request-form">
          <h3>Create New Request</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Weight (kg)*</label>
              <input
                type="number"
                name="weight"
                value={form.weight}
                onChange={handleInputChange}
                step="0.1"
                min="0.1"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Location*</label>
              <input
                type="text"
                name="location"
                value={form.location}
                onChange={handleInputChange}
                placeholder="Enter pickup location"
                required
              />
            </div>
            
            <div className="form-group">
              <label>GPS Coordinates</label>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input
                  type="text"
                  name="gps"
                  value={form.gps}
                  onChange={handleInputChange}
                  placeholder="latitude,longitude"
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  className="gps-btn"
                  onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(
                        (position) => {
                          const { latitude, longitude } = position.coords;
                          setForm({ ...form, gps: `${latitude},${longitude}` });
                        },
                        (error) => {
                          setError("Failed to get GPS location");
                          console.error("Geolocation error:", error);
                        }
                      );
                    } else {
                      setError("Browser does not support geolocation");
                    }
                  }}
                >
                  📍 Get GPS
                </button>
              </div>
            </div>
            
            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleInputChange}
                placeholder="Describe the recyclable materials"
                rows="3"
              />
            </div>
            
            <div className="form-actions">
              <button type="submit" className="submit-btn">Submit Request</button>
              <button 
                type="button" 
                className="cancel-btn"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="requests-list">
        {requests.length === 0 ? (
          <div className="no-requests">
            <p>No requests found. Create your first request!</p>
          </div>
        ) : (
          requests.map(request => (
            <div key={request.id} className="request-card">
              <div className="request-header">
                <span 
                  className="request-status"
                  style={{ backgroundColor: getStatusColor(request.status) }}
                >
                  {getStatusText(request.status)}
                </span>
                <span className="request-id">#{request.id}</span>
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
              
              {request.status === 'assigned' && (
                <div className="request-actions">
                  <p style={{ marginBottom: '10px', textAlign: 'center', color: '#666' }}>
                    A collector has been assigned to your request. Do you accept?
                  </p>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => handleRespondToRequest(request.id, 'accept')}
                      className="accept-btn"
                    >
                      ✅ Accept
                    </button>
                    <button
                      onClick={() => handleRespondToRequest(request.id, 'reject')}
                      className="reject-btn"
                    >
                      ❌ Reject
                    </button>
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
            
            {request.status === 'assigned' && (
              <div className="request-actions">
                <p style={{ marginBottom: '10px', textAlign: 'center', color: '#666' }}>
                  A collector has been assigned to your request. Do you accept?
                </p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => handleRespondToRequest(request.id, 'accept')}
                    className="accept-btn"
                  >
                    ✅ Accept
                  </button>
                  <button
                    onClick={() => handleRespondToRequest(request.id, 'reject')}
                    className="reject-btn"
                  >
                    ❌ Reject
                  </button>
                </div>
              </div>
            )}
          </div>
        ))
      )}
          ))
        )}
      </div>
    </div>
  );
}

export default Requests;
