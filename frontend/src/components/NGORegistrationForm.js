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
            fontFamily: 'Poppins, sans-serif', 
            backgroundColor: '#e8f2f0', 
            minHeight: '100vh', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            padding: '2rem' 
        },
        container: { 
            background: '#fff', 
            padding: '2.5rem', 
            borderRadius: '12px', 
            width: '100%', 
            maxWidth: '520px', 
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)' 
        },
        input: { 
            width: '100%', 
            padding: '0.75rem', 
            borderRadius: '8px', 
            border: '1px solid #ddd', 
            marginBottom: '1rem',
            boxSizing: 'border-box'
        },
        button: { 
            width: '100%', 
            padding: '0.75rem', 
            borderRadius: '8px', 
            background: '#28a745', 
            color: '#fff', 
            border: 'none', 
            fontWeight: '700' 
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
        message: { 
            padding: '1rem', 
            borderRadius: '8px', 
            marginTop: '1rem' 
        },
        success: { 
            background: '#d4edda', 
            color: '#155724' 
        },
        error: { 
            background: '#f8d7da', 
            color: '#721c24' 
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
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Organization / NGO Name</label>
                        <input 
                            name="name" 
                            placeholder="Enter your organization name" 
                            style={styles.input} 
                            value={formData.name} 
                            onChange={handleChange} 
                            required 
                        />
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Email Address</label>
                        <input 
                            name="email" 
                            placeholder="organization@email.com" 
                            style={styles.input} 
                            value={formData.email} 
                            onChange={handleChange} 
                            type="email" 
                            required 
                        />
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Password</label>
                        <input 
                            name="password" 
                            placeholder="Create a strong password" 
                            style={styles.input} 
                            value={formData.password} 
                            onChange={handleChange} 
                            type="password" 
                            required 
                        />
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Confirm Password</label>
                        <input 
                            name="confirmPassword" 
                            placeholder="Confirm your password" 
                            style={styles.input} 
                            value={formData.confirmPassword} 
                            onChange={handleChange} 
                            type="password" 
                            required 
                        />
                    </div>
                    <button style={styles.button} type="submit" disabled={loading}>
                        {loading ? 'Creating Account...' : 'Register'}
                    </button>
                </>
            );
        } else if (step === 2) {
            return (
                <>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Enter OTP</label>
                        <input 
                            name="otp" 
                            placeholder="6-digit OTP from email" 
                            style={styles.input} 
                            value={formData.otp} 
                            onChange={handleChange} 
                            required 
                        />
                    </div>
                    <button style={styles.button} type="submit" disabled={loading}>
                        {loading ? 'Verifying...' : 'Verify Email'}
                    </button>
                </>
            );
        } else if (step === 3) {
            return (
                <>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Registration Number (Optional)</label>
                        <input 
                            name="registrationNumber" 
                            placeholder="NGO/Trust registration number" 
                            style={styles.input} 
                            value={formData.registrationNumber} 
                            onChange={handleChange} 
                        />
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Full Address</label>
                        <textarea 
                            name="address" 
                            placeholder="Enter complete address including city, state, pincode" 
                            style={{...styles.input, minHeight: '80px', resize: 'vertical'}} 
                            value={formData.address} 
                            onChange={handleChange} 
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
                        <label style={styles.label}>Phone Number</label>
                        <input 
                            name="phone" 
                            placeholder="+91 XXXXXXXXXX" 
                            style={styles.input} 
                            value={formData.phone} 
                            onChange={handleChange} 
                            type="tel"
                        />
                    </div>
                    <button style={styles.button} type="submit" disabled={loading}>
                        {loading ? 'Saving Details...' : 'Save Details'}
                    </button>
                </>
            );
        } else if (step === 4) {
            return (
                <>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Upload Registration Document</label>
                        <p style={{ fontSize: '0.9em', color: '#666', marginBottom: '0.5rem' }}>
                            Upload NGO registration certificate, trust deed, or other legal document
                        </p>
                        <input
                            name="document"
                            type="file"
                            style={styles.input}
                            onChange={handleFile}
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            required
                        />
                    </div>
                    <button style={styles.button} type="submit" disabled={loading}>
                        {loading ? 'Uploading...' : 'Upload Document'}
                    </button>
                </>
            );
        } else if (step === 5) {
            return (
                <>
                    <div style={{ ...styles.message, ...styles.success }}>
                        🎉 Registration Complete!
                        <br /><br />
                        Your NGO registration has been submitted successfully. 
                        Your account is now under admin review.
                        <br /><br />
                        <strong>What happens next?</strong>
                        <br />
                        • Admin will verify your documents
                        • You'll receive email notification upon approval
                        • Once approved, you can access the NGO dashboard
                        • Your NGO will appear on the distribution network map
                        <br /><br />
                        <strong>Expected Review Time:</strong> 24-48 hours
                    </div>
                    <button style={styles.button} onClick={() => navigate('/')}>
                        Go to Home
                    </button>
                </>
            );
        }
    };

    return (
        <div style={styles.page}>
            <div style={styles.container}>
                <h2 style={{ marginBottom: '1.5rem', textAlign: 'center', color: '#333' }}>
                    NGO Registration - Step {step} of 5
                </h2>
                
                {/* Step Progress Indicator */}
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    marginBottom: '2rem',
                    alignItems: 'center'
                }}>
                    {[1, 2, 3, 4, 5].map((stepNum) => (
                        <React.Fragment key={stepNum}>
                            <div style={{
                                width: '30px',
                                height: '30px',
                                borderRadius: '50%',
                                backgroundColor: step >= stepNum ? '#28a745' : '#ccc',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#fff',
                                fontWeight: 'bold',
                                fontSize: '0.9rem'
                            }}>
                                {stepNum}
                            </div>
                            {stepNum < 5 && (
                                <div style={{
                                    width: '40px',
                                    height: '2px',
                                    backgroundColor: step > stepNum ? '#28a745' : '#ccc',
                                    margin: '0 5px'
                                }} />
                            )}
                        </React.Fragment>
                    ))}
                </div>

                <form onSubmit={handleNext}>
                    {renderStep()}
                </form>
                
                {message.text && (
                    <div style={{ 
                        ...styles.message, 
                        ...(message.type === 'success' ? styles.success : styles.error) 
                    }}>
                        {message.text}
                    </div>
                )}
            </div>
        </div>
    );
}

export default NGORegistrationForm;