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

    const BACKEND = 'http://localhost:5000/api/ngo';

    const styles = {
        page: { fontFamily: 'Poppins, sans-serif', backgroundColor: '#e8f2f0', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' },
        container: { background: '#fff', padding: '2.5rem', borderRadius: '12px', width: '100%', maxWidth: '520px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' },
        input: { width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '1rem' },
        button: { width: '100%', padding: '0.75rem', borderRadius: '8px', background: '#28a745', color: '#fff', border: 'none', fontWeight: '700' },
        message: { padding: '1rem', borderRadius: '8px', marginTop: '1rem' },
        success: { background: '#d4edda', color: '#155724' },
        error: { background: '#f8d7da', color: '#721c24' }
    };

    const handleChange = e => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFile = (e) => {
        const file = e.target.files[0];
        console.log("Selected file:", file);  // ✅ check if it’s real
        setFormData((prev) => ({ ...prev, document: file }));
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
                const res = await axios.post(`${BACKEND}/update-profile`, {
                    email: formData.email,
                    registrationNumber: formData.registrationNumber,
                    address: formData.address,
                    phone: formData.phone
                });
                setMessage({ text: res.data.message, type: 'success' });
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
            return <>
                <input name="name" placeholder="Organization / NGO Name" style={styles.input} value={formData.name} onChange={handleChange} required />
                <input name="email" placeholder="Email" style={styles.input} value={formData.email} onChange={handleChange} type="email" required />
                <input name="password" placeholder="Password" style={styles.input} value={formData.password} onChange={handleChange} type="password" required />
                <input name="confirmPassword" placeholder="Confirm Password" style={styles.input} value={formData.confirmPassword} onChange={handleChange} type="password" required />
                <button style={styles.button} type="submit" disabled={loading}>Register</button>
            </>;
        } else if (step === 2) {
            return <>
                <input name="otp" placeholder="Enter OTP" style={styles.input} value={formData.otp} onChange={handleChange} required />
                <button style={styles.button} type="submit" disabled={loading}>Verify Email</button>
            </>;
        } else if (step === 3) {
            return <>
                <input name="registrationNumber" placeholder="Registration number (if any)" style={styles.input} value={formData.registrationNumber} onChange={handleChange} />
                <input name="address" placeholder="Address" style={styles.input} value={formData.address} onChange={handleChange} />
                <input name="phone" placeholder="Phone" style={styles.input} value={formData.phone} onChange={handleChange} />
                <button style={styles.button} type="submit" disabled={loading}>Save Details</button>
            </>;
        } else if (step === 4) {
            return (
                <>
                    <input
                        name="document"
                        type="file"
                        style={styles.input}
                        onChange={handleFile}
                        required
                    />
                    <button style={styles.button} type="submit" disabled={loading}>
                        Upload Document
                    </button>
                </>
            );
        } else if (step === 5) {
            return <>
                <div style={{ ...styles.message, ...styles.success }}>Registration complete. Your NGO is under admin review.</div>
                <button style={styles.button} onClick={() => navigate('/')}>Go Home</button>
            </>;
        }
    };

    return (
        <div style={styles.page}>
            <div style={styles.container}>
                <h2 style={{ marginBottom: '1rem' }}>NGO Registration</h2>
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
