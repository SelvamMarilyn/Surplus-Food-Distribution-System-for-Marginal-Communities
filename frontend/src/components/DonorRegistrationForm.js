import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function DonorRegistrationForm() {
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        restaurantName: '',
        branchName: '',
        address: '',
        contactPersonName: '',
        phone: '',
        openingHours: '',
        foodType: '',
        description: '',
        otp: '',
        document: null,
    });
    const [message, setMessage] = useState({ text: '', type: '' });
    const [loading, setLoading] = useState(false);
    const [geocodeLoading, setGeocodeLoading] = useState(false);

    const styles = {
        page: {
            fontFamily: "'Cormorant Garamond', serif",
            backgroundColor: '#121212',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
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
        formContainer: {
            backgroundColor: 'rgba(38, 36, 36, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
            padding: '3rem 3.5rem',
            width: '100%',
            maxWidth: '600px',
            textAlign: 'center',
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
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
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
        formGroup: {
            marginBottom: '2rem',
            textAlign: 'left',
        },
        label: {
            display: 'block',
            marginBottom: '0.75rem',
            color: '#feca57',
            fontWeight: '600',
            fontSize: '1.1rem',
            textShadow: '0 1px 2px rgba(0,0,0,0.3)',
        },
        input: {
            width: '100%',
            padding: '1rem 1.25rem',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            fontSize: '1.1rem',
            transition: 'all 0.3s ease',
            boxSizing: 'border-box',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            color: '#f7fafc',
            backdropFilter: 'blur(10px)',
        },
        inputFocus: {
            borderColor: '#feca57',
            boxShadow: '0 0 20px rgba(254, 202, 87, 0.3)',
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
        },
        textarea: {
            width: '100%',
            padding: '1rem 1.25rem',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            fontSize: '1.1rem',
            transition: 'all 0.3s ease',
            boxSizing: 'border-box',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            color: '#f7fafc',
            backdropFilter: 'blur(10px)',
            minHeight: '120px',
            resize: 'vertical',
            fontFamily: 'inherit',
        },
        button: {
            width: '100%',
            padding: '1.25rem 2rem',
            border: 'none',
            borderRadius: '15px',
            background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
            color: '#fff',
            fontSize: '1.3rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            marginTop: '2rem',
            transition: 'all 0.3s ease',
            boxShadow: '0 8px 25px rgba(255, 107, 107, 0.3)',
            textTransform: 'uppercase',
            letterSpacing: '1px',
        },
        buttonHover: {
            transform: 'translateY(-3px)',
            boxShadow: '0 12px 35px rgba(255, 107, 107, 0.4)',
        },
        buttonDisabled: {
            background: 'rgba(255, 255, 255, 0.2)',
            cursor: 'not-allowed',
            transform: 'none',
            boxShadow: 'none',
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
            transition: 'all 0.3s ease',
        },
        geocodeButtonSuccess: {
            backgroundColor: '#d4edda',
            color: '#155724',
            borderColor: '#28a745',
        },
        message: {
            padding: '1.5rem',
            borderRadius: '12px',
            marginTop: '2rem',
            fontWeight: '600',
            fontSize: '1.1rem',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
        },
        messageSuccess: {
            backgroundColor: 'rgba(34, 197, 94, 0.2)',
            color: '#10b981',
            borderColor: 'rgba(34, 197, 94, 0.3)',
        },
        messageError: {
            backgroundColor: 'rgba(239, 68, 68, 0.2)',
            color: '#f87171',
            borderColor: 'rgba(239, 68, 68, 0.3)',
        },
        link: {
            color: '#007bff',
            textDecoration: 'none',
            fontWeight: '600',
        },
    };

    const handleChange = (e) => {
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
    const handleFileChange = (e) => {
        setFormData(prev => ({ ...prev, document: e.target.files[0] }));
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
                // Initial registration with password validation
                if (formData.password !== formData.confirmPassword) {
                    setMessage({ text: 'Passwords do not match.', type: 'error' });
                    setLoading(false);
                    return;
                }
                await axios.post('http://localhost:5000/api/donors/register', {
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                });
                setMessage({ text: 'Registration successful! Please check your email for the OTP.', type: 'success' });
                setStep(2);
            } else if (step === 2) {
                // Email verification
                await axios.post('http://localhost:5000/api/donors/verify-email', {
                    email: formData.email,
                    otp: formData.otp,
                });
                setMessage({ text: 'Email verified successfully! Please enter your restaurant details.', type: 'success' });
                setStep(3);
            } else if (step === 3) {
                // Update profile with restaurant details AND geocode address
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
                        }
                    } catch (geoError) {
                        console.warn('Geocoding failed during registration:', geoError);
                        // Continue without coordinates - not critical for registration
                    }
                }

                const profileData = {
                    email: formData.email,
                    restaurantName: formData.restaurantName,
                    branchName: formData.branchName,
                    address: formData.address,
                    contactPersonName: formData.contactPersonName,
                    phone: formData.phone,
                    openingHours: formData.openingHours,
                    foodType: formData.foodType,
                    description: formData.description,
                    ...(coordinates && { lat: coordinates.lat, lng: coordinates.lng })
                };

                const res = await axios.post('http://localhost:5000/api/donors/update-profile', profileData);
                
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
                // Document upload
                const fileData = new FormData();
                fileData.append('email', formData.email);
                fileData.append('document', formData.document);

                const res = await axios.post('http://localhost:5000/api/donors/upload-document', fileData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                setMessage({ text: res.data.message, type: 'success' });
                setStep(5);
            }
        } catch (error) {
            console.error(error);
            setMessage({
                text: error.response?.data?.message || 'An error occurred. Please try again.',
                type: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <>
                        <div style={styles.formGroup}>
                            <label style={styles.label} htmlFor="name">👤 Full Name</label>
                            <input
                                style={styles.input}
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                onFocus={handleInputFocus}
                                onBlur={handleInputBlur}
                                placeholder="Enter your full name"
                                required
                            />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label} htmlFor="email">📧 Email Address</label>
                            <input
                                style={styles.input}
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                onFocus={handleInputFocus}
                                onBlur={handleInputBlur}
                                placeholder="your.email@example.com"
                                required
                            />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label} htmlFor="password">🔒 Password</label>
                            <input
                                style={styles.input}
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                onFocus={handleInputFocus}
                                onBlur={handleInputBlur}
                                placeholder="Create a strong password"
                                required
                            />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label} htmlFor="confirmPassword">🔒 Confirm Password</label>
                            <input
                                style={styles.input}
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                onFocus={handleInputFocus}
                                onBlur={handleInputBlur}
                                placeholder="Confirm your password"
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
            case 2:
                return (
                    <>
                        <div style={styles.formGroup}>
                            <label style={styles.label} htmlFor="otp">🔐 Verification Code</label>
                            <input
                                style={styles.input}
                                type="text"
                                id="otp"
                                name="otp"
                                value={formData.otp}
                                onChange={handleChange}
                                onFocus={handleInputFocus}
                                onBlur={handleInputBlur}
                                placeholder="Enter 6-digit code from email"
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
            case 3:
                return (
                    <>
                        <div style={styles.formGroup}>
                            <label style={styles.label} htmlFor="restaurantName">🏪 Restaurant/Business Name</label>
                            <input
                                style={styles.input}
                                type="text"
                                id="restaurantName"
                                name="restaurantName"
                                value={formData.restaurantName}
                                onChange={handleChange}
                                onFocus={handleInputFocus}
                                onBlur={handleInputBlur}
                                placeholder="Enter your restaurant or business name"
                                required
                            />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label} htmlFor="branchName">🏢 Branch/Location Name (Optional)</label>
                            <input
                                style={styles.input}
                                type="text"
                                id="branchName"
                                name="branchName"
                                value={formData.branchName}
                                onChange={handleChange}
                                onFocus={handleInputFocus}
                                onBlur={handleInputBlur}
                                placeholder="e.g., Downtown Branch, Main Street Location"
                            />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label} htmlFor="address">📍 Complete Address</label>
                            <input
                                style={styles.input}
                                type="text"
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                onFocus={handleInputFocus}
                                onBlur={handleInputBlur}
                                placeholder="Street, City, State, ZIP Code"
                                required
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
<div style={styles.formGroup}>
                            <label style={styles.label} htmlFor="phone">📞 Contact Phone Number</label>
                            <input
                                style={styles.input}
                                type="tel"
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                onFocus={handleInputFocus}
                                onBlur={handleInputBlur}
                                placeholder="+1 (555) 123-4567"
                                required
                            />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label} htmlFor="openingHours">🕒 Operating Hours</label>
                            <input
                                style={styles.input}
                                type="text"
                                id="openingHours"
                                name="openingHours"
                                value={formData.openingHours}
                                onChange={handleChange}
                                onFocus={handleInputFocus}
                                onBlur={handleInputBlur}
                                placeholder="e.g., Mon-Fri: 9AM-10PM, Sat-Sun: 10AM-11PM"
                                required
                            />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label} htmlFor="foodType">🍽️ Primary Food Category</label>
                            <select
                                style={styles.input}
                                id="foodType"
                                name="foodType"
                                value={formData.foodType}
                                onChange={handleChange}
                                onFocus={handleInputFocus}
                                onBlur={handleInputBlur}
                                required
                            >
                                <option value="" style={{background: '#262424', color: '#f7fafc'}}>Select food category</option>
                                <option value="Vegetarian" style={{background: '#262424', color: '#f7fafc'}}>🌱 Vegetarian</option>
                                <option value="Non-Vegetarian" style={{background: '#262424', color: '#f7fafc'}}>🍖 Non-Vegetarian</option>
                                <option value="Mixed" style={{background: '#262424', color: '#f7fafc'}}>🥗 Mixed (Both)</option>
                                <option value="Vegan" style={{background: '#262424', color: '#f7fafc'}}>🌿 Vegan</option>
                            </select>
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label} htmlFor="description">📝 Business Description</label>
                            <textarea
                                style={styles.textarea}
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                onFocus={handleInputFocus}
                                onBlur={handleInputBlur}
                                placeholder="Tell us about your restaurant, cuisine type, and any special features..."
                                required
                            ></textarea>
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
            case 4:
                return (
                    <>
                        <div style={styles.formGroup}>
                            <label style={styles.label} htmlFor="document">📄 Business License/Document</label>
                            <div style={{
                                border: '2px dashed rgba(254, 202, 87, 0.5)',
                                borderRadius: '12px',
                                padding: '2rem',
                                textAlign: 'center',
                                backgroundColor: 'rgba(254, 202, 87, 0.1)',
                                transition: 'all 0.3s ease'
                            }}>
                                <input
                                    style={{
                                        ...styles.input,
                                        border: 'none',
                                        backgroundColor: 'transparent',
                                        padding: '0',
                                        textAlign: 'center'
                                    }}
                                    type="file"
                                    id="document"
                                    name="document"
                                    onChange={handleFileChange}
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    required
                                />
                                <p style={{color: '#e2e8f0', margin: '1rem 0 0 0', fontSize: '0.9rem'}}>
                                    📋 Upload your business license, permit, or registration document<br/>
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
            case 5:
                return (
                    <>
                        <div style={{
                            ...styles.message,
                            ...styles.messageSuccess,
                            textAlign: 'center',
                            padding: '3rem 2rem'
                        }}>
                            <div style={{fontSize: '4rem', marginBottom: '1rem'}}>🎉</div>
                            <h3 style={{color: '#10b981', margin: '0 0 1rem 0', fontSize: '1.5rem'}}>
                                Registration Complete!
                            </h3>
                            <p style={{margin: '0 0 1.5rem 0', lineHeight: '1.6'}}>
                                Your donor account has been successfully created and is now under review by our admin team. 
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
            default:
                return null;
        }
    };

    return (
<div style={styles.page}>
            <div style={styles.backgroundPattern}></div>
            <div style={styles.formContainer}>
                <h1 style={styles.formTitle}>Donor Registration</h1>

                {/* Step Indicator (5 steps now) */}
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

                {message.text && step !== 5 && (
                    <div style={message.type === 'success' ? { ...styles.message, ...styles.messageSuccess } : { ...styles.message, ...styles.messageError }}>
                        {message.text}
                    </div>
                )}
            </div>
        </div>
    );
}

export default DonorRegistrationForm;