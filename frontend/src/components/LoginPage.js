import React, { useState } from 'react';
import './LoginPage.css';
import { api } from '../utils/api';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    userType: 'donor'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    console.log('Attempting login for:', loginData.userType, 'with email:', loginData.email);

    try {
      if (loginData.userType === 'admin') {
        // Admin login
        console.log('Calling admin login API...');
        const response = await api.post('/admin/login', {
          username: loginData.email,
          password: loginData.password
        });
        
        if (response.data.message === 'Login successful.') {
          localStorage.setItem('isAuthenticated', 'true');
          setMessage({ text: 'Login successful!', type: 'success' });
          setTimeout(() => {
            navigate('/admin');
          }, 1000);
        }
      } else if (loginData.userType === 'ngo') {
        // NGO login
        console.log('Calling NGO login API...');
        const response = await api.post('/ngo/login', {
          email: loginData.email,
          password: loginData.password
        });
        
        if (response.data.token) {
          localStorage.setItem('ngoToken', response.data.token);
          localStorage.setItem('ngoEmail', loginData.email);
          setMessage({ text: 'Login successful!', type: 'success' });
          setTimeout(() => {
            navigate('/ngo-dashboard');
          }, 1000);
        }
      } else if (loginData.userType === 'donor') {
        // Donor login
        console.log('Calling donor login API...');
        const response = await api.post('/donors/login', {
          email: loginData.email,
          password: loginData.password
        });
        
        if (response.data.token) {
          localStorage.setItem('donorToken', response.data.token);
          localStorage.setItem('donorEmail', loginData.email);
          setMessage({ text: 'Login successful!', type: 'success' });
          setTimeout(() => {
            navigate('/donor-dashboard');
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      setMessage({ 
        text: error.response?.data?.message || `Login failed. ${error.message}`, 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    if (!loginData.email) {
      alert('Please enter your email address first');
      return;
    }
    alert(`Password reset link sent to ${loginData.email}`);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-left">
          <div className="brand-section">
            <div className="logo">
              <div className="logo-icon">🍽️</div>
              <h1>FoodBridge</h1>
            </div>
            <p className="tagline">Connecting surplus food with those in need</p>
          </div>
          <div className="features">
            <div className="feature">
              <div className="feature-icon">🤝</div>
              <div>
                <h3>Connect Communities</h3>
                <p>Bridge the gap between food donors and marginalized communities</p>
              </div>
            </div>
            <div className="feature">
              <div className="feature-icon">⚡</div>
              <div>
                <h3>Real-time Distribution</h3>
                <p>Instant notifications and efficient food distribution system</p>
              </div>
            </div>
            <div className="feature">
              <div className="feature-icon">📍</div>
              <div>
                <h3>Location-based Matching</h3>
                <p>Smart allocation based on proximity and urgency</p>
              </div>
            </div>
          </div>
        </div>

        <div className="login-right">
          <div className="login-form-container">
            <div className="login-header">
              <h2>Welcome Back</h2>
              <p>Sign in to continue making a difference</p>
            </div>

            {message.text && (
              <div className={`message ${message.type}`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form">
              <div className="user-type-selector">
                <label className="user-type-label">I am a:</label>
                <div className="radio-group">
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="userType"
                      value="donor"
                      checked={loginData.userType === 'donor'}
                      onChange={handleInputChange}
                    />
                    <span className="radio-custom"></span>
                    <span className="radio-text">Donor (Restaurant/Catering)</span>
                  </label>
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="userType"
                      value="ngo"
                      checked={loginData.userType === 'ngo'}
                      onChange={handleInputChange}
                    />
                    <span className="radio-custom"></span>
                    <span className="radio-text">NGO Partner</span>
                  </label>
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="userType"
                      value="admin"
                      checked={loginData.userType === 'admin'}
                      onChange={handleInputChange}
                    />
                    <span className="radio-custom"></span>
                    <span className="radio-text">Administrator</span>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={loginData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="password-input">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={loginData.password}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              <div className="form-options">
                <label className="remember-me">
                  <input type="checkbox" />
                  <span className="checkbox-custom"></span>
                  Remember me
                </label>
                <button 
                  type="button" 
                  className="forgot-password"
                  onClick={handleForgotPassword}
                >
                  Forgot Password?
                </button>
              </div>

              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            <div className="signup-prompt">
              <p>Don't have an account? 
                <button 
                  type="button" 
                  className="signup-link"
                  onClick={() => {
                    if (loginData.userType === 'donor') {
                      navigate('/register-donor');
                    } else if (loginData.userType === 'ngo') {
                      navigate('/register-ngo');
                    } else {
                      alert('Admin accounts are created by system administrators');
                    }
                  }}
                >
                  Register Now
                </button>
              </p>
            </div>

            <div className="demo-accounts">
              <h4>Demo Accounts</h4>
              <div className="demo-list">
                <div className="demo-item">
                  <strong>Donor:</strong> donor@demo.com / demo123
                </div>
                <div className="demo-item">
                  <strong>NGO:</strong> ngo@demo.com / demo123
                </div>
                <div className="demo-item">
                  <strong>Admin:</strong> admin@demo.com / admin123
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;