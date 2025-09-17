// NGORegistrationForm.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function NGORegistrationForm() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        registrationNumber: '',
        address: '',
        phone: '',
        otp: '',
        document: null,
    });
    const [message, setMessage] = useState({ text: '', type: '' });
    const [loading, setLoading] = useState(false);
    const [geocodeLoading, setGeocodeLoading] = useState(false);

    const BACKEND = 'http://localhost:5000/api/ngo';

    const styles = {
        page: {
            fontFamily: "'Cormorant Garamond', serif",
            backgroundColor: '#121212',
            minHeight: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '2rem',
            position: 'relative',
            overflow: 'hidden',
        },
        backgroundPattern: {
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            background: `
                radial-gradient(circle at 20% 50%, rgba(255, 107, 107, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(254, 202, 87, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 40% 80%, rgba(255, 107, 107, 0.1) 0%, transparent 50%)
            `,
            zIndex: 0,
        },
        container: {
            background: 'rgba(38, 36, 36, 0.95)',
            backdropFilter: 'blur(20px)',
            padding: '3rem 3.5rem',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '600px',
            boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            position: 'relative',
            zIndex: 1,
        },
        formTitle: {
            fontSize: '2.5rem',
            marginBottom: '2rem',
            color: '#feca57',
            fontFamily: "'Great Vibes', cursive",
            fontWeight: '400',
            textAlign: 'center',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
        },
        input: {
            width: '100%',
            padding: '1rem 1.25rem',
            borderRadius: '12px',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            marginBottom: '1.5rem',
            fontSize: '1.1rem',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            color: '#f7fafc',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease',
            boxSizing: 'border-box',
        },
        inputFocus: {
            borderColor: '#feca57',
            boxShadow: '0 0 20px rgba(254, 202, 87, 0.3)',
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
        },
        button: {
            width: '100%',
            padding: '1.25rem 2rem',
            borderRadius: '15px',
            background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
            color: '#fff',
            border: 'none',
            fontWeight: 'bold',
            fontSize: '1.3rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 8px 25px rgba(255, 107, 107, 0.3)',
            textTransform: 'uppercase',
            letterSpacing: '1px',
        },
        buttonHover: {
            transform: 'translateY(-3px)',
            boxShadow: '0 12px 35px rgba(255, 107, 107, 0.4)',
        },
        geocodeButton: {
            width: '100%',
            padding: '0.5rem',
            border: '1px solid #007bff',
            borderRadius: '8px',
            backgroundColor: '#fff',
            color: '#007bff',
            fontSize: '0.9rem',
            cursor: 'pointer',
            marginTop: '0.5rem',
            marginBottom: '1rem',
            transition: 'all 0.3s ease',
        },
        buttonDisabled: {
            background: 'rgba(255, 255, 255, 0.2)',
            cursor: 'not-allowed',
            transform: 'none',
            boxShadow: 'none',
        },
        message: {
            padding: '1.5rem',
            borderRadius: '12px',
            marginTop: '1.5rem',
            fontWeight: '600',
            fontSize: '1.1rem',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
        },
        success: {
            background: 'rgba(34, 197, 94, 0.2)',
            color: '#10b981',
            borderColor: 'rgba(34, 197, 94, 0.3)',
        },
        error: {
            background: 'rgba(239, 68, 68, 0.2)',
            color: '#f87171',
            borderColor: 'rgba(239, 68, 68, 0.3)',
        },
                stepIndicator: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: '2rem',
        },
        stepDot: {
            height: '40px',
            width: '40px',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#f7fafc',
            fontSize: '1.3rem',
            fontWeight: 'bold',
            transition: 'all 0.3s ease',
            border: '2px solid rgba(255, 255, 255, 0.3)',
        },
        stepComplete: {
            backgroundColor: '#feca57',
            color: '#121212',
            borderColor: '#feca57',
            boxShadow: '0 0 20px rgba(254, 202, 87, 0.4)',
        },
        stepLine: {
            width: '80px',
            height: '3px',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            margin: '0 10px',
            transition: 'all 0.3s ease',
            borderRadius: '2px',
        },
        stepLineComplete: {
            backgroundColor: '#feca57',
            boxShadow: '0 0 10px rgba(254, 202, 87, 0.3)',
        },
        label: {
            display: 'block',
            marginBottom: '0.5rem',
            color: '#555',
            fontWeight: '600',
        },
        formGroup: {
            marginBottom: '1.5rem',
        },
    };

    const handleChange = e => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    const handleInputFocus = (e) => {
        Object.assign(e.target.style, styles.inputFocus);
    };

    const handleInputBlur = (e) => {
        e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        e.target.style.boxShadow = 'none';
        e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
    };

    const handleButtonHover = (e, isHovering) => {
        if (!loading) {
            if (isHovering) {
                Object.assign(e.currentTarget.style, styles.buttonHover);
            } else {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(255, 107, 107, 0.3)';
            }
        }
    };
    const handleFile = (e) => {
        const file = e.target.files[0];
        console.log("Selected file:", file);
        setFormData((prev) => ({ ...prev, document: file }));
    };

    // Geocode address to get coordinates
    const handleGeocodeAddress = async () => {
        if (!formData.address.trim()) {
            setMessage({ text: 'Please enter an address first', type: 'error' });
            return;
        }

        setGeocodeLoading(true);
        try {
            const response = await axios.get('http://localhost:5000/api/food/geocode', {
                params: { address: formData.address }
            });
            
            if (response.data && response.data.lat && response.data.lng) {
                setMessage({ 
                    text: `Location found: ${response.data.lat.toFixed(6)}, ${response.data.lng.toFixed(6)}`, 
                    type: 'success' 
                });
            } else {
                setMessage({ 
                    text: 'Could not find exact coordinates, but address will be saved', 
                    type: 'error' 
                });
            }
        } catch (error) {
            console.error('Geocoding error:', error);
            setMessage({ 
                text: 'Could not verify location, but will proceed with registration', 
                type: 'error' 
            });
        } finally {
            setGeocodeLoading(false);
        }
    };

    const handleNext = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: '', type: '' });

        try {
            if (step === 1) {
                if (formData.password !== formData.confirmPassword) {
                    setMessage({ text: 'Passwords do not match', type: 'error' });
                    setLoading(false);
                    return;
                }
                await axios.post(`${BACKEND}/register`, {
                    name: formData.name,
                    email: formData.email,
                    password: formData.password
                });
                setMessage({ text: 'Registered. OTP sent to your email.', type: 'success' });
                setStep(2);
            } else if (step === 2) {
                await axios.post(`${BACKEND}/verify-email`, {
                    email: formData.email,
                    otp: formData.otp
                });
                setMessage({ text: 'Email verified. Fill organization details.', type: 'success' });
                setStep(3);
            } else if (step === 3) {
                // Update profile with organization details AND geocode address
                let coordinates = null;
                
                // Try to get coordinates for the address
                if (formData.address.trim()) {
                    try {
                        const geoResponse = await axios.get('http://localhost:5000/api/food/geocode', {
                            params: { address: formData.address }
                        });
                        
                        if (geoResponse.data && geoResponse.data.lat && geoResponse.data.lng) {
                            coordinates = {
                                lat: geoResponse.data.lat,
                                lng: geoResponse.data.lng
                            };
                            
                            // ✅ CRITICAL: Save coordinates to backend
                            await axios.post(`${BACKEND}/save-coordinates`, {
                                email: formData.email,
                                lat: coordinates.lat,
                                lng: coordinates.lng
                            });
                        }
                    } catch (geoError) {
                        console.warn('Geocoding failed during registration:', geoError);
                    }
                }

                const profileData = {
                    email: formData.email,
                    registrationNumber: formData.registrationNumber,
                    address: formData.address,
                    phone: formData.phone,
                    ...(coordinates && { lat: coordinates.lat, lng: coordinates.lng })
                };

                const res = await axios.post(`${BACKEND}/update-profile`, profileData);
                
                if (coordinates) {
                    setMessage({ 
                        text: `${res.data.message} Location coordinates saved successfully!`, 
                        type: 'success' 
                    });
                } else {
                    setMessage({ 
                        text: `${res.data.message} (Note: Could not determine exact location - you can update this later)`, 
                        type: 'success' 
                    });
                }
                
                setStep(4);
            } else if (step === 4) {
                const fd = new FormData();
                fd.append('email', formData.email);
                fd.append('document', formData.document);

                const res = await axios.post(`${BACKEND}/upload-document`, fd, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                setMessage({ text: res.data.message, type: 'success' });
                setStep(5);
            }
        } catch (err) {
            console.error(err);
            setMessage({ text: err.response?.data?.message || 'Error occurred', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const renderStep = () => {
        if (step === 1) {
            return (
                <>
                <div style={{marginBottom: '1.5rem'}}>
                    <label style={{display: 'block', marginBottom: '0.75rem', color: '#feca57', fontWeight: '600', fontSize: '1.1rem'}}>🏢 Organization Name</label>
                    <input 
                        name="name" 
                        placeholder="Enter your NGO/Organization name" 
                        style={styles.input} 
                        value={formData.name} 
                        onChange={handleChange} 
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                        required 
                    />
                </div>
                <div style={{marginBottom: '1.5rem'}}>
                    <label style={{display: 'block', marginBottom: '0.75rem', color: '#feca57', fontWeight: '600', fontSize: '1.1rem'}}>📧 Email Address</label>
                    <input 
                        name="email" 
                        placeholder="your.organization@example.com" 
                        style={styles.input} 
                        value={formData.email} 
                        onChange={handleChange} 
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                        type="email" 
                        required 
                    />
                </div>
                <div style={{marginBottom: '1.5rem'}}>
                    <label style={{display: 'block', marginBottom: '0.75rem', color: '#feca57', fontWeight: '600', fontSize: '1.1rem'}}>🔒 Password</label>
                    <input 
                        name="password" 
                        placeholder="Create a strong password" 
                        style={styles.input} 
                        value={formData.password} 
                        onChange={handleChange} 
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                        type="password" 
                        required 
                    />
                </div>
                <div style={{marginBottom: '1.5rem'}}>
                    <label style={{display: 'block', marginBottom: '0.75rem', color: '#feca57', fontWeight: '600', fontSize: '1.1rem'}}>🔒 Confirm Password</label>
                    <input 
                        name="confirmPassword" 
                        placeholder="Confirm your password" 
                        style={styles.input} 
                        value={formData.confirmPassword} 
                        onChange={handleChange} 
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                        type="password" 
                        required 
                    />
                </div>
                <button 
                    style={loading ? { ...styles.button, ...styles.buttonDisabled } : styles.button} 
                    type="submit" 
                    disabled={loading}
                    onMouseEnter={(e) => handleButtonHover(e, true)}
                    onMouseLeave={(e) => handleButtonHover(e, false)}
                >
                    {loading ? '⏳ Creating Account...' : '🚀 Create Account'}
                </button>
            </>
            );
        } else if (step === 2) {
            return (
                <>
                <div style={{marginBottom: '1.5rem'}}>
                    <label style={{display: 'block', marginBottom: '0.75rem', color: '#feca57', fontWeight: '600', fontSize: '1.1rem'}}>🔐 Verification Code</label>
                    <input 
                        name="otp" 
                        placeholder="Enter 6-digit code from email" 
                        style={styles.input} 
                        value={formData.otp} 
                        onChange={handleChange} 
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                        maxLength="6"
                        required 
                    />
                    <p style={{color: '#e2e8f0', fontSize: '0.9rem', marginTop: '0.5rem', opacity: '0.8'}}>
                        📧 Check your email for the verification code
                    </p>
                </div>
                <button 
                    style={loading ? { ...styles.button, ...styles.buttonDisabled } : styles.button} 
                    type="submit" 
                    disabled={loading}
                    onMouseEnter={(e) => handleButtonHover(e, true)}
                    onMouseLeave={(e) => handleButtonHover(e, false)}
                >
                    {loading ? '⏳ Verifying...' : '✅ Verify Email'}
                </button>
            </>
            );
        } else if (step === 3) {
            return (
                <>
                <div style={{marginBottom: '1.5rem'}}>
                    <label style={{display: 'block', marginBottom: '0.75rem', color: '#feca57', fontWeight: '600', fontSize: '1.1rem'}}>📋 Registration Number (Optional)</label>
                    <input 
                        name="registrationNumber" 
                        placeholder="NGO/Trust registration number" 
                        style={styles.input} 
                        value={formData.registrationNumber} 
                        onChange={handleChange} 
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                    />
                </div>
                <div style={{marginBottom: '1.5rem'}}>
                    <label style={{display: 'block', marginBottom: '0.75rem', color: '#feca57', fontWeight: '600', fontSize: '1.1rem'}}>📍 Organization Address</label>
                    <input 
                        name="address" 
                        placeholder="Street, City, State, ZIP Code" 
                        style={styles.input} 
                        value={formData.address} 
                        onChange={handleChange} 
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                    />     
                        <button
                            type="button"
                            style={styles.geocodeButton}
                            onClick={handleGeocodeAddress}
                            disabled={geocodeLoading}
                        >
                            {geocodeLoading ? 'Verifying Location...' : '📍 Verify Location'}
                        </button>
                    </div>
                <div style={{marginBottom: '1.5rem'}}>
                    <label style={{display: 'block', marginBottom: '0.75rem', color: '#feca57', fontWeight: '600', fontSize: '1.1rem'}}>📞 Contact Phone</label>
                    <input 
                        name="phone" 
                        placeholder="+91 XXXXXXXXXX" 
                        style={styles.input} 
                        value={formData.phone} 
                        onChange={handleChange} 
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                        type="tel"
                    />
                </div>
                <button 
                    style={loading ? { ...styles.button, ...styles.buttonDisabled } : styles.button} 
                    type="submit" 
                    disabled={loading}
                    onMouseEnter={(e) => handleButtonHover(e, true)}
                    onMouseLeave={(e) => handleButtonHover(e, false)}
                >
                    {loading ? '⏳ Saving Details...' : '➡️ Continue to Document Upload'}
                </button>
            </>
            );
        } else if (step === 4) {
            return (
                <>
                    <div style={{marginBottom: '1.5rem'}}>
                        <label style={{display: 'block', marginBottom: '0.75rem', color: '#feca57', fontWeight: '600', fontSize: '1.1rem'}}>📄 Organization Documents</label>
                        <div style={{
                            border: '2px dashed rgba(254, 202, 87, 0.5)',
                            borderRadius: '12px',
                            padding: '2rem',
                            textAlign: 'center',
                            backgroundColor: 'rgba(254, 202, 87, 0.1)',
                            transition: 'all 0.3s ease'
                        }}>
                            <input
                                name="document"
                                type="file"
                                style={{
                                    ...styles.input,
                                    border: 'none',
                                    backgroundColor: 'transparent',
                                    padding: '0',
                                    textAlign: 'center'
                                }}
                                onChange={handleFile}
                                accept=".pdf,.jpg,.jpeg,.png"
                                required
                            />
                            <p style={{color: '#e2e8f0', margin: '1rem 0 0 0', fontSize: '0.9rem'}}>
                                📋 Upload your NGO registration, license, or certification document<br/>
                                <span style={{opacity: '0.7'}}>Accepted formats: PDF, JPG, PNG (Max 5MB)</span>
                            </p>
                        </div>
                    </div>
                    <button 
                        style={loading ? { ...styles.button, ...styles.buttonDisabled } : styles.button} 
                        type="submit" 
                        disabled={loading}
                        onMouseEnter={(e) => handleButtonHover(e, true)}
                        onMouseLeave={(e) => handleButtonHover(e, false)}
                    >
                        {loading ? '⏳ Uploading...' : '🚀 Complete Registration'}
                    </button>
                </>
            );
        } else if (step === 5) {
            return (
                <>
                <div style={{
                    ...styles.message,
                    ...styles.success,
                    textAlign: 'center',
                    padding: '3rem 2rem'
                }}>
                    <div style={{fontSize: '4rem', marginBottom: '1rem'}}>🎉</div>
                    <h3 style={{color: '#10b981', margin: '0 0 1rem 0', fontSize: '1.5rem'}}>
                        Registration Complete!
                    </h3>
                    <p style={{margin: '0 0 1.5rem 0', lineHeight: '1.6'}}>
                        Your NGO account has been successfully created and is now under review by our admin team. 
                        You'll receive an email notification once your account is approved.
                    </p>
                    <div style={{
                        background: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        borderRadius: '8px',
                        padding: '1rem',
                        margin: '1.5rem 0'
                    }}>
                        <p style={{margin: '0', fontSize: '0.9rem', color: '#10b981'}}>
                            <strong>⏱️ Review Process:</strong> Typically takes 24-48 hours<br/>
                            <strong>📧 Notification:</strong> You'll receive an email when approved
                        </p>
                    </div>
                </div>
                <button 
                    style={styles.button} 
                    onClick={() => navigate('/')}
                    onMouseEnter={(e) => handleButtonHover(e, true)}
                    onMouseLeave={(e) => handleButtonHover(e, false)}
                >
                    🏠 Return to Homepage
                </button>
            </>
            );
        }
    };

    return (
                <div style={styles.page}>
            <div style={styles.backgroundPattern}></div>
            <div style={styles.container}>
                <h2 style={styles.formTitle}>NGO Registration</h2>
                
                {/* Step Indicator (4 steps) */}
                <div style={styles.stepIndicator}>
                    <span style={{ ...styles.stepDot, ...(step >= 1 ? styles.stepComplete : {}) }}>1</span>
                    <span style={{ ...styles.stepLine, ...(step >= 2 ? styles.stepLineComplete : {}) }}></span>
                    <span style={{ ...styles.stepDot, ...(step >= 2 ? styles.stepComplete : {}) }}>2</span>
                    <span style={{ ...styles.stepLine, ...(step >= 3 ? styles.stepLineComplete : {}) }}></span>
                    <span style={{ ...styles.stepDot, ...(step >= 3 ? styles.stepComplete : {}) }}>3</span>
                    <span style={{ ...styles.stepLine, ...(step >= 4 ? styles.stepLineComplete : {}) }}></span>
                    <span style={{ ...styles.stepDot, ...(step >= 4 ? styles.stepComplete : {}) }}>4</span>
                    <span style={{ ...styles.stepLine, ...(step >= 5 ? styles.stepLineComplete : {}) }}></span>
                    <span style={{ ...styles.stepDot, ...(step >= 5 ? styles.stepComplete : {}) }}>5</span>
                </div>
                
                <form onSubmit={handleNext}>
                    {renderStep()}
                </form>
                {message.text && (
                    <div style={{ ...styles.message, ...(message.type === 'success' ? styles.success : styles.error) }}>{message.text}</div>
                )}
            </div>
        </div>
    );
}

export default NGORegistrationForm;