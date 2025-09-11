import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingRequests, setPendingRequests] = useState([
    {
      id: 1,
      type: 'donor',
      name: 'Green Restaurant',
      email: 'green@restaurant.com',
      phone: '+91 9876543210',
      address: '123 Food Street, Restaurant Area',
      documents: ['license.pdf', 'certificate.pdf'],
      submittedAt: '2024-01-15T10:30:00',
      status: 'pending'
    },
    {
      id: 2,
      type: 'ngo',
      name: 'Hope Foundation',
      email: 'contact@hopefoundation.org',
      phone: '+91 9876543211',
      address: 'East Gate Slum Area',
      serviceArea: 'East Gate',
      documents: ['registration.pdf', 'tax_exemption.pdf'],
      submittedAt: '2024-01-15T11:45:00',
      status: 'pending'
    },
    {
      id: 3,
      type: 'donor',
      name: 'City Bakery',
      email: 'contact@citybakery.com',
      phone: '+91 9876543212',
      address: '456 Bakery Lane, City Center',
      documents: ['business_license.pdf'],
      submittedAt: '2024-01-15T12:15:00',
      status: 'pending'
    }
  ]);

  const [slumAreas, setSlumAreas] = useState([
    { id: 1, name: 'East Gate', coordinates: '28.7041, 77.1025', population: 1250, activeNGOs: 2 },
    { id: 2, name: 'West Side', coordinates: '28.7141, 77.0925', population: 980, activeNGOs: 1 },
    { id: 3, name: 'North Block', coordinates: '28.7241, 77.1125', population: 1500, activeNGOs: 3 }
  ]);

  const [stats, setStats] = useState({
    totalDonors: 45,
    totalNGOs: 18,
    pendingApprovals: 3,
    totalDeliveries: 234,
    activeListings: 12,
    slumAreas: 3
  });

  const handleApprove = (id) => {
    setPendingRequests(prev =>
      prev.map(req =>
        req.id === id ? { ...req, status: 'approved', approvedAt: new Date().toLocaleString() } : req
      )
    );
    setStats(prev => ({
      ...prev,
      pendingApprovals: prev.pendingApprovals - 1
    }));
    alert('Request approved successfully!');
  };

  const handleReject = (id) => {
    setPendingRequests(prev =>
      prev.map(req =>
        req.id === id ? { ...req, status: 'rejected', rejectedAt: new Date().toLocaleString() } : req
      )
    );
    setStats(prev => ({
      ...prev,
      pendingApprovals: prev.pendingApprovals - 1
    }));
    alert('Request rejected.');
  };

  const addSlumArea = () => {
    const name = prompt('Enter slum area name:');
    const coordinates = prompt('Enter coordinates (lat, lng):');
    const population = prompt('Enter estimated population:');
    
    if (name && coordinates && population) {
      const newArea = {
        id: Date.now(),
        name,
        coordinates,
        population: parseInt(population),
        activeNGOs: 0
      };
      setSlumAreas(prev => [...prev, newArea]);
      setStats(prev => ({ ...prev, slumAreas: prev.slumAreas + 1 }));
    }
  };

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Admin Dashboard</h1>
          <div className="user-info">
            <span>Welcome, Administrator</span>
            <button className="logout-btn">Logout</button>
          </div>
        </div>
      </header>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>{stats.totalDonors}</h3>
          <p>Total Donors</p>
        </div>
        <div className="stat-card">
          <h3>{stats.totalNGOs}</h3>
          <p>Total NGOs</p>
        </div>
        <div className="stat-card pending">
          <h3>{stats.pendingApprovals}</h3>
          <p>Pending Approvals</p>
        </div>
        <div className="stat-card">
          <h3>{stats.totalDeliveries}</h3>
          <p>Total Deliveries</p>
        </div>
        <div className="stat-card">
          <h3>{stats.activeListings}</h3>
          <p>Active Listings</p>
        </div>
        <div className="stat-card">
          <h3>{stats.slumAreas}</h3>
          <p>Slum Areas</p>
        </div>
      </div>

      <div className="dashboard-content">
        <nav className="dashboard-nav">
          <button 
            className={activeTab === 'pending' ? 'active' : ''}
            onClick={() => setActiveTab('pending')}
          >
            Pending Approvals ({stats.pendingApprovals})
          </button>
          <button 
            className={activeTab === 'users' ? 'active' : ''}
            onClick={() => setActiveTab('users')}
          >
            User Management
          </button>
          <button 
            className={activeTab === 'areas' ? 'active' : ''}
            onClick={() => setActiveTab('areas')}
          >
            Slum Areas
          </button>
          <button 
            className={activeTab === 'analytics' ? 'active' : ''}
            onClick={() => setActiveTab('analytics')}
          >
            Analytics
          </button>
        </nav>

        <div className="tab-content">
          {activeTab === 'pending' && (
            <div className="pending-section">
              <h2>Pending Approvals</h2>
              <div className="requests-list">
                {pendingRequests.filter(req => req.status === 'pending').length > 0 ? 
                  pendingRequests.filter(req => req.status === 'pending').map(request => (
                    <div key={request.id} className="request-card">
                      <div className="request-header">
                        <div className="request-info">
                          <h3>{request.name}</h3>
                          <span className={`type-badge ${request.type}`}>
                            {request.type.toUpperCase()}
                          </span>
                        </div>
                        <div className="request-actions">
                          <button 
                            className="approve-btn"
                            onClick={() => handleApprove(request.id)}
                          >
                            Approve
                          </button>
                          <button 
                            className="reject-btn"
                            onClick={() => handleReject(request.id)}
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                      <div className="request-details">
                        <div className="detail-row">
                          <span><strong>Email:</strong> {request.email}</span>
                          <span><strong>Phone:</strong> {request.phone}</span>
                        </div>
                        <div className="detail-row">
                          <span><strong>Address:</strong> {request.address}</span>
                          {request.serviceArea && (
                            <span><strong>Service Area:</strong> {request.serviceArea}</span>
                          )}
                        </div>
                        <div className="detail-row">
                          <span><strong>Submitted:</strong> {new Date(request.submittedAt).toLocaleString()}</span>
                        </div>
                        <div className="documents">
                          <strong>Documents:</strong>
                          <div className="document-list">
                            {request.documents.map((doc, index) => (
                              <span key={index} className="document-tag">{doc}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="no-pending">
                      <p>No pending approvals</p>
                    </div>
                  )
                }
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="users-section">
              <h2>User Management</h2>
              <div className="user-filters">
                <select className="filter-select">
                  <option>All Users</option>
                  <option>Donors</option>
                  <option>NGOs</option>
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
                <input 
                  type="text" 
                  placeholder="Search users..." 
                  className="search-input"
                />
              </div>
              <div className="users-table">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Type</th>
                      <th>Email</th>
                      <th>Status</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Green Restaurant</td>
                      <td><span className="type-badge donor">DONOR</span></td>
                      <td>green@restaurant.com</td>
                      <td><span className="status-active">Active</span></td>
                      <td>Jan 10, 2024</td>
                      <td>
                        <button className="view-btn">View</button>
                        <button className="suspend-btn">Suspend</button>
                      </td>
                    </tr>
                    <tr>
                      <td>Hope Foundation</td>
                      <td><span className="type-badge ngo">NGO</span></td>
                      <td>contact@hopefoundation.org</td>
                      <td><span className="status-active">Active</span></td>
                      <td>Jan 12, 2024</td>
                      <td>
                        <button className="view-btn">View</button>
                        <button className="suspend-btn">Suspend</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'areas' && (
            <div className="areas-section">
              <div className="section-header">
                <h2>Slum Areas Management</h2>
                <button className="add-area-btn" onClick={addSlumArea}>
                  Add New Area
                </button>
              </div>
              <div className="areas-grid">
                {slumAreas.map(area => (
                  <div key={area.id} className="area-card">
                    <div className="area-header">
                      <h3>{area.name}</h3>
                      <button className="edit-area-btn">Edit</button>
                    </div>
                    <div className="area-details">
                      <p><strong>Coordinates:</strong> {area.coordinates}</p>
                      <p><strong>Population:</strong> {area.population.toLocaleString()}</p>
                      <p><strong>Active NGOs:</strong> {area.activeNGOs}</p>
                    </div>
                    <div className="area-actions">
                      <button className="view-map-btn">View on Map</button>
                      <button className="delete-area-btn">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="analytics-section">
              <h2>System Analytics</h2>
              <div className="analytics-grid">
                <div className="analytics-card">
                  <h3>Daily Donations</h3>
                  <div className="chart-placeholder">
                    <p>📊 Chart showing daily donation trends</p>
                  </div>
                </div>
                <div className="analytics-card">
                  <h3>Popular Areas</h3>
                  <div className="stats-list">
                    <div className="stat-item">
                      <span>East Gate</span>
                      <span>45 deliveries</span>
                    </div>
                    <div className="stat-item">
                      <span>North Block</span>
                      <span>32 deliveries</span>
                    </div>
                    <div className="stat-item">
                      <span>West Side</span>
                      <span>18 deliveries</span>
                    </div>
                  </div>
                </div>
                <div className="analytics-card">
                  <h3>Top Donors</h3>
                  <div className="stats-list">
                    <div className="stat-item">
                      <span>Green Restaurant</span>
                      <span>24 donations</span>
                    </div>
                    <div className="stat-item">
                      <span>City Bakery</span>
                      <span>18 donations</span>
                    </div>
                    <div className="stat-item">
                      <span>Spice Kitchen</span>
                      <span>15 donations</span>
                    </div>
                  </div>
                </div>
                <div className="analytics-card">
                  <h3>Monthly Growth</h3>
                  <div className="growth-stats">
                    <div className="growth-item">
                      <span>New Donors</span>
                      <span className="growth-positive">+12%</span>
                    </div>
                    <div className="growth-item">
                      <span>New NGOs</span>
                      <span className="growth-positive">+8%</span>
                    </div>
                    <div className="growth-item">
                      <span>Total Deliveries</span>
                      <span className="growth-positive">+25%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;