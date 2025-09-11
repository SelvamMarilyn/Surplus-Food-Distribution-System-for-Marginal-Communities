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
    };

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
            navigate('/admin');
        } catch (error) {
            console.error('Login error:', error);
            setMessage({ text: error.response?.data?.message || 'Login failed. Please try again.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.page}>
            <div style={styles.formContainer}>
                <h1 style={styles.formTitle}>Admin Login</h1>
                <form onSubmit={handleSubmit}>
                    <div style={styles.formGroup}>
                        <label style={styles.label} htmlFor="username">Username</label>
                        <input
                            style={styles.input}
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
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
                    <button style={loading ? { ...styles.button, ...styles.buttonDisabled } : styles.button} type="submit" disabled={loading}>
                        Log In
                    </button>
                </form>
                {message.text && (
                    <div style={message.type === 'success' ? { ...styles.message, ...styles.messageSuccess } : { ...styles.message, ...styles.messageError }}>
                        {message.text}
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminLogin;
