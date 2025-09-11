import React, { useState, useEffect } from 'react';
import './FoodTracking.css';

const FoodTracking = () => {
  const [trackingId, setTrackingId] = useState('');
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);

  const sampleTrackingData = {
    'FD001': {
      id: 'FD001',
      foodName: 'Vegetable Curry & Rice',
      donor: 'Green Restaurant',
      ngo: 'Hope Foundation',
      quantity: '50 portions',
      status: 'In Transit',
      estimatedDelivery: '2024-01-15T18:30:00',
      pickupTime: '2024-01-15T17:45:00',
      timeline: [
        { status: 'Food Listed', time: '2024-01-15T16:30:00', completed: true, description: 'Food item uploaded by donor' },
        { status: 'Request Accepted', time: '2024-01-15T17:15:00', completed: true, description: 'NGO accepted the food request' },
        { status: 'Pickup Confirmed', time: '2024-01-15T17:45:00', completed: true, description: 'Food picked up from restaurant' },
        { status: 'In Transit', time: '2024-01-15T18:00:00', completed: true, description: 'Food is on the way to destination', current: true },
        { status: 'Delivered', time: '2024-01-15T18:30:00', completed: false, description: 'Food delivered to community' }
      ],
      location: {
        current: 'MG Road Junction',
        destination: 'East Gate Slum Area'
      },
      driver: {
        name: 'Rajesh Kumar',
        phone: '+91 9876543210',
        vehicle: 'KA 01 AB 1234'
      }
    },
    'FD002': {
      id: 'FD002',
      foodName: 'Fresh Bread & Sandwiches',
      donor: 'City Bakery',
      ngo: 'Care Foundation',
      quantity: '30 pieces',
      status: 'Delivered',
      deliveredTime: '2024-01-15T14:20:00',
      timeline: [
        { status: 'Food Listed', time: '2024-01-15T12:30:00', completed: true, description: 'Food item uploaded by donor' },
        { status: 'Request Accepted', time: '2024-01-15T13:00:00', completed: true, description: 'NGO accepted the food request' },
        { status: 'Pickup Confirmed', time: '2024-01-15T13:30:00', completed: true, description: 'Food picked up from bakery' },
        { status: 'In Transit', time: '2024-01-15T13:45:00', completed: true, description: 'Food is on the way to destination' },
        { status: 'Delivered', time: '2024-01-15T14:20:00', completed: true, description: 'Food delivered to community', current: true }
      ],
      location: {
        destination: 'West Side Community Center'
      },
      beneficiaries: 45
    }
  };

  const handleTrack = (e) => {
    e.preventDefault();
    if (!trackingId.trim()) {
      alert('Please enter a tracking ID');
      return;
    }

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const data = sampleTrackingData[trackingId.toUpperCase()];
      if (data) {
        setTrackingData(data);
      } else {
        setTrackingData(null);
        alert('Tracking ID not found. Try FD001 or FD002');
      }
      setLoading(false);
    }, 1000);
  };

  const formatTime = (timeString) => {
    return new Date(timeString).toLocaleString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Food Listed': return '#667eea';
      case 'Request Accepted': return '#48bb78';
      case 'Pickup Confirmed': return '#ed8936';
      case 'In Transit': return '#9f7aea';
      case 'Delivered': return '#38a169';
      default: return '#718096';
    }
  };

  return (
    <div className="food-tracking">
      <div className="tracking-container">
        <div className="tracking-header">
          <h1>Track Your Food Donation</h1>
          <p>Enter your tracking ID to see real-time status of your food donation</p>
        </div>

        <div className="tracking-search">
          <form onSubmit={handleTrack} className="search-form">
            <div className="search-input-group">
              <input
                type="text"
                placeholder="Enter Tracking ID (e.g., FD001)"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                className="tracking-input"
              />
              <button type="submit" disabled={loading} className="track-btn">
                {loading ? 'Tracking...' : 'Track Food'}
              </button>
            </div>
          </form>
          <div className="sample-ids">
            <p>Sample IDs: 
              <button onClick={() => setTrackingId('FD001')} className="sample-id">FD001</button>
              <button onClick={() => setTrackingId('FD002')} className="sample-id">FD002</button>
            </p>
          </div>
        </div>

        {loading && (
          <div className="loading">
            <div className="loading-spinner"></div>
            <p>Fetching tracking information...</p>
          </div>
        )}

        {trackingData && (
          <div className="tracking-results">
            <div className="tracking-overview">
              <div className="overview-header">
                <h2>{trackingData.foodName}</h2>
                <div className={`status-badge ${trackingData.status.toLowerCase().replace(' ', '-')}`}>
                  {trackingData.status}
                </div>
              </div>
              <div className="overview-details">
                <div className="detail-item">
                  <strong>From:</strong> {trackingData.donor}
                </div>
                <div className="detail-item">
                  <strong>To:</strong> {trackingData.ngo}
                </div>
                <div className="detail-item">
                  <strong>Quantity:</strong> {trackingData.quantity}
                </div>
                {trackingData.estimatedDelivery && (
                  <div className="detail-item">
                    <strong>Estimated Delivery:</strong> {formatTime(trackingData.estimatedDelivery)}
                  </div>
                )}
                {trackingData.deliveredTime && (
                  <div className="detail-item">
                    <strong>Delivered At:</strong> {formatTime(trackingData.deliveredTime)}
                  </div>
                )}
                {trackingData.beneficiaries && (
                  <div className="detail-item">
                    <strong>People Helped:</strong> {trackingData.beneficiaries}
                  </div>
                )}
              </div>
            </div>

            <div className="tracking-timeline">
              <h3>Delivery Timeline</h3>
              <div className="timeline">
                {trackingData.timeline.map((step, index) => (
                  <div key={index} className={`timeline-item ${step.completed ? 'completed' : 'pending'} ${step.current ? 'current' : ''}`}>
                    <div className="timeline-marker" style={{ backgroundColor: step.completed ? getStatusColor(step.status) : '#e2e8f0' }}>
                      {step.completed && <span className="check-mark">✓</span>}
                      {step.current && <div className="pulse-ring"></div>}
                    </div>
                    <div className="timeline-content">
                      <div className="timeline-header">
                        <h4>{step.status}</h4>
                        {step.completed && <span className="timeline-time">{formatTime(step.time)}</span>}
                      </div>
                      <p>{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {trackingData.status === 'In Transit' && trackingData.driver && (
              <div className="driver-info">
                <h3>Driver Information</h3>
                <div className="driver-card">
                  <div className="driver-avatar">👨‍🚛</div>
                  <div className="driver-details">
                    <h4>{trackingData.driver.name}</h4>
                    <p>Vehicle: {trackingData.driver.vehicle}</p>
                    <p>Phone: {trackingData.driver.phone}</p>
                  </div>
                  <div className="driver-actions">
                    <button className="contact-btn">Contact Driver</button>
                  </div>
                </div>
                <div className="location-info">
                  <div className="location-item">
                    <strong>Current Location:</strong> {trackingData.location.current}
                  </div>
                  <div className="location-item">
                    <strong>Destination:</strong> {trackingData.location.destination}
                  </div>
                </div>
              </div>
            )}

            <div className="tracking-map">
              <h3>Live Location</h3>
              <div className="map-placeholder">
                <div className="map-content">
                  <div className="map-pin">📍</div>
                  <p>Interactive map showing live location</p>
                  <p className="map-note">
                    {trackingData.status === 'Delivered' ? 
                      `Food delivered to ${trackingData.location.destination}` :
                      trackingData.location.current ? 
                        `Currently at: ${trackingData.location.current}` :
                        'Tracking location...'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodTracking;