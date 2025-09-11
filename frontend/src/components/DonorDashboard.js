import React, { useState, useEffect } from 'react';
import './DonorDashboard.css';
import { FaUpload, FaHistory, FaUserCircle, FaChartLine, FaCheckCircle, FaClock, FaTimesCircle, FaMapMarkerAlt, FaCalendarAlt, FaEuroSign } from 'react-icons/fa';
import { api } from '../utils/api';

const DonorDashboard = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [foodItems, setFoodItems] = useState([]);
  const [uploadForm, setUploadForm] = useState({
    foodName: '',
    quantity: '',
    expiryTime: '',
    description: '',
    photo: null,
    photoPreview: null
  });

  const [donorInfo, setDonorInfo] = useState({
    name: '',
    email: '',
    address: '',
    phone: '',
    totalDonations: 0,
    peopleHelped: 0,
    activeListings: 0,
    completedToday: 0
  });

  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUploadForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadForm(prev => ({
        ...prev,
        photo: file,
        photoPreview: URL.createObjectURL(file)
      }));
    }
  };

  // Load donor info and food items on component mount
  useEffect(() => {
    const donorEmail = localStorage.getItem('donorEmail');
    if (donorEmail) {
      loadDonorInfo(donorEmail);
      loadFoodItems(donorEmail);
    }
  }, []);

const loadDonorInfo = async (email) => {
  try {
    console.log('Loading donor info for:', email);
    
    // CORRECT: Remove /api prefix since baseURL already includes it
    const response = await api.get(`/donors/profile/${email}`);
    console.log('API response:', response);
    
    const donorData = response.data;
    console.log('Donor data received:', donorData);
    
    setDonorInfo(prev => ({
      ...prev,
      email: donorData.email,
      name: donorData.restaurant_name || donorData.name || email.split('@')[0],
      address: donorData.address || '',
      phone: donorData.phone || '',
      totalDonations: donorData.total_donations || 0,
      peopleHelped: donorData.people_helped || 0,
      activeListings: donorData.active_listings || 0,
      completedToday: donorData.completed_today || 0
    }));

    // Update profile form with current data
    setProfileForm({
      name: donorData.restaurant_name || donorData.name || '',
      phone: donorData.phone || '',
      address: donorData.address || ''
    });
    
  } catch (error) {
    console.error('Error loading donor info:', error);
    // Fallback to basic info if API fails
    setDonorInfo(prev => ({
      ...prev,
      email: email,
      name: email.split('@')[0]
    }));
  }
};

  const loadFoodItems = async (email) => {
    try {
      setLoading(true);
      const response = await api.get(`/food/donor/${email}`);
      setFoodItems(response.data);
      
      // Calculate stats
      const totalDonations = response.data.length;
      const activeListings = response.data.filter(item => item.status === 'Available').length;
      const completedToday = response.data.filter(item => {
        const today = new Date().toDateString();
        const itemDate = new Date(item.created_at).toDateString();
        return itemDate === today && item.status === 'Delivered';
      }).length;

      setDonorInfo(prev => ({
        ...prev,
        totalDonations,
        activeListings,
        completedToday
      }));
    } catch (error) {
      console.error('Error loading food items:', error);
      setMessage({ text: 'Failed to load food items', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!donorInfo.email) {
      setMessage({ text: 'Please login first', type: 'error' });
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('email', donorInfo.email);
      formData.append('foodName', uploadForm.foodName);
      formData.append('quantity', uploadForm.quantity);
      formData.append('expiryTime', uploadForm.expiryTime);
      formData.append('description', uploadForm.description);
      formData.append('foodType', 'veg'); // Default to veg
      if (uploadForm.photo) {
        formData.append('photo', uploadForm.photo);
      }

      console.log('Uploading food item...');
      const response = await api.post('/food/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Food upload response:', response.data);
      setMessage({ text: 'Food item uploaded successfully!', type: 'success' });
      
      // Reset form
      setUploadForm({
        foodName: '',
        quantity: '',
        expiryTime: '',
        description: '',
        photo: null,
        photoPreview: null
      });

      // Reload food items
      loadFoodItems(donorInfo.email);
    } catch (error) {
      console.error('Upload error:', error);
      setMessage({ 
        text: error.response?.data?.message || 'Failed to upload food item', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Available':
        return <span className="status available"><FaCheckCircle /> Available</span>;
      case 'Requested':
        return <span className="status requested"><FaClock /> Requested</span>;
      case 'Picked Up':
        return <span className="status picked-up"><FaCheckCircle /> Picked Up</span>;
      case 'Delivered':
        return <span className="status delivered"><FaCheckCircle /> Delivered</span>;
      case 'Expired':
        return <span className="status expired"><FaTimesCircle /> Expired</span>;
      default:
        return <span className="status unknown"><FaClock /> {status}</span>;
    }
  };

const handleProfileUpdate = async (e) => {
  e.preventDefault();
  try {
    setLoading(true);
    const donorEmail = localStorage.getItem('donorEmail');
    
    // CORRECT: Remove /api prefix
    const response = await api.put('/donors/update-basic-profile', {
      email: donorEmail,
      name: profileForm.name,
      phone: profileForm.phone,
      address: profileForm.address
    });

    setMessage({ text: 'Profile updated successfully!', type: 'success' });
    
    // Reload donor info to get updated data
    loadDonorInfo(donorEmail);
    
  } catch (error) {
    console.error('Profile update error:', error);
    setMessage({ 
      text: error.response?.data?.message || 'Failed to update profile', 
      type: 'error' 
    });
  } finally {
    setLoading(false);
  }
};
  const handleLogout = () => {
    localStorage.removeItem('donorEmail');
    localStorage.removeItem('donorToken');
    window.location.href = '/';
  };

  return (
    <div className="donor-dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">Donor Dashboard</h1>
          <div className="user-info">
            <span>Welcome, {donorInfo.name}</span>
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
          <FaUpload className="stat-icon" />
          <h3>{donorInfo.activeListings}</h3>
          <p>Active Listings</p>
        </div>
        <div className="stat-card">
          <FaCheckCircle className="stat-icon" />
          <h3>{donorInfo.completedToday}</h3>
          <p>Completed Today</p>
        </div>
        <div className="stat-card">
          <FaHistory className="stat-icon" />
          <h3>{donorInfo.totalDonations}</h3>
          <p>Total Donations</p>
        </div>
        <div className="stat-card">
          <FaUserCircle className="stat-icon" />
          <h3>{donorInfo.peopleHelped}</h3>
          <p>People Helped</p>
        </div>
      </div>

      <div className="dashboard-content">
        <nav className="dashboard-nav">
          <button 
            className={activeTab === 'upload' ? 'active' : ''}
            onClick={() => setActiveTab('upload')}
          >
            <FaUpload /> Upload Food
          </button>
          <button 
            className={activeTab === 'history' ? 'active' : ''}
            onClick={() => setActiveTab('history')}
          >
            <FaHistory /> Donation History
          </button>
          <button 
            className={activeTab === 'analytics' ? 'active' : ''}
            onClick={() => setActiveTab('analytics')}
          >
            <FaChartLine /> Analytics
          </button>
          <button 
            className={activeTab === 'profile' ? 'active' : ''}
            onClick={() => setActiveTab('profile')}
          >
            <FaUserCircle /> Profile
          </button>
        </nav>

        <div className="tab-content">
          {activeTab === 'upload' && (
            <div className="upload-section">
              <h2>Upload Food for Donation</h2>
              <p className="section-description">Fill out the details to list your surplus food item for NGOs to claim.</p>
              <form onSubmit={handleSubmit} className="upload-form">
                <div className="form-group">
                  <label>Food Name</label>
                  <input
                    type="text"
                    name="foodName"
                    value={uploadForm.foodName}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Vegetable Curry, Bread Loaves"
                  />
                </div>
                <div className="form-group">
                  <label>Quantity / Portions</label>
                  <input
                    type="text"
                    name="quantity"
                    value={uploadForm.quantity}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., 50 portions, 10 kg"
                  />
                </div>
                <div className="form-group">
                  <label>Expiry Time</label>
                  <input
                    type="datetime-local"
                    name="expiryTime"
                    value={uploadForm.expiryTime}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group file-upload-group">
                  <label>Food Photo</label>
                  <div className="photo-input-container">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      required
                      id="food-photo-upload"
                      className="hidden-file-input"
                    />
                    <label htmlFor="food-photo-upload" className="custom-file-upload">
                      <FaUpload /> Choose Photo
                    </label>
                    {uploadForm.photo && <span className="file-name">{uploadForm.photo.name}</span>}
                  </div>
                  {uploadForm.photoPreview && (
                    <div className="photo-preview">
                      <img src={uploadForm.photoPreview} alt="Food Preview" />
                    </div>
                  )}
                </div>
                <div className="form-group full-width">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={uploadForm.description}
                    onChange={handleInputChange}
                    placeholder="Provide additional details about the food, allergens, etc."
                    rows="3"
                  ></textarea>
                </div>

                <button type="submit" className="submit-btn" disabled={loading}>
                  <FaUpload /> {loading ? 'Uploading...' : 'Upload Food Item'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="history-section">
              <h2>Donation History</h2>
              <p className="section-description">A record of all your past and pending food donations.</p>
              <div className="food-items-grid">
                {loading ? (
                  <div className="loading">
                    <p>Loading food items...</p>
                  </div>
                ) : foodItems.length > 0 ? foodItems.map(item => (
                  <div key={item.id} className="food-item-card">
                    {item.photo_path && <img src={`http://localhost:5000${item.photo_path}`} alt={item.food_name} className="food-item-photo" />}
                    <div className="item-details">
                      <div className="item-header">
                        <h3>{item.food_name}</h3>
                        {renderStatusBadge(item.status)}
                      </div>
                      <p><FaEuroSign /> <strong>Quantity:</strong> {item.quantity}</p>
                      <p><FaCalendarAlt /> <strong>Uploaded:</strong> {new Date(item.created_at).toLocaleString()}</p>
                      <p><FaClock /> <strong>Expires:</strong> {new Date(item.expiry_time).toLocaleString()}</p>
                      {item.description && <p className="item-description">{item.description}</p>}
                    </div>
                  </div>
                )) : (
                  <div className="no-items">
                    <FaTimesCircle className="no-items-icon" />
                    <p>No donation history available. Start by uploading your first item!</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="analytics-section">
              <h2>Donation Analytics</h2>
              <p className="section-description">Track the impact of your donations over time.</p>
              <div className="analytics-grid">
                <div className="analytics-card">
                  <h3>Donations by Month</h3>
                  <div className="chart-placeholder">
                    {/* Placeholder for a chart library like Chart.js or D3.js */}
                    <p>Chart coming soon...</p>
                  </div>
                </div>
                <div className="analytics-card">
                  <h3>Food Types Donated</h3>
                  <div className="chart-placeholder">
                    {/* Placeholder for a chart showing food distribution */}
                    <p>Chart coming soon...</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="profile-section">
              <h2>Profile Information</h2>
              <p className="section-description">Manage your account and contact details.</p>
              
              {message.text && (
                <div className={`message ${message.type}`}>
                  {message.text}
                </div>
              )}
              
              <form className="profile-form" onSubmit={handleProfileUpdate}>
                <div className="form-group">
                  <label>Restaurant Name</label>
                  <input 
                    type="text" 
                    name="name"
                    value={profileForm.name}
                    onChange={handleProfileInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={donorInfo.email} readOnly />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input 
                    type="text" 
                    name="phone"
                    value={profileForm.phone}
                    onChange={handleProfileInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <textarea 
                    rows="3" 
                    name="address"
                    value={profileForm.address}
                    onChange={handleProfileInputChange}
                    placeholder="Enter your restaurant address for accurate food location mapping"
                  />
                </div>
                <button type="submit" className="update-btn" disabled={loading}>
                  <FaCheckCircle /> {loading ? 'Updating...' : 'Update Profile'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DonorDashboard;