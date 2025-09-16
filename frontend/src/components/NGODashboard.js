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

// Custom icons for different marker types
const foodIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const slumAreaIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const restaurantIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const otherNgoIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
const currentNgoIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});


// Add this right after the icon definitions and before the NGODashboard component
const distributeMarkers = (items, baseOffset = 0.0002) => {
  const grouped = {};
  
  items.forEach((item, index) => {
    if (!item.lat || !item.lng) return;
    
    const key = `${parseFloat(item.lat).toFixed(4)}_${parseFloat(item.lng).toFixed(4)}`;
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push({...item, originalIndex: index});
  });
  
  const distributed = [];
  
  Object.values(grouped).forEach(group => {
    if (group.length === 1) {
      distributed.push(group[0]);
    } else {
      // Spread out markers in a circle around the center point
      group.forEach((item, i) => {
        const angle = (i * 2 * Math.PI) / group.length;
        const offset = baseOffset;
        const latOffset = offset * Math.cos(angle);
        const lngOffset = offset * Math.sin(angle);
        
        distributed.push({
          ...item,
          lat: parseFloat(item.lat) + latOffset,
          lng: parseFloat(item.lng) + lngOffset
        });
      });
    }
  });
  
  return distributed;
};
const NGODashboard = () => {
  const [activeTab, setActiveTab] = useState('available');
  const [availableFood, setAvailableFood] = useState([]);
  const [selectedRequests, setSelectedRequests] = useState([]);
  const [slumAreas, setSlumAreas] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [otherNgos, setOtherNgos] = useState([]);
  const [ngoInfo, setNgoInfo] = useState({
    name: '',
    email: '',
    area: '',
    peopleServed: 0,
    activeRequests: 0,
    lat: 11.9139, // Default to Puducherry center
    lng: 79.8145,
  });
  const [profileForm, setProfileForm] = useState({
    name: '',
    registrationNumber: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    area: ''
  });
const [profileLoading, setProfileLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [newArea, setNewArea] = useState({ name: '', lat: '', lng: '', population: '', description: '' });

  // Helper component to capture clicks on the small picker map reliably
  const AreaPicker = ({ onPick }) => {
    useMapEvents({
      click: (e) => {
        onPick(e.latlng);
      }
    });
    return null;
  };

  // Load restaurants
  const loadRestaurants = async () => {
    try {
      const response = await api.get('/food/restaurants');
      setRestaurants(response.data || []);
    } catch (error) {
      console.error('Error loading restaurants:', error);
    }
  };

  // Load other NGOs
  const loadOtherNgos = async () => {
    try {
      const response = await api.get('/food/ngos');
      setOtherNgos(response.data || []);
    } catch (error) {
      console.error('Error loading other NGOs:', error);
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

  // Refresh areas, restaurants, and NGOs when user navigates to Map or Areas tab
  useEffect(() => {
    if (activeTab === 'map' || activeTab === 'areas') {
      loadSlumAreas();
      loadRestaurants(); 
      loadOtherNgos();
    }
  }, [activeTab]);

const loadNgoInfo = async (email) => {
  try {
    console.log('Loading NGO profile for:', email);
    
    // Fetch complete NGO profile from backend
    const response = await api.get(`/ngo/profile/${email}`);
    console.log('Profile API response:', response);
    
    const ngoData = response.data;
    console.log('NGO data received:', ngoData);
    
const parsedLat = Number(ngoData.lat);
const parsedLng = Number(ngoData.lng);

setNgoInfo(prev => ({
  ...prev,
  email: ngoData.email,
  name: ngoData.name || (ngoData.email ? ngoData.email.split('@')[0] : prev.name),
  area: ngoData.area || 'Puducherry',
  peopleServed: ngoData.people_served ?? 0,
  activeRequests: ngoData.active_requests ?? 0,
  address: ngoData.address || '',
  phone: ngoData.phone || '',
  registrationNumber: ngoData.registration_number || '',
  // ensure numeric lat/lng
  lat: Number.isFinite(parsedLat) ? parsedLat : (prev.lat ?? 11.9139),
  lng: Number.isFinite(parsedLng) ? parsedLng : (prev.lng ?? 79.8145)
}));

    // Populate profile form
    setProfileForm({
      name: ngoData.name || '',
      registrationNumber: ngoData.registration_number || '',
      contactPerson: ngoData.name || '', // Fallback to name if no contact person
      phone: ngoData.phone || '',
      email: ngoData.email || '',
      address: ngoData.address || '',
      area: ngoData.area || 'Puducherry'
    });
    
  } catch (error) {
    console.error('Error loading NGO info:', error);
    console.error('Error response:', error.response);
    
    // Fallback to basic info
    const fallbackName = email.split('@')[0];
    setNgoInfo(prev => ({
      ...prev,
      email: email,
      name: fallbackName
    }));
    
    setProfileForm(prev => ({
      ...prev,
      email: email,
      name: fallbackName
    }));
    
    setMessage({ 
      text: 'Could not load full profile details', 
      type: 'warning' 
    });
  }
};

const handleProfileChange = (e) => {
  const { name, value } = e.target;
  setProfileForm(prev => ({
    ...prev,
    [name]: value
  }));
};
const handleUpdateProfile = async (e) => {
  e.preventDefault();
  setProfileLoading(true);
  
  try {
    const response = await api.put('/ngo/profile', {
      email: profileForm.email,
      name: profileForm.name,
      registrationNumber: profileForm.registrationNumber,
      address: profileForm.address,
      phone: profileForm.phone,
      area: profileForm.area
    });

    setMessage({ text: 'Profile updated successfully!', type: 'success' });
    
    // Refresh NGO info
    await loadNgoInfo(profileForm.email);
    
  } catch (error) {
    console.error('Profile update error:', error);
    setMessage({ 
      text: error.response?.data?.message || 'Failed to update profile', 
      type: 'error' 
    });
  } finally {
    setProfileLoading(false);
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
      setMessage({ text: 'Failed to load available food', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const loadNgoRequests = async (email) => {
    try {
      const response = await api.get(`/food/requests/ngo/${email}`);
      setSelectedRequests(response.data);
      
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
      const estimatedPickupTime = new Date(Date.now() + 30 * 60 * 1000);
      
      const response = await api.post('/food/request', {
        foodItemId: foodId,
        ngoEmail: ngoInfo.email,
        estimatedPickupTime: estimatedPickupTime.toISOString()
      });

      setMessage({ text: 'Food request submitted successfully!', type: 'success' });
      
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
      
      const response = await api.put(`/food/requests/${proofData.foodItemId}/status`, {
        status: 'Delivered',
        deliveryProofPath: proofData.photoPath
      });

      setMessage({ text: 'Proof of delivery submitted successfully!', type: 'success' });

      setSelectedRequests(prev => 
        prev.map(req => 
          req.id === proofData.foodItemId 
            ? { ...req, status: 'Delivered', delivered_at: new Date().toISOString() }
            : req
        )
      );
      
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

  // Group food items by restaurant location to create restaurant clusters
  const groupFoodByRestaurant = (foodItems, restaurants) => {
    const restaurantClusters = new Map();
    
    // First, create clusters for each restaurant
restaurants.forEach(restaurant => {
  const rLat = parseFloat(restaurant.lat);
  const rLng = parseFloat(restaurant.lng);
  if (Number.isFinite(rLat) && Number.isFinite(rLng)) {
    const key = `${rLat.toFixed(4)}_${rLng.toFixed(4)}`;
    restaurantClusters.set(key, {
      restaurant,
      foodItems: [],
      lat: rLat,
      lng: rLng
    });
  }
});
    
    // Then, assign food items to their respective restaurant clusters
    foodItems.forEach(food => {
      if (food.lat && food.lng) {
        const foodKey = `${parseFloat(food.lat).toFixed(4)}_${parseFloat(food.lng).toFixed(4)}`;
        if (restaurantClusters.has(foodKey)) {
          restaurantClusters.get(foodKey).foodItems.push(food);
        }
      }
    });
    
    return Array.from(restaurantClusters.values());
  };

  const distributedNgos = distributeMarkers(
    otherNgos.filter(n => n.lat && n.lng && n.email !== ngoInfo.email), 
    0.0003
  );
  
  const distributedRestaurants = distributeMarkers(
    restaurants.filter(r => r.lat && r.lng), 
    0.0002
  );
  return (
    <div className="ngo-dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>NGO Dashboard - Puducherry</h1>
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
              <h2>Available Food for Pickup - Puducherry</h2>
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
              <h2>Puducherry Food Distribution Heat Map</h2>
              <p>Interactive map showing registered restaurants (red), available food (green), service areas (blue), and other NGOs (orange) in Puducherry region.</p>
              
            {/* Map Legend */}
            <div className="map-legend" style={{ 
              marginBottom: '1rem', 
              padding: '1rem', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '8px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1rem',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '12px', height: '12px', backgroundColor: '#ff4444', borderRadius: '50%' }}></div>
                <span><strong>{distributedRestaurants.length}</strong> Restaurants</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '12px', height: '12px', backgroundColor: '#44ff44', borderRadius: '50%' }}></div>
                <span><strong>{availableFood.filter(f => f.lat && f.lng).length}</strong> Food Items</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '12px', height: '12px', backgroundColor: 'yellow', borderRadius: '50%' }}></div>
                <span><strong>{distributedNgos.length}</strong> Your Current NGO</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '12px', height: '12px', backgroundColor: '#ff8844', borderRadius: '50%' }}></div>
                <span><strong>{distributedNgos.length}</strong> Other NGOs</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '12px', height: '12px', backgroundColor: '#4444ff', borderRadius: '50%' }}></div>
                <span><strong>{slumAreas.length}</strong> Service/Slum Areas</span>
              </div>
              
            </div>

              <div className="map-container">
                <MapContainer 
                  center={[ngoInfo.lat, ngoInfo.lng]} 
                  zoom={12} 
                  scrollWheelZoom={true} 
                  className="leaflet-map"
                  style={{ height: '600px' }}
                >
                  <TileLayer
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  
                  {/* Current NGO location marker (blue) */}
{/* Current NGO location marker (styled much better) */}
{/* Current NGO location marker - FIXED with orange icon */}
<Marker position={[ngoInfo.lat, ngoInfo.lng]} icon={currentNgoIcon}>
  <Popup maxWidth={350}>
    <div style={{ minWidth: '300px', padding: '12px', fontFamily: 'Arial, sans-serif' }}>
      <h3 style={{ 
        margin: '0 0 12px 0', 
        color: 'dark yellow',
        fontSize: '18px',
        borderBottom: '2px solid yellow',
        paddingBottom: '8px'
      }}>
        🏢 Your NGO Headquarters
      </h3>
      
      <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
        <span style={{ 
          fontWeight: 'bold', 
          minWidth: '100px',
          color: '#2c3e50'
        }}>Organization:</span>
        <span style={{ color: '#34495e' }}>{ngoInfo.name}</span>
      </div>
      
      <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
        <span style={{ 
          fontWeight: 'bold', 
          minWidth: '100px',
          color: '#2c3e50'
        }}>Email:</span>
        <span style={{ color: '#34495e', fontSize: '0.9em' }}>{ngoInfo.email}</span>
      </div>
      
      {ngoInfo.area && (
        <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
          <span style={{ 
            fontWeight: 'bold', 
            minWidth: '100px',
            color: '#2c3e50'
          }}>Service Area:</span>
          <span style={{ color: '#34495e' }}>{ngoInfo.area}</span>
        </div>
      )}
      
      <div style={{ 
        marginBottom: '12px', 
        padding: '8px', 
        backgroundColor: '#fef9e7', // Light orange background
        borderRadius: '6px',
        borderLeft: '4px solid #e67e22'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ fontWeight: 'bold', color: '#2c3e50' }}>People Served:</span>
          <span style={{ color: '#27ae60', fontWeight: 'bold' }}>{ngoInfo.peopleServed}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 'bold', color: '#2c3e50' }}>Active Requests:</span>
          <span style={{ color: '#e67e22', fontWeight: 'bold' }}>{ngoInfo.activeRequests}</span>
        </div>
      </div>
      
      <div style={{ 
        marginTop: '12px', 
        padding: '8px', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '4px',
        fontSize: '0.8em',
        color: '#7f8c8d'
      }}>
        <div style={{ marginBottom: '4px' }}>
          <strong>Coordinates:</strong> {Number(ngoInfo.lat).toFixed(6)}, {Number(ngoInfo.lng).toFixed(6)}
        </div>
        <div>
          <strong>Status:</strong> 
          <span style={{ 
            color: '#27ae60', 
            fontWeight: 'bold',
            marginLeft: '4px'
          }}>● Active</span>
        </div>
      </div>
      
      <button 
        style={{
          marginTop: '12px',
          width: '100%',
          padding: '8px 16px',
          backgroundColor: '#e67e22',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: '0.9em'
        }}
        onClick={() => setActiveTab('profile')}
      >
        📋 Edit NGO Profile
      </button>
    </div>
  </Popup>
</Marker>

                  {/* Restaurant markers with clustered food items (red) */}
                  {/* Restaurant markers (red) - with better distribution */}
{distributedRestaurants.map((restaurant) => {
  const lat = parseFloat(restaurant.lat);
  const lng = parseFloat(restaurant.lng);
  
  // Find food items from this restaurant
  const restaurantFood = availableFood.filter(food => 
    food.donor_id === restaurant.id || 
    food.restaurant_name === restaurant.restaurant_name
  );
  
  return (
    <Marker key={`restaurant-${restaurant.id}`} position={[lat, lng]} icon={restaurantIcon}>
      <Popup maxWidth={350}>
        <div style={{ minWidth: '300px' }}>
          <h3 style={{ margin: '0 0 12px 0', color: '#c0392b' }}>
            🍽️ {restaurant.restaurant_name || restaurant.name}
          </h3>
          
          <div style={{ marginBottom: '12px' }}>
            <strong>👨‍🍳 Owner:</strong> {restaurant.name}
          </div>
          
          <div style={{ marginBottom: '12px' }}>
            <strong>📍 Address:</strong> {restaurant.address || 'N/A'}
          </div>
          
          {restaurant.phone && (
            <div style={{ marginBottom: '12px' }}>
              <strong>📞 Phone:</strong> {restaurant.phone}
            </div>
          )}
          
          {restaurant.opening_hours && (
            <div style={{ marginBottom: '12px' }}>
              <strong>🕒 Hours:</strong> {restaurant.opening_hours}
            </div>
          )}
          
          <div style={{ marginBottom: '12px', fontSize: '0.8em', color: '#666' }}>
            <strong>Coordinates:</strong> {lat.toFixed(6)}, {lng.toFixed(6)}
          </div>
          
          {/* Show available food items from this restaurant */}
          {restaurantFood.length > 0 && (
            <div style={{ marginTop: '16px', borderTop: '1px solid #eee', paddingTop: '12px' }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#27ae60' }}>
                🍛 Available Food ({restaurantFood.length} items):
              </h4>
              {restaurantFood.slice(0, 3).map((food) => (
                <div key={food.id} style={{ 
                  marginBottom: '8px', 
                  padding: '8px', 
                  backgroundColor: '#f9f9f9', 
                  borderRadius: '4px' 
                }}>
                  <strong>{food.food_name}</strong> - {food.quantity}
                  <br />
                  <small style={{ color: '#e74c3c' }}>
                    Expires: {calculateTimeLeft(food.expiry_time)}
                  </small>
                  <br />
                  <button 
                    onClick={() => handleRequestFood(food.id)} 
                    style={{
                      backgroundColor: '#27ae60',
                      color: 'white',
                      border: 'none',
                      padding: '4px 8px',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      fontSize: '0.8em',
                      marginTop: '4px'
                    }}
                  >
                    Request
                  </button>
                </div>
              ))}
              {restaurantFood.length > 3 && (
                <div style={{ fontSize: '0.9em', color: '#666', fontStyle: 'italic' }}>
                  + {restaurantFood.length - 3} more items available...
                </div>
              )}
            </div>
          )}
          
          {restaurantFood.length === 0 && (
            <div style={{ marginTop: '16px', padding: '8px', backgroundColor: '#fff3cd', borderRadius: '4px' }}>
              <small style={{ color: '#856404' }}>No food currently available from this restaurant</small>
            </div>
          )}
        </div>
      </Popup>
    </Marker>
  );
})}

                  {/* Individual food markers for items without restaurant match (green, with slight offset) */}
                  {availableFood.map((food, index) => {
                    if (!food.lat || !food.lng) return null;

                    const lat = parseFloat(food.lat);
                    const lng = parseFloat(food.lng);
                    
                    if (isNaN(lat) || isNaN(lng)) return null;

                    // Check if this food item is already handled by a restaurant cluster
                    const restaurantClusters = groupFoodByRestaurant(availableFood, restaurants);
                    const isInCluster = restaurantClusters.some(cluster => 
                      cluster.foodItems.some(item => item.id === food.id)
                    );

                    if (isInCluster) return null; // Skip if already shown in restaurant cluster

                    // Add small offset to avoid exact overlap
                    const offsetLat = lat + (index * 0.0002);
                    const offsetLng = lng + ((index % 2) * 0.0002);

                    return (
                      <Marker key={`food-${food.id}`} position={[offsetLat, offsetLng]} icon={foodIcon}>
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

                  {/* Service area markers (blue) */}
                  {slumAreas.map((area) => {
                    const lat = parseFloat(area.lat || ngoInfo.lat);
                    const lng = parseFloat(area.lng || ngoInfo.lng);
                    
                    return (
                      <Marker key={`area-${area.id}`} position={[lat, lng]} icon={slumAreaIcon}>
                        <Popup>
                          <div>
                            <h3>🏘️ {area.name}</h3>
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

                  {/* Other NGO markers (orange) */}
                  {/* Other NGO markers (orange) - with better distribution */}
                  {distributedNgos.map((ngo) => {
                    const lat = parseFloat(ngo.lat);
                    const lng = parseFloat(ngo.lng);
                    
                    return (
                      <Marker key={`other-ngo-${ngo.id}`} position={[lat, lng]} icon={otherNgoIcon}>
                        <Popup>
                          <div style={{ padding: '8px' }}>
                            <h3 style={{ margin: '0 0 8px 0', color: '#e67e22' }}>🤝 {ngo.name || 'NGO'}</h3>
                            <p><strong>Registration:</strong> {ngo.registration_number || 'N/A'}</p>
                            <p><strong>Address:</strong> {ngo.address || 'N/A'}</p>
                            <p><strong>Phone:</strong> {ngo.phone || 'N/A'}</p>
                            <p><strong>Email:</strong> {ngo.email || 'N/A'}</p>
                            <p style={{ fontSize: '0.8em', color: '#666', marginTop: '8px' }}>
                              <strong>Coordinates:</strong> {lat.toFixed(6)}, {lng.toFixed(6)}
                            </p>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}
                </MapContainer>
              </div>

              {/* Missing data warnings */}
              {(availableFood.some(food => !food.lat || !food.lng) || 
                restaurants.some(r => !r.lat || !r.lng) || 
                otherNgos.some(n => !n.lat || !n.lng)) && (
                <div style={{ 
                  marginTop: '1rem', 
                  padding: '1rem', 
                  backgroundColor: '#fff3cd', 
                  border: '1px solid #ffeaa7',
                  borderRadius: '4px' 
                }}>
                  <h4 style={{ margin: '0 0 8px 0', color: '#856404' }}>⚠️ Items Not Shown on Map</h4>
                  <p style={{ margin: '0 0 8px 0', color: '#856404' }}>
                    Some items don't have location data and aren't displayed:
                  </p>
                  <ul style={{ margin: '0', color: '#856404' }}>
                    {availableFood
                      .filter(food => !food.lat || !food.lng)
                      .map(food => (
                        <li key={`missing-food-${food.id}`}>
                          <strong>{food.food_name}</strong> - {food.restaurant_name || 'Individual Donor'}
                        </li>
                      ))
                    }
                    {restaurants
                      .filter(r => !r.lat || !r.lng)
                      .map(r => (
                        <li key={`missing-restaurant-${r.id}`}>
                          Restaurant: <strong>{r.restaurant_name}</strong>
                        </li>
                      ))
                    }
                    {otherNgos
                      .filter(n => !n.lat || !n.lng)
                      .map(n => (
                        <li key={`missing-ngo-${n.id}`}>
                          NGO: <strong>{n.name}</strong>
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
    <form className="profile-form" onSubmit={handleUpdateProfile}>
      <div className="form-group">
        <label>Organization Name</label>
        <input 
          type="text" 
          name="name"
          value={profileForm.name} 
          onChange={handleProfileChange}
          required
        />
      </div>
      <div className="form-group">
        <label>Registration Number</label>
        <input 
          type="text" 
          name="registrationNumber"
          value={profileForm.registrationNumber} 
          onChange={handleProfileChange}
        />
      </div>

      <div className="form-group">
        <label>Phone</label>
        <input 
          type="text" 
          name="phone"
          value={profileForm.phone} 
          onChange={handleProfileChange}
          required
        />
      </div>
      <div className="form-group">
        <label>Email</label>
        <input 
          type="email" 
          name="email"
          value={profileForm.email} 
          onChange={handleProfileChange}
          readOnly
          className="readonly-input"
        />
      </div>
      <div className="form-group">
        <label>Address</label>
        <textarea 
          rows="3" 
          name="address"
          value={profileForm.address} 
          onChange={handleProfileChange}
          required
        ></textarea>
      </div>

      <button type="submit" className="update-btn" disabled={profileLoading}>
        {profileLoading ? 'Updating...' : 'Update Profile'}
      </button>
    </form>
  </div>
)}

          {activeTab === 'areas' && (
            <div className="profile-section">
              <h2>Manage Slum Areas - Puducherry</h2>
              <form className="profile-form" onSubmit={handleCreateArea}>
                <div className="form-group">
                  <label>Area Name</label>
                  <input type="text" value={newArea.name} onChange={(e)=>setNewArea({...newArea,name:e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Find by address (Puducherry)</label>
                  <div style={{ display:'flex', gap:'8px'}}>
                    <input type="text" placeholder="e.g., Rainbow Nagar, Puducherry" onBlur={async (e)=>{
                      const q = e.target.value;
                      if (!q) return;
                      try {
                        const res = await api.get('/food/geocode', { params: { address: q } });
                        if (res.data?.lat && res.data?.lng) {
                          setNewArea(a=>({ ...a, lat: res.data.lat.toFixed(6), lng: res.data.lng.toFixed(6) }));
                          setMessage({ text: 'Address located in Puducherry. Adjust the pin if needed.', type: 'success' });
                        }
                      } catch(_){}
                    }} style={{ flex:1 }} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Pick on Map (click to set location)</label>
                  <div style={{height:'300px', border:'1px solid #ddd'}}>
                    <MapContainer  center={[ Number(ngoInfo.lat) || 11.9139, Number(ngoInfo.lng) || 79.8145 ]} zoom={13} className="leaflet-map" style={{height:'100%'}}
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