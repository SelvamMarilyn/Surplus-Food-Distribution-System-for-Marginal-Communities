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
        confirmPassword: '', // Added confirm password to state
        restaurantName: '',
        branchName: '',
        address: '',
        contactPersonName: '',
        phone: '',
        openingHours: '',
        otp: '',
        document: null,
    });
    const [message, setMessage] = useState({ text: '', type: '' });
    const [loading, setLoading] = useState(false);

    const styles = {
        page: {
            fontFamily: '"Poppins", sans-serif',
            backgroundColor: '#e8f2f0',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            padding: '2rem',
        },
        formContainer: {
            backgroundColor: '#fff',
            borderRadius: '15px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
            padding: '2.5rem 3rem',
            width: '100%',
            maxWidth: '500px',
            textAlign: 'center',
        },
        formTitle: {
            fontSize: '2rem',
            marginBottom: '1.5rem',
            color: '#333',
        },
        stepIndicator: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: '2rem',
        },
        // Updated styles for larger step dots and lines
        stepDot: {
            height: '30px',
            width: '30px',
            backgroundColor: '#ccc',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            transition: 'background-color 0.3s ease',
        },
        stepComplete: {
            backgroundColor: '#28a745',
        },
        stepLine: {
            width: '60px',
            height: '2px',
            backgroundColor: '#ccc',
            margin: '0 5px',
            transition: 'background-color 0.3s ease',
        },
        formGroup: {
            marginBottom: '1.5rem',
            textAlign: 'left',
        },
        label: {
            display: 'block',
            marginBottom: '0.5rem',
            color: '#555',
            fontWeight: '600',
        },
        input: {
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #ddd',
            borderRadius: '8px',
            fontSize: '1rem',
            transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
            boxSizing: 'border-box',
        },
        button: {
            width: '100%',
            padding: '0.75rem',
            border: 'none',
            borderRadius: '8px',
            backgroundColor: '#28a745',
            color: '#fff',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            marginTop: '1.5rem',
            transition: 'background-color 0.3s ease',
        },
        buttonDisabled: {
            backgroundColor: '#aaa',
            cursor: 'not-allowed',
        },
        message: {
            padding: '1rem',
            borderRadius: '8px',
            marginTop: '1.5rem',
            fontWeight: '600',
        },
        messageSuccess: {
            backgroundColor: '#d4edda',
            color: '#155724',
        },
        messageError: {
            backgroundColor: '#f8d7da',
            color: '#721c24',
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

    const handleFileChange = (e) => {
        setFormData(prev => ({ ...prev, document: e.target.files[0] }));
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
                // Update profile with restaurant details
                const res = await axios.post('http://localhost:5000/api/donors/update-profile', {
                    email: formData.email,
                    restaurantName: formData.restaurantName,
                    branchName: formData.branchName,
                    address: formData.address,
                    contactPersonName: formData.contactPersonName,
                    phone: formData.phone,
                    openingHours: formData.openingHours,
                    foodType: formData.foodType,
                    description: formData.description
                });
                setMessage({ text: res.data.message, type: 'success' });
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
                setStep(5); // Move to a new step for the final success message
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
                            <label style={styles.label} htmlFor="name">Name</label>
                            <input
                                style={styles.input}
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label} htmlFor="email">Email</label>
                            <input
                                style={styles.input}
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label} htmlFor="password">Password</label>
                            <input
                                style={styles.input}
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label} htmlFor="confirmPassword">Confirm Password</label>
                            <input
                                style={styles.input}
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <button style={loading ? { ...styles.button, ...styles.buttonDisabled } : styles.button} type="submit" disabled={loading}>
                            Register
                        </button>
                    </>
                );
            case 2:
                return (
                    <>
                        <div style={styles.formGroup}>
                            <label style={styles.label} htmlFor="otp">Enter OTP</label>
                            <input
                                style={styles.input}
                                type="text"
                                id="otp"
                                name="otp"
                                value={formData.otp}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <button style={loading ? { ...styles.button, ...styles.buttonDisabled } : styles.button} type="submit" disabled={loading}>
                            Verify Email
                        </button>
                    </>
                );
            case 3:
                return (
                    <>
                        <div style={styles.formGroup}>
                            <label style={styles.label} htmlFor="restaurantName">Restaurant Name</label>
                            <input
                                style={styles.input}
                                type="text"
                                id="restaurantName"
                                name="restaurantName"
                                value={formData.restaurantName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label} htmlFor="branchName">Branch Name (Optional)</label>
                            <input
                                style={styles.input}
                                type="text"
                                id="branchName"
                                name="branchName"
                                value={formData.branchName}
                                onChange={handleChange}
                            />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label} htmlFor="address">Address</label>
                            <input
                                style={styles.input}
                                type="text"
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label} htmlFor="phone">Phone</label>
                            <input
                                style={styles.input}
                                type="tel"
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label} htmlFor="openingHours">Opening Hours</label>
                            <input
                                style={styles.input}
                                type="text"
                                id="openingHours"
                                name="openingHours"
                                value={formData.openingHours}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label} htmlFor="foodType">Food Type</label>
                            <input
                                style={styles.input}
                                type="text"
                                id="foodType"
                                name="foodType"
                                value={formData.foodType}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label} htmlFor="description">Description</label>
                            <textarea
                                style={styles.input}
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                            ></textarea>
                        </div>
                        <button style={loading ? { ...styles.button, ...styles.buttonDisabled } : styles.button} type="submit" disabled={loading}>
                            Next
                        </button>
                    </>
                );
            case 4:
                return (
                    <>
                        <div style={styles.formGroup}>
                            <label style={styles.label} htmlFor="document">Upload Document</label>
                            <input
                                style={styles.input}
                                type="file"
                                id="document"
                                name="document"
                                onChange={handleFileChange}
                                required
                            />
                        </div>
                        <button style={loading ? { ...styles.button, ...styles.buttonDisabled } : styles.button} type="submit" disabled={loading}>
                            Submit
                        </button>
                    </>
                );
            case 5:
                return (
                    <>
                        <div style={{ ...styles.message, ...styles.messageSuccess }}>
                            Your registration is complete! Your account is now under review by an admin.
                        </div>
                        <button style={styles.button} onClick={() => navigate('/')}>
                            Go to Home
                        </button>
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <div style={styles.page}>
            <div style={styles.formContainer}>
                <h1 style={styles.formTitle}>Donor Registration</h1>

                {/* Step Indicator (5 steps now) */}
                <div style={styles.stepIndicator}>
                    <span style={{ ...styles.stepDot, ...(step >= 1 ? styles.stepComplete : {}) }}>1</span>
                    <span style={{ ...styles.stepLine, ...(step >= 2 ? { backgroundColor: '#28a745' } : {}) }}></span>
                    <span style={{ ...styles.stepDot, ...(step >= 2 ? styles.stepComplete : {}) }}>2</span>
                    <span style={{ ...styles.stepLine, ...(step >= 3 ? { backgroundColor: '#28a745' } : {}) }}></span>
                    <span style={{ ...styles.stepDot, ...(step >= 3 ? styles.stepComplete : {}) }}>3</span>
                    <span style={{ ...styles.stepLine, ...(step >= 4 ? { backgroundColor: '#28a745' } : {}) }}></span>
                    <span style={{ ...styles.stepDot, ...(step >= 4 ? styles.stepComplete : {}) }}>4</span>
                    <span style={{ ...styles.stepLine, ...(step >= 5 ? { backgroundColor: '#28a745' } : {}) }}></span>
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
