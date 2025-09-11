import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './components/HomePage';
import DonorRegistrationForm from './components/DonorRegistrationForm';
import NGORegistrationForm from './components/NGORegistrationForm';
import AdminLogin from './components/AdminLogin';
import AdminPanel from './components/AdminPanel';

import DonorDashboard from './components/DonorDashboard';
import NGODashboard from './components/NGODashboard';
import AdminDashboard from './components/AdminDashboard';
import LoginPage from './components/LoginPage';
import FoodTracking from './components/FoodTracking';

const PrivateRoute = ({ children }) => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    return isAuthenticated ? children : <Navigate to="/admin-login" />;
};

const DonorRoute = ({ children }) => {
    const donorToken = localStorage.getItem('donorToken');
    const donorEmail = localStorage.getItem('donorEmail');
    return (donorToken && donorEmail) ? children : <Navigate to="/login" />;
};

const NGORoute = ({ children }) => {
    const ngoToken = localStorage.getItem('ngoToken');
    const ngoEmail = localStorage.getItem('ngoEmail');
    return (ngoToken && ngoEmail) ? children : <Navigate to="/login" />;
};

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/register-donor" element={<DonorRegistrationForm />} />
                <Route path="/register-ngo" element={<NGORegistrationForm />} />
                <Route path="/admin-login" element={<AdminLogin />} />
                <Route path="/login" element={<LoginPage />} />
                <Route
                    path="/admin"
                    element={
                        <PrivateRoute>
                            <AdminPanel />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/donor-dashboard"
                    element={
                        <DonorRoute>
                            <DonorDashboard />
                        </DonorRoute>
                    }
                />
                <Route
                    path="/ngo-dashboard"
                    element={
                        <NGORoute>
                            <NGODashboard />
                        </NGORoute>
                    }
                />
                <Route path="/admin-dashboard" element={<AdminDashboard />} />
                <Route path="/login-page" element={<LoginPage />} />
                <Route path="/foodtracking" element={<FoodTracking />} />
            </Routes>
        </Router>
    );
}

export default App;