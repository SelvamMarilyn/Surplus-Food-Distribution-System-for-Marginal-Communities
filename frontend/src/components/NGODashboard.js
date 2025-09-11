import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './NGODashboard.css';
import DeliveryProofModal from './DeliveryProofModal';
import { api } from '../utils/api';

// Fix for default marker icons not showing up
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Custom icon for food locations
const foodIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Custom icon for NGO locations (marginal communities)
const ngoIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
// Custom icon for restaurants (red markers)
const restaurantIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
const NGODashboard = () => {
  const [activeTab, setActiveTab] = useState('available');
  const [availableFood, setAvailableFood] = useState([]);
  const [selectedRequests, setSelectedRequests] = useState([]);
  const [slumAreas, setSlumAreas] = useState([]);
  const [ngoInfo, setNgoInfo] = useState({
    name: '',
    email: '',
    area: '',
    peopleServed: 0,
    activeRequests: 0,
    lat: 12.9716,
    lng: 77.5946,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [newArea, setNewArea] = useState({ name: '', lat: '', lng: '', population: '', description: '' });
  const [restaurants, setRestaurants] = useState([]);
  // Helper component to capture clicks on the small picker map reliably
  const AreaPicker = ({ onPick }) => {
    useMapEvents({
      click: (e) => {
        onPick(e.latlng);
      }
    });
    return null;
  };
  // Add this function to load restaurants
  const loadRestaurants = async () => {
    try {
      const response = await api.get('/food/restaurants');
      setRestaurants(response.data || []);
    } catch (error) {
      console.error('Error loading restaurants:', error);
    }
  };


  // Load NGO data on component mount
  useEffect(() => {
    const ngoEmail = localStorage.getItem('ngoEmail');
    if (ngoEmail) {
      loadNgoInfo(ngoEmail);
      loadAvailableFood();
      loadNgoRequests(ngoEmail);
      loadSlumAreas();
    }
  }, []);

  // Refresh areas when user navigates to Map or Areas tab
  useEffect(() => {
    if (activeTab === 'map' || activeTab === 'areas') {
      loadSlumAreas();
      loadRestaurants(); // Add this line
    }
  }, [activeTab]);

  const loadNgoInfo = async (email) => {
    try {
      // In a real app, you'd fetch this from the backend
      setNgoInfo(prev => ({
        ...prev,
        email: email,
        name: email.split('@')[0] // Simple name extraction
      }));
    } catch (error) {
      console.error('Error loading NGO info:', error);
    }
  };

  const loadAvailableFood = async () => {
    try {
      setLoading(true);
      console.log('Loading available food...');
      const response = await api.get('/food/available');
      console.log('Available food response:', response.data);
      setAvailableFood(response.data);
    } catch (error) {
      console.error('Error loading available food:', error);
      console.error('Error response:', error.response);
      setMessage({ text: 'Failed to load available food', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const loadNgoRequests = async (email) => {
    try {
      const response = await api.get(`/food/requests/ngo/${email}`);
      setSelectedRequests(response.data);
      
      // Update NGO info with active requests count
      setNgoInfo(prev => ({
        ...prev,
        activeRequests: response.data.filter(req => req.status === 'Requested').length
      }));
    } catch (error) {
      console.error('Error loading NGO requests:', error);
    }
  };

  const loadSlumAreas = async () => {
    try {
      const response = await api.get('/food/slum-areas');
      setSlumAreas(response.data || []);
    } catch (error) {
      console.error('Error loading slum areas:', error);
    }
  };

  const handleCreateArea = async (e) => {
    e.preventDefault();
    try {
      const body = {
        name: newArea.name,
        lat: parseFloat(newArea.lat),
        lng: parseFloat(newArea.lng),
        population: parseInt(newArea.population || '0', 10),
        description: newArea.description
      };
      const res = await api.post('/food/slum-areas', body);
      setMessage({ text: 'Slum area added', type: 'success' });
      setNewArea({ name: '', lat: '', lng: '', population: '', description: '' });
      await loadSlumAreas();
    } catch (err) {
      console.error('Create area error:', err);
      setMessage({ text: 'Failed to add area', type: 'error' });
    }
  };

  const calculateTimeLeft = (expiryTime) => {
    const now = new Date();
    const expiry = new Date(expiryTime);
    const diff = expiry - now;
    if (diff < 0) return 'Expired';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const handleRequestFood = async (foodId) => {
    if (!ngoInfo.email) {
      setMessage({ text: 'Please login first', type: 'error' });
      return;
    }

    try {
      setLoading(true);
      const estimatedPickupTime = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now
      
      const response = await api.post('/food/request', {
        foodItemId: foodId,
        ngoEmail: ngoInfo.email,
        estimatedPickupTime: estimatedPickupTime.toISOString()
      });

      setMessage({ text: 'Food request submitted successfully!', type: 'success' });
      
      // Reload data
      loadAvailableFood();
      loadNgoRequests(ngoInfo.email);
    } catch (error) {
      console.error('Request food error:', error);
      setMessage({ 
        text: error.response?.data?.message || 'Failed to request food item', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkDelivered = (requestId) => {
    const request = selectedRequests.find(req => req.id === requestId);
    if (request) {
      setSelectedRequest(request);
      setIsModalOpen(true);
    }
  };

  const handleProofSubmission = async (proofData) => {
    try {
      setLoading(true);
      
      // Update request status to delivered
      const response = await api.put(`/food/requests/${proofData.foodItemId}/status`, {
        status: 'Delivered',
        deliveryProofPath: proofData.photoPath // This would be set by the modal
      });

      setMessage({ text: 'Proof of delivery submitted successfully!', type: 'success' });

      // Update the status of the item in the UI
      setSelectedRequests(prev => 
        prev.map(req => 
          req.id === proofData.foodItemId 
            ? { ...req, status: 'Delivered', delivered_at: new Date().toISOString() }
            : req
        )
      );
      
      // Reload requests
      loadNgoRequests(ngoInfo.email);
    } catch (error) {
      console.error('Proof submission error:', error);
      setMessage({ 
        text: error.response?.data?.message || 'Failed to submit proof', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
      setIsModalOpen(false);
      setSelectedRequest(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ngoEmail');
    localStorage.removeItem('ngoToken');
    window.location.href = '/';
  };

  return (
    <div className="ngo-dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>NGO Dashboard</h1>
          <div className="user-info">
            <span>Welcome, {ngoInfo.name}</span>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </header>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>{ngoInfo.peopleServed}</h3>
          <p>People Served</p>
        </div>
        <div className="stat-card">
          <h3>{selectedRequests.filter(req => req.status === 'Requested').length}</h3>
          <p>Active Requests</p>
        </div>
        <div className="stat-card">
          <h3>{availableFood.length}</h3>
          <p>Available Food</p>
        </div>
        <div className="stat-card">
          <h3>{slumAreas.length}</h3>
          <p>Service Areas</p>
        </div>
      </div>

      <div className="dashboard-content">
        <nav className="dashboard-nav">
          <button 
            className={activeTab === 'available' ? 'active' : ''}
            onClick={() => setActiveTab('available')}
          >
            Available Food
          </button>
          <button 
            className={activeTab === 'map' ? 'active' : ''}
            onClick={() => setActiveTab('map')}
          >
            Heat Map
          </button>
          <button 
            className={activeTab === 'requests' ? 'active' : ''}
            onClick={() => setActiveTab('requests')}
          >
            My Requests
          </button>
          <button 
            className={activeTab === 'history' ? 'active' : ''}
            onClick={() => setActiveTab('history')}
          >
            Delivery History
          </button>
          <button 
            className={activeTab === 'profile' ? 'active' : ''}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          <button 
            className={activeTab === 'areas' ? 'active' : ''}
            onClick={() => setActiveTab('areas')}
          >
            Slum Areas
          </button>
        </nav>

        <div className="tab-content">
          {activeTab === 'available' && (
            <div className="available-section">
              <h2>Available Food for Pickup</h2>
              <div className="food-sort-filter">
                <label>Sort by:</label>
                <select className="filter-select">
                  <option value="distance">Distance</option>
                  <option value="expiry">Expiry Time</option>
                  <option value="quantity">Quantity</option>
                </select>
              </div>
              <div className="food-grid">
                {loading ? (
                  <div className="loading">
                    <p>Loading available food...</p>
                  </div>
                ) : availableFood.length > 0 ? availableFood.map(food => (
                  <div key={food.id} className="food-card">
                    <div className="food-image">
                      {food.photo_path && <img src={`http://localhost:5000${food.photo_path}`} alt={food.food_name} />}
                      <div className="urgency-badge">
                        {calculateTimeLeft(food.expiry_time)} left
                      </div>
                    </div>
                    <div className="food-details">
                      <h3>{food.food_name}</h3>
                      <p className="donor">From: {food.donor_name} ({food.restaurant_name})</p>
                      <div className="food-info">
                        <span><strong>Quantity:</strong> {food.quantity}</span>
                        <span><strong>Type:</strong> {food.food_type}</span>
                      </div>
                      <p className="description">{food.description}</p>
                      <div className="food-actions">
                        <button 
                          className="request-btn"
                          onClick={() => handleRequestFood(food.id)}
                          disabled={loading}
                        >
                          {loading ? 'Requesting...' : 'Request Food'}
                        </button>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="no-food">
                    <p>No food available at the moment</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {activeTab === 'map' && (
            <div className="map-section">
              <h2>Food Availability Heat Map</h2>
              <p>Shows available food locations (green markers) and registered service areas (blue markers). Multiple donations at the same location are slightly offset for visibility.</p>
              
              {/* Map Statistics */}
              <div className="map-stats" style={{ marginBottom: '1rem', padding: '0.5rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                <span style={{ marginRight: '1rem' }}>
                  📍 <strong>{availableFood.filter(food => food.lat && food.lng).length}</strong> items with locations
                </span>
                <span style={{ marginRight: '1rem' }}>
                  ❓ <strong>{availableFood.filter(food => !food.lat || !food.lng).length}</strong> items without locations
                </span>
                <span>
                  🏢 <strong>{new Set(availableFood.filter(food => food.lat && food.lng).map(food => `${food.donor_address}_${food.restaurant_name}`)).size}</strong> unique locations
                </span>
              </div>

              <div className="map-container">
                <MapContainer 
                  center={[ngoInfo.lat, ngoInfo.lng]} 
                  zoom={13} 
                  scrollWheelZoom={true} 
                  className="leaflet-map"
                  style={{ height: '500px' }}
                >
                  <TileLayer
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  
                  {/* NGO location marker */}
                  <Marker position={[ngoInfo.lat, ngoInfo.lng]} icon={ngoIcon}>
                    <Popup>
                      <div>
                        <h3>Your NGO Location</h3>
                        <p><strong>Name:</strong> {ngoInfo.name}</p>
                        <p><strong>Email:</strong> {ngoInfo.email}</p>
                        <p><strong>Coordinates:</strong> {ngoInfo.lat.toFixed(6)}, {ngoInfo.lng.toFixed(6)}</p>
                      </div>
                    </Popup>
                  </Marker>

                  {/* Food donation markers with enhanced popup */}
                  {availableFood.map((food, index) => {
                    // Only show markers for items with valid coordinates
                    if (!food.lat || !food.lng) {
                      return null;
                    }

                    const lat = parseFloat(food.lat);
                    const lng = parseFloat(food.lng);
                    
                    // Validate coordinates
                    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
                      console.warn(`Invalid coordinates for food item ${food.id}: ${lat}, ${lng}`);
                      return null;
                    }

                    return (
                      <Marker key={`food-${food.id}`} position={[lat, lng]} icon={foodIcon}>
                        <Popup maxWidth={300}>
                          <div style={{ minWidth: '250px' }}>
                            <h3 style={{ margin: '0 0 8px 0', color: '#2c3e50' }}>{food.food_name}</h3>
                            
                            <div style={{ marginBottom: '8px' }}>
                              <strong>🏪 Restaurant:</strong> {food.restaurant_name || 'Individual Donor'}
                            </div>
                            
                            <div style={{ marginBottom: '8px' }}>
                              <strong>👨‍🍳 Donor:</strong> {food.donor_name}
                            </div>
                            
                            <div style={{ marginBottom: '8px' }}>
                              <strong>🍽️ Quantity:</strong> {food.quantity}
                            </div>
                            
                            <div style={{ marginBottom: '8px' }}>
                              <strong>⏰ Expires:</strong> 
                              <span style={{ 
                                color: calculateTimeLeft(food.expiry_time).includes('Expired') ? '#e74c3c' : '#27ae60',
                                fontWeight: 'bold'
                              }}>
                                {calculateTimeLeft(food.expiry_time)}
                              </span>
                            </div>
                            
                            <div style={{ marginBottom: '8px' }}>
                              <strong>🥗 Type:</strong> {food.food_type}
                            </div>
                            
                            <div style={{ marginBottom: '8px', fontSize: '0.9em', color: '#666' }}>
                              <strong>📍 Address:</strong> {food.donor_address || 'N/A'}
                            </div>
                            
                            <div style={{ marginBottom: '12px', fontSize: '0.8em', color: '#888' }}>
                              <strong>Coordinates:</strong> {lat.toFixed(6)}, {lng.toFixed(6)}
                            </div>
                            
                            {food.description && (
                              <div style={{ marginBottom: '12px', fontSize: '0.9em', fontStyle: 'italic' }}>
                                "{food.description}"
                              </div>
                            )}
                            
                            <button 
                              onClick={() => handleRequestFood(food.id)} 
                              className="request-btn"
                              style={{
                                backgroundColor: '#27ae60',
                                color: 'white',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                width: '100%',
                                fontSize: '0.9em'
                              }}
                              disabled={loading}
                            >
                              {loading ? 'Requesting...' : 'Request This Food'}
                            </button>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}

                  {/* Service area markers */}
                  {slumAreas.map((area) => {
                    const lat = parseFloat(area.lat || ngoInfo.lat);
                    const lng = parseFloat(area.lng || ngoInfo.lng);
                    
                    return (
                      <Marker key={`area-${area.id}`} position={[lat, lng]} icon={ngoIcon}>
                        <Popup>
                          <div>
                            <h3>{area.name}</h3>
                            <p><strong>Population:</strong> {area.population || 'Not specified'}</p>
                            <p><strong>Description:</strong> {area.description || 'No description'}</p>
                            <p style={{ fontSize: '0.8em', color: '#666' }}>
                              <strong>Coordinates:</strong> {lat.toFixed(6)}, {lng.toFixed(6)}
                            </p>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}
                </MapContainer>
              </div>

              {/* Items without location warning */}
              {availableFood.some(food => !food.lat || !food.lng) && (
                <div style={{ 
                  marginTop: '1rem', 
                  padding: '1rem', 
                  backgroundColor: '#fff3cd', 
                  border: '1px solid #ffeaa7',
                  borderRadius: '4px' 
                }}>
                  <h4 style={{ margin: '0 0 8px 0', color: '#856404' }}>⚠️ Items Not Shown on Map</h4>
                  <p style={{ margin: '0 0 8px 0', color: '#856404' }}>
                    The following items don't have location data and aren't displayed on the map:
                  </p>
                  <ul style={{ margin: '0', color: '#856404' }}>
                    {availableFood
                      .filter(food => !food.lat || !food.lng)
                      .map(food => (
                        <li key={`missing-${food.id}`}>
                          <strong>{food.food_name}</strong> - {food.restaurant_name || 'Individual Donor'}
                          {food.donor_address && ` (${food.donor_address})`}
                        </li>
                      ))
                    }
                  </ul>
                </div>
              )}
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="requests-section">
              <h2>My Food Requests</h2>
              <div className="requests-list">
                {selectedRequests.length > 0 ? selectedRequests.map(request => (
                  <div key={request.id} className="request-card">
                    <div className="request-header">
                      <h3>{request.food_name}</h3>
                      <span className={`status-badge ${request.status.toLowerCase().replace(' ', '-')}`}>
                        {request.status}
                      </span>
                    </div>
                    <div className="request-details">
                      <p><strong>From:</strong> {request.donor_name} ({request.restaurant_name})</p>
                      <p><strong>Quantity:</strong> {request.quantity}</p>
                      <p><strong>Requested:</strong> {new Date(request.requested_at).toLocaleString()}</p>
                      {request.estimated_pickup_time && (
                        <p><strong>ETA:</strong> {new Date(request.estimated_pickup_time).toLocaleString()}</p>
                      )}
                      {request.delivered_at && (
                        <p><strong>Delivered:</strong> {new Date(request.delivered_at).toLocaleString()}</p>
                      )}
                    </div>
                    {request.status === 'Requested' && (
                      <div className="request-actions">
                        <button 
                          className="delivered-btn"
                          onClick={() => handleMarkDelivered(request.id)}
                        >
                          Mark as Delivered
                        </button>
                        <button className="cancel-btn">Cancel Request</button>
                      </div>
                    )}
                  </div>
                )) : (
                  <div className="no-requests">
                    <p>No active requests</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="history-section">
              <h2>Delivery History</h2>
              <div className="history-filters">
                <select className="filter-select">
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                  <option>Last 3 months</option>
                </select>
              </div>
              <div className="history-list">
                <div className="history-item">
                  <div className="history-details">
                    <h4>Mixed Vegetable Curry</h4>
                    <p>From: Green Restaurant • 45 portions</p>
                    <p>Delivered: Sep 14, 2025 at 3:30 PM</p>
                  </div>
                  <div className="history-status completed">Completed</div>
                </div>
                <div className="history-item">
                  <div className="history-details">
                    <h4>Fresh Bread & Butter</h4>
                    <p>From: City Bakery • 25 pieces</p>
                    <p>Delivered: Sep 13, 2025 at 6:45 PM</p>
                  </div>
                  <div className="history-status completed">Completed</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="profile-section">
              <h2>NGO Profile</h2>
              <div className="profile-form">
                <div className="form-group">
                  <label>Organization Name</label>
                  <input type="text" value={ngoInfo.name} readOnly />
                </div>
                <div className="form-group">
                  <label>Service Area</label>
                  <input type="text" value={ngoInfo.area} readOnly />
                </div>
                <div className="form-group">
                  <label>Contact Person</label>
                  <input type="text" defaultValue="Ramesh Kumar" />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input type="text" defaultValue="+91 9876543210" />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" defaultValue="contact@hopefoundation.org" />
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <textarea rows="3" defaultValue="Hope Foundation Office, East Gate Slum Area, City - 123456"></textarea>
                </div>
                <button className="update-btn">Update Profile</button>
              </div>
            </div>
          )}

          {activeTab === 'areas' && (
            <div className="profile-section">
              <h2>Manage Slum Areas</h2>
              <form className="profile-form" onSubmit={handleCreateArea}>
                <div className="form-group">
                  <label>Name</label>
                  <input type="text" value={newArea.name} onChange={(e)=>setNewArea({...newArea,name:e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Find by address</label>
                  <div style={{ display:'flex', gap:'8px'}}>
                    <input type="text" placeholder="e.g., Rainbow Nagar, Puducherry, India" onBlur={async (e)=>{
                      const q = e.target.value;
                      if (!q) return;
                      try {
                        const res = await api.get('/food/geocode', { params: { address: q } });
                        if (res.data?.lat && res.data?.lng) {
                          setNewArea(a=>({ ...a, lat: res.data.lat.toFixed(6), lng: res.data.lng.toFixed(6) }));
                          setMessage({ text: 'Address located. Adjust the pin if needed.', type: 'success' });
                        }
                      } catch(_){}
                    }} style={{ flex:1 }} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Pick on Map (click to set)</label>
                  <div style={{height:'240px', border:'1px solid #ddd'}}>
                    <MapContainer center={[ngoInfo.lat, ngoInfo.lng]} zoom={12} className="leaflet-map" style={{height:'100%'}}
                    >
                      <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <AreaPicker onPick={(latlng)=> setNewArea({...newArea, lat: latlng.lat.toFixed(6), lng: latlng.lng.toFixed(6)})} />
                      {newArea.lat && newArea.lng && (
                        <Marker position={[parseFloat(newArea.lat), parseFloat(newArea.lng)]} />
                      )}
                    </MapContainer>
                  </div>
                </div>
                <div className="form-group">
                  <label>Latitude</label>
                  <input type="number" step="0.000001" value={newArea.lat} onChange={(e)=>setNewArea({...newArea,lat:e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Longitude</label>
                  <input type="number" step="0.000001" value={newArea.lng} onChange={(e)=>setNewArea({...newArea,lng:e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Population (optional)</label>
                  <input type="number" value={newArea.population} onChange={(e)=>setNewArea({...newArea,population:e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea rows="2" value={newArea.description} onChange={(e)=>setNewArea({...newArea,description:e.target.value})}></textarea>
                </div>
                <button className="update-btn" type="submit">Add Slum Area</button>
              </form>
              <div style={{marginTop:'1rem'}}>
                <h3>Your Registered Slum Areas</h3>
                {slumAreas.length === 0 ? (
                  <p>No areas found.</p>
                ) : (
                  <ul>
                    {slumAreas.map((a)=> (
                      <li key={`${a.id}-${a.name}`}>{a.name} — pop: {a.population ?? 0} ({parseFloat(a.lat).toFixed(4)}, {parseFloat(a.lng).toFixed(4)})</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      {isModalOpen && selectedRequest && (
        <DeliveryProofModal
          foodItem={selectedRequest}
          onConfirm={handleProofSubmission}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default NGODashboard;