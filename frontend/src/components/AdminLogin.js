import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AdminLogin() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });
    const [message, setMessage] = useState({ text: '', type: '' });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const styles = {
        pageContainer: {
            minHeight: '100vh',
            background: 'linear-gradient(135deg, rgb(234 102 102) 0%, rgb(89 75 162) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            fontFamily: "'Cormorant Garamond', serif",
        },
        loginCard: {
           background: 'linear-gradient(135deg, rgb(25 16 16 / 90%) 0%, rgb(85 81 106 / 46%) 100%)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            boxShadow: 'rgb(191 185 185 / 68%) 0px 20px 60px',
            padding: '3rem',
            width: '100%',
            maxWidth: '450px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
        },
        header: {
            textAlign: 'center',
            marginBottom: '2.5rem',
        },
        title: {
            fontSize: '3.5rem',
            fontFamily: "'Great Vibes', cursive",
            fontWeight: '700',
            color: '#f8f8f9ff',
            marginBottom: '0.5rem',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
        },
        subtitle: {
            color: '#f1f4f8ff',
            fontSize: '1.5rem',
            fontWeight: '500',
        },
        form: {
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
        },
        inputGroup: {
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
        },
        label: {
            color: '#edf1f7ff',
            fontSize: '1.5rem',
            fontWeight: '600',
            marginLeft: '0.25rem',
        },
        inputContainer: {
            position: 'relative',
        },
        input: {
            width: '100%',
            padding: '0.875rem 1rem',
            border: '2px solid #202122ff',
            borderRadius: '12px',
            fontSize: '1.2rem',
            transition: 'all 0.3s ease',
            backgroundColor: '#fff',
            boxSizing: 'border-box',
            outline: 'none',
        },
        inputFocus: {
            borderColor: '#16171aff',
            boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
        },
        passwordToggle: {
            position: 'absolute',
            right: '1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            color: '#f2f5f9ff',
            cursor: 'pointer',
            fontSize: '1.2rem',
            fontWeight: '500',
            padding: '0.25rem',
            borderRadius: '4px',
            transition: 'color 0.2s ease',
        },
        passwordToggleHover: {
            color: '#667eea',
        },
        button: {
            width: '100%',
            padding: '0.875rem 1rem',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            fontFamily: "'Cormorant Garamond', serif",
            color: '#ffffffff',
            border: 'none',
            borderRadius: '12px',
            fontSize: '1.2rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            marginTop: '0.5rem',
            position: 'relative',
            overflow: 'hidden',
        },
        buttonHover: {
            transform: 'translateY(-2px)',
            boxShadow: '0 10px 25px rgba(102, 126, 234, 0.3)',
        },
        buttonDisabled: {
            background: '#a0aec0',
            cursor: 'not-allowed',
            transform: 'none',
            boxShadow: 'none',
        },
        loadingSpinner: {
            fontFamily: "'Cormorant Garamond', serif",
            width: '20px',
            height: '20px',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            borderTop: '2px solid #fff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            display: 'inline-block',
            marginRight: '8px',
        },
        message: {
            padding: '1rem',
            borderRadius: '12px',
            fontSize: '1.2rem',
            fontWeight: '500',
            textAlign: 'center',
            marginTop: '1rem',
            border: '1px solid transparent',
            fontFamily: "'Cormorant Garamond', serif",
        },
        messageSuccess: {
            background: 'rgba(205, 221, 212, 0.1)',
            color: '#e4eae7ff',
            borderColor: 'rgba(72, 187, 120, 0.2)',
        },
        messageError: {
            background: 'rgba(96, 55, 55, 0.1)',
            color: '#f2f2f2ff',
            borderColor: 'rgba(208, 197, 197, 0.2)',
        },
        footer: {
            textAlign: 'center',
            marginTop: '2rem',
            padding: '1rem 0',
            borderTop: '1px solid rgba(226, 232, 240, 0.5)',
        },
        footerText: {
            color: '#f1f3f6ff',
            fontSize: '1.2rem',
        },
        adminIcon: {
            width: '60px',
            height: '60px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            boxShadow: '0 10px 25px rgba(102, 126, 234, 0.2)',
        },
        adminIconText: {
            color: '#fff',
            fontSize: '1.5rem',
            fontWeight: 'bold',
        },
    };

    // Add keyframes for spinner animation
    const spinKeyframes = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: '', type: '' });
        
        try {
            const res = await axios.post('http://localhost:5000/api/admin/login', formData);
            localStorage.setItem('isAuthenticated', 'true');
            setMessage({ text: res.data.message, type: 'success' });
            
            // Add a slight delay to show success message
            setTimeout(() => {
                navigate('/admin');
            }, 1000);
            
        } catch (error) {
            console.error('Login error:', error);
            setMessage({ 
                text: error.response?.data?.message || 'Login failed. Please check your credentials and try again.', 
                type: 'error' 
            });
        } finally {
            setLoading(false);
        }
    };

    const handleInputFocus = (e) => {
        Object.assign(e.target.style, styles.inputFocus);
    };

    const handleInputBlur = (e) => {
        e.target.style.borderColor = '#e2e8f0';
        e.target.style.boxShadow = 'none';
    };

    const handleButtonMouseEnter = (e) => {
        if (!loading) {
            Object.assign(e.target.style, styles.buttonHover);
        }
    };

    const handleButtonMouseLeave = (e) => {
        if (!loading) {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
        }
    };

    const handlePasswordToggleMouseEnter = (e) => {
        Object.assign(e.target.style, styles.passwordToggleHover);
    };

    const handlePasswordToggleMouseLeave = (e) => {
        e.target.style.color = '#718096';
    };

    return (
        <>
            <style>{spinKeyframes}</style>
            <div style={styles.pageContainer}>
                <div style={styles.loginCard}>
                    <div style={styles.header}>
                        <div style={styles.adminIcon}>
                            <span style={styles.adminIconText}>A</span>
                        </div>
                        <h1 style={styles.title}>Admin Portal</h1>
                        <p style={styles.subtitle}>Sign in to access the dashboard</p>
                    </div>

                    <form style={styles.form} onSubmit={handleSubmit}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label} htmlFor="username">
                                Username
                            </label>
                            <input
                                style={styles.input}
                                type="text"
                                id="username"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                onFocus={handleInputFocus}
                                onBlur={handleInputBlur}
                                placeholder="Enter your username"
                                required
                                autoComplete="username"
                            />
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label} htmlFor="password">
                                Password
                            </label>
                            <div style={styles.inputContainer}>
                                <input
                                    style={styles.input}
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    onFocus={handleInputFocus}
                                    onBlur={handleInputBlur}
                                    placeholder="Enter your password"
                                    required
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    style={styles.passwordToggle}
                                    onClick={() => setShowPassword(!showPassword)}
                                    onMouseEnter={handlePasswordToggleMouseEnter}
                                    onMouseLeave={handlePasswordToggleMouseLeave}
                                >
                                    {showPassword ? '👁️' : '👁️‍🗨️'}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            style={loading ? { ...styles.button, ...styles.buttonDisabled } : styles.button}
                            disabled={loading}
                            onMouseEnter={handleButtonMouseEnter}
                            onMouseLeave={handleButtonMouseLeave}
                        >
                            {loading && <div style={styles.loadingSpinner}></div>}
                            {loading ? 'Signing In...' : 'Sign In'}
                        </button>
                    </form>

                    {message.text && (
                        <div style={message.type === 'success' ? 
                            { ...styles.message, ...styles.messageSuccess } : 
                            { ...styles.message, ...styles.messageError }
                        }>
                            {message.text}
                        </div>
                    )}

                    <div style={styles.footer}>
                        <p style={styles.footerText}>
                            Secure Admin Access • Food Donation Platform
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}

export default AdminLogin;