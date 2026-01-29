import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Offers.css';

const Offers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userData, setUserData] = useState(null);
  const [userType, setUserType] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    gps: '',
    material_type: 'plastic'
  });
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("greenovation_user"));
    const storedUserType = localStorage.getItem("greenovation_user_type");
    
    if (!storedUser || storedUserType !== 'seller') {
      navigate('/');
      return;
    }
    
    setUserData(storedUser);
    setUserType(storedUserType);
    
    if (storedUser) {
      fetchOffers();
      // Load seller's saved location
      if (storedUser.gps) {
        setForm(prev => ({ ...prev, gps: storedUser.gps }));
      }
    }
  }, [navigate]);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:4000/api/offers/${userData.id}`);
      const data = await response.json();
      
      if (response.ok) {
        setOffers(data);
      } else {
        setError(data.error || 'Failed to fetch offers');
      }
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch offers');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.title || !form.price || !form.location) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch('http://localhost:4000/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          seller_id: userData.id,
          price: parseFloat(form.price)
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setOffers([data.offer, ...offers]);
        setForm({
          title: '',
          description: '',
          price: '',
          location: '',
          gps: form.gps,
          material_type: 'plastic'
        });
        setShowForm(false);
        setError('');
        alert('Offer created successfully!');
      } else {
        setError(data.error || 'Failed to create offer');
      }
    } catch (err) {
      setError('Failed to create offer');
    }
  };

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleGetGPS = () => {
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
  };

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const handleDeleteOffer = async (offerId) => {
    // Using React state for confirmation instead of window.confirm
    if (showDeleteConfirm !== offerId) {
      setShowDeleteConfirm(offerId);
      return;
    }

    try {
      const response = await fetch(`http://localhost:4000/api/offers/${offerId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setOffers(offers.filter(offer => offer.id !== offerId));
        setShowDeleteConfirm(null);
        alert('Offer deleted successfully!');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete offer');
      }
    } catch (err) {
      setError('Failed to delete offer');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#28a745';
      case 'inactive': return '#6c757d';
      case 'sold': return '#007bff';
      default: return '#6c757d';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return '🟢 Active';
      case 'inactive': return '⚫ Inactive';
      case 'sold': return '💰 Sold';
      default: return status;
    }
  };

//   const getMaterialIcon = (type) => {
//     switch (type) {
//       case 'plastic': return '🍶';
//       case 'paper': return '📄';
//       case 'metal': return '🔧';
//       case 'glass': return '🍾';
//       case 'organic': return '🌿';
//       default: return '♻️';
//     }
//   };
const getMaterialIcon = (type) => {
  switch (type) {
    case 'plastic': return '[Plastic]';
    case 'paper': return '[Paper]';
    case 'metal': return '[Metal]';
    case 'glass': return '[Glass]';
    case 'organic': return '[Organic]';
    default: return '[Recycle]';
  }
};

  if (!userData) {
    return <div className="offers-container">
      <div className="auth-message">
        <h2>🔒 Authentication Required</h2>
        <p>Please log in as a seller to access this page.</p>
        <button onClick={() => navigate('/')} className="home-btn">Go to Home</button>
      </div>
    </div>;
  }

  return (
    <div className="offers-container">
      <div className="offers-header">
        <h1>💰 Seller Dashboard</h1>
        <p>Manage your recycling offers and materials</p>
      </div>

      {/* Add Offer Button */}
      <div className="offer-actions">
        <button 
          onClick={() => setShowForm(!showForm)}
          className="add-offer-btn"
        >
          {showForm ? 'Cancel' : '➕ Add New Offer'}
        </button>
      </div>

      {/* Offer Form */}
      {showForm && (
        <div className="offer-form-container">
          <div className="offer-form">
            <h3>Create New Offer</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Title*</label>
                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Plastic Bottles - 50kg"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Price (EGP)*</label>
                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Material Type*</label>
                  <select
                    name="material_type"
                    value={form.material_type}
                    onChange={handleInputChange}
                    required
                  >
                    {/* <option value="plastic">🍶 Plastic</option>
                    <option value="paper">📄 Paper</option>
                    <option value="metal">🔧 Metal</option>
                    <option value="glass">🍾 Glass</option>
                    <option value="organic">🌿 Organic</option>
                  </select> */}
                    <option value="plastic">[Plastic]</option>
                    <option value="paper">[Paper]</option>
                    <option value="metal">[Metal]</option>
                    <option value="glass">[Glass]</option>
                    <option value="organic">[Organic]</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Location*</label>
                  <input
                    type="text"
                    name="location"
                    value={form.location}
                    onChange={handleInputChange}
                    placeholder="Pickup location"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>GPS Coordinates</label>
                <div className="gps-input-group">
                  <input
                    type="text"
                    name="gps"
                    value={form.gps}
                    onChange={handleInputChange}
                    placeholder="latitude,longitude"
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

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleInputChange}
                  placeholder="Describe the materials and conditions"
                  rows="3"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-btn">Create Offer</button>
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
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError('')} className="close-error">×</button>
        </div>
      )}

      {/* Offers List */}
      <div className="offers-section">
        <h2>📦 My Offers</h2>
        
        {loading ? (
          <div className="loading">Loading offers...</div>
        ) : offers.length === 0 ? (
          <div className="no-offers">
            <h3>No offers yet</h3>
            <p>Start by creating your first recycling offer!</p>
          </div>
        ) : (
          <div className="offers-grid">
            {offers.map(offer => (
              <div key={offer.id} className="offer-card">
                <div className="offer-header">
                  <span className="offer-id">#{offer.id}</span>
                  <span 
                    className="offer-status"
                    style={{ backgroundColor: getStatusColor(offer.status) }}
                  >
                    {getStatusText(offer.status)}
                  </span>
                </div>
                
                <div className="offer-content">
                  <div className="offer-title">
                    <span className="material-icon">{getMaterialIcon(offer.material_type)}</span>
                    <h3>{offer.title}</h3>
                  </div>
                  
                  <div className="offer-price">
                    <span className="price-label">Price:</span>
                    <span className="price-value">EGP {offer.price}</span>
                  </div>
                  
                  <div className="offer-info">
                    <p>📍 {offer.location}</p>
                    {offer.gps && (
                      <p>🗺️ GPS: {typeof offer.gps === 'object' ? `${offer.gps.x}, ${offer.gps.y}` : offer.gps}</p>
                    )}
                    {offer.description && (
                      <p>📝 {offer.description}</p>
                    )}
                  </div>
                  
                  <div className="offer-meta">
                    <small>Created: {new Date(offer.created_at).toLocaleDateString()}</small>
                  </div>
                </div>
                
                <div className="offer-actions">
                  {showDeleteConfirm === offer.id ? (
                    <div className="confirm-delete">
                      <span>Are you sure?</span>
                      <button
                        onClick={() => handleDeleteOffer(offer.id)}
                        className="confirm-yes"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(null)}
                        className="confirm-no"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleDeleteOffer(offer.id)}
                      className="delete-btn"
                    >
                      🗑️ Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Offers;
