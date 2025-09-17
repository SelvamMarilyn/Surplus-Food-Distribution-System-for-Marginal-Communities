import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

/**
 * Professional Admin Panel with modern design and interactive features
 */
export default function AdminPanel() {
    const [donors, setDonors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ text: "", type: "" });
    const [activeView, setActiveView] = useState("dashboard");
    const [ngos, setNgos] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const navigate = useNavigate();

    const BACKEND_URL = "http://localhost:5000";

    // Enhanced menu items with icons and descriptions
    const sidebarMenu = [
        { 
            key: "dashboard", 
            label: "Dashboard", 
            icon: "📊",
            description: "Overview & Statistics"
        },
        { 
            key: "donorApprovals", 
            label: "Donor Approvals", 
            icon: "✅",
            description: "Pending Donor Reviews"
        },
        { 
            key: "allDonors", 
            label: "All Donors", 
            icon: "🍽️",
            description: "Manage All Donors"
        },
        { 
            key: "ngoApprovals", 
            label: "NGO Approvals", 
            icon: "🏢",
            description: "Pending NGO Reviews"
        },
        { 
            key: "allNgos", 
            label: "All NGOs", 
            icon: "🤝",
            description: "Manage All NGOs"
        },
        { 
            key: "reports", 
            label: "Analytics", 
            icon: "📈",
            description: "Reports & Insights"
        },
    ];

    /**
     * Enhanced professional styles with modern design patterns
     */
    const styles = {
        dashboard: {
            display: 'flex',
            minHeight: '100vh',
            fontFamily: "'Cormorant Garamond', serif",
            backgroundColor: '#121212',
            color: '#f7fafc',
        },
        sidebar: {
            width: '280px',
            background: 'linear-gradient(180deg, #ff6b6b 0%, #ee5a24 100%)',
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '4px 0 20px rgba(0,0,0,0.3)',
            position: 'relative',
            overflow: 'hidden',
        },
        sidebarHeader: {
            fontFamily: "'Great Vibes', cursive",
            padding: '2rem 1.5rem',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            textAlign: 'center',
        },
        logoContainer: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            marginBottom: '0.5rem',
        },
        logo: {
            width: '40px',
            height: '40px',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.5rem',
            backdropFilter: 'blur(10px)',
        },
        sidebarTitle: {
            fontSize: '2rem',
            fontWeight: '700',
            margin: '0',
        },
        sidebarSubtitle: {
            fontSize: '1.5rem',
            opacity: '0.8',
            margin: '0',
            fontWeight: '400',
        },
        navigation: {
            flex: '1',
            padding: '1rem 0',
            overflowY: 'auto',
        },
        navItem: {
            display: 'flex',
            alignItems: 'center',
            padding: '0.75rem 1.5rem',
            margin: '0.25rem 1rem',
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden',
            textDecoration: 'none',
            color: 'inherit',
        },
        navItemContent: {
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            flex: '1',
            zIndex: '2',
            position: 'relative',
        },
        navIcon: {
            fontSize: '1.9rem',
            minWidth: '24px',
            textAlign: 'center',
        },
        navText: {
            display: 'flex',
            flexDirection: 'column',
            gap: '0.125rem',
        },
        navLabel: {
            fontSize: '1.2rem',
            fontWeight: '600',
            lineHeight: '1.2',
        },
        navDescription: {
            fontSize: '0.85rem',
            opacity: '0.8',
            fontWeight: '400',
        },
        navItemHover: {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            transform: 'translateX(4px)',
        },
        navActive: {
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            transform: 'translateX(4px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        },
        navActiveIndicator: {
            position: 'absolute',
            left: '0',
            top: '0',
            bottom: '0',
            width: '3px',
            background: '#fff',
            borderRadius: '0 2px 2px 0',
        },
        sidebarFooter: {
            padding: '1.5rem',
            borderTop: '1px solid rgba(255,255,255,0.1)',
        },
        logoutButton: {
            width: '100%',
            padding: '0.75rem 1rem',
            background: 'rgba(255,255,255,0.1)',
            color: '#fff',
            border: '2px solid rgba(255,255,255,0.2)',
            borderRadius: '12px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(10px)',
        },
        logoutButtonHover: {
            background: 'rgba(229, 62, 62, 0.2)',
            borderColor: 'rgba(229, 62, 62, 0.3)',
            transform: 'translateY(-1px)',
        },
        mainContent: {
            flexGrow: '1',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
        },
        topBar: {
            background: 'rgba(15, 15, 15, 0.9)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '1rem 2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
        },
        breadcrumb: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#e2e8f0',
            fontSize: '2rem',
            fontFamily: "'Great Vibes', cursive",
        },
        pageTitle: {
            fontSize: '1.75rem',
            fontWeight: '700',
            color: '#feca57',
            margin: '0',
        },
        searchContainer: {
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
        },
        searchInput: {
            padding: '0.5rem 1rem',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            fontSize: '1rem',
            minWidth: '250px',
            transition: 'all 0.3s ease',
            background: 'rgba(255, 255, 255, 0.1)',
            color: '#f7fafc',
        },
        searchInputFocus: {
            borderColor: '#feca57',
            outline: 'none',
            boxShadow: '0 0 0 3px rgba(254, 202, 87, 0.1)',
        },
        filterSelect: {
            padding: '0.5rem 1rem',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            fontSize: '0.9rem',
            cursor: 'pointer',
            background: 'rgba(255, 255, 255, 0.1)',
            color: '#f7fafc',
        },
        contentArea: {
            flex: '1',
            padding: '2rem',
            overflowY: 'auto',
            background: '#121212',
        },
        statsGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem',
        },
        statCard: {
            background: '#262424',
            borderRadius: '16px',
            padding: '1.5rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden',
        },
        statCardHover: {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
        },
        statIcon: {
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            marginBottom: '1rem',
        },
        statValue: {
            fontSize: '2rem',
            fontWeight: '700',
            margin: '0 0 0.25rem 0',
            color: '#feca57',
        },
        statLabel: {
            fontSize: '1rem',
            color: '#e2e8f0',
            margin: '0',
            fontWeight: '500',
        },
        statTrend: {
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            fontSize: '1rem',
            fontWeight: '600',
            padding: '0.25rem 0.5rem',
            borderRadius: '12px',
        },
        trendPositive: {
            background: 'rgba(34, 197, 94, 0.1)',
            color: '#16a34a',
        },
        trendNeutral: {
            background: 'rgba(156, 163, 175, 0.1)',
            color: '#6b7280',
        },
        card: {
            background: '#262424',
            borderRadius: '16px',
            padding: '1.5rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
        },
        cardHeader: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid #f1f5f9',
        },
        cardTitle: {
            fontSize: '1.25rem',
            fontWeight: '700',
            color: '#feca57',
            margin: '0',
        },
        tableContainer: {
            overflowX: 'auto',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
        },
        table: {
            width: '100%',
            borderCollapse: 'collapse',
            background: '#262424',
        },
        tableHeader: {
            background: 'rgba(255, 107, 107, 0.1)',
            borderBottom: '2px solid rgba(255, 255, 255, 0.1)',
        },
        th: {
            padding: '1rem 1.5rem',
            textAlign: 'left',
            fontSize: '0.85rem',
            fontWeight: '700',
            color: '#feca57',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
        },
        td: {
            padding: '1rem 1.5rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            fontSize: '0.9rem',
            color: '#e2e8f0',
        },
        tableRow: {
            transition: 'all 0.2s ease',
        },
        tableRowHover: {
            backgroundColor: 'rgba(255, 107, 107, 0.05)',
        },
        badge: {
            padding: '0.25rem 0.75rem',
            borderRadius: '12px',
            fontSize: '0.75rem',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.025em',
        },
        badgeApproved: {
            background: 'rgba(34, 197, 94, 0.1)',
            color: '#16a34a',
        },
        badgeRejected: {
            background: 'rgba(239, 68, 68, 0.1)',
            color: '#dc2626',
        },
        badgePending: {
            background: 'rgba(245, 158, 11, 0.1)',
            color: '#d97706',
        },
        badgeBlocked: {
            background: 'rgba(156, 163, 175, 0.1)',
            color: '#6b7280',
        },
        actionButton: {
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            border: 'none',
            fontSize: '0.8rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            marginRight: '0.5rem',
        },
        approveButton: {
            background: '#16a34a',
            color: '#fff',
        },
        rejectButton: {
            background: '#dc2626',
            color: '#fff',
        },
        blockButton: {
            background: '#f59e0b',
            color: '#fff',
        },
        deleteButton: {
            background: '#ef4444',
            color: '#fff',
        },
        unblockButton: {
            background: '#10b981',
            color: '#fff',
        },
        viewButton: {
            background: '#3b82f6',
            color: '#fff',
        },
        messageAlert: {
            padding: '1rem 1.5rem',
            borderRadius: '12px',
            marginBottom: '1.5rem',
            fontSize: '0.9rem',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
        },
        messageSuccess: {
            background: 'rgba(34, 197, 94, 0.1)',
            color: '#16a34a',
            border: '1px solid rgba(34, 197, 94, 0.2)',
        },
        messageError: {
            background: 'rgba(239, 68, 68, 0.1)',
            color: '#dc2626',
            border: '1px solid rgba(239, 68, 68, 0.2)',
        },
        loadingContainer: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '3rem',
            color: '#64748b',
        },
        loadingSpinner: {
            width: '32px',
            height: '32px',
            border: '3px solid #e2e8f0',
            borderTop: '3px solid #667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginRight: '1rem',
        },
        emptyState: {
            textAlign: 'center',
            padding: '3rem',
            color: '#e2e8f0',
        },
        emptyStateIcon: {
            fontSize: '3rem',
            marginBottom: '1rem',
            opacity: '0.5',
        },
        emptyStateText: {
            fontSize: '1.1rem',
            fontWeight: '500',
            color: '#feca57',
        },
    };

    // Add keyframes for loading spinner
    const spinKeyframes = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;

    const fetchDonors = async () => {
        try {
            setLoading(true);
            const endpoint = activeView === "allDonors" 
                ? `${BACKEND_URL}/api/admin/all-donors`
                : `${BACKEND_URL}/api/admin/donors`;
            const res = await axios.get(endpoint);
            setDonors(res.data);
        } catch (error) {
            setMessage({ text: "Failed to retrieve donors.", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    const fetchNgos = async () => {
        try {
            const res = await axios.get(`${BACKEND_URL}/api/admin/ngos`);
            setNgos(res.data);
        } catch (err) {
            setMessage({ text: "Failed to fetch NGOs", type: "error" });
        }
    };

    useEffect(() => {
        const isAuthenticated = localStorage.getItem("isAuthenticated");
        if (!isAuthenticated) {
            navigate("/admin-login");
        } else {
            // Always fetch data when component mounts or view changes
            fetchDonors();
            fetchNgos();
        }
    }, [activeView, navigate]);

    const handleAction = async (id, action) => {
        try {
            let url, method;
            if (action === "delete") {
                url = `${BACKEND_URL}/api/admin/delete-donor/${id}`;
                method = "delete";
            } else if (action === "block") {
                url = `${BACKEND_URL}/api/admin/block-donor/${id}`;
                method = "post";
            } else if (action === "unblock") {
                url = `${BACKEND_URL}/api/admin/unblock-donor/${id}`;
                method = "post";
            } else {
                url = `${BACKEND_URL}/api/admin/${action}-donor/${id}`;
                method = "post";
            }

            const res = await axios({ method, url });
            setMessage({ text: res.data.message, type: "success" });
            fetchDonors();
        } catch (error) {
            setMessage({
                text: error.response?.data?.message || `Failed to ${action} donor.`,
                type: "error",
            });
        }
    };

    const handleNgoAction = async (id, action) => {
        try {
            let url = `${BACKEND_URL}/api/admin/${action}-ngo/${id}`;
            let method = (action === 'delete') ? 'delete' : 'post';
            const res = await axios({ method, url });
            setMessage({ text: res.data.message, type: 'success' });
            fetchNgos();
        } catch (err) {
            setMessage({ text: err.response?.data?.message || 'Failed', type: 'error' });
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("isAuthenticated");
        navigate("/");
    };

    const getStats = () => {
        return {
            totalDonors: donors.length,
            approvedDonors: donors.filter(d => d.status === 'Approved').length,
            pendingDonors: donors.filter(d => d.status === 'Under Review').length,
            totalNgos: ngos.length,
            approvedNgos: ngos.filter(n => n.status === 'Approved').length,
            pendingNgos: ngos.filter(n => n.status === 'Under Review').length,
        };
    };

    const renderDashboard = () => {
        const stats = getStats();
        return (
            <div>
                <div style={styles.statsGrid}>
                    <div style={styles.statCard}>
                        <div style={{...styles.statIcon, background: 'rgba(59, 130, 246, 0.1)'}}>
                            🍽️
                        </div>
                        <div style={styles.statValue}>{stats.totalDonors}</div>
                        <div style={styles.statLabel}>Total Donors</div>
                        <div style={{...styles.statTrend, ...styles.trendPositive}}>
                            +12%
                        </div>
                    </div>
                    
                    <div style={styles.statCard}>
                        <div style={{...styles.statIcon, background: 'rgba(34, 197, 94, 0.1)'}}>
                            ✅
                        </div>
                        <div style={styles.statValue}>{stats.approvedDonors}</div>
                        <div style={styles.statLabel}>Approved Donors</div>
                        <div style={{...styles.statTrend, ...styles.trendPositive}}>
                            +8%
                        </div>
                    </div>

                    <div style={styles.statCard}>
                        <div style={{...styles.statIcon, background: 'rgba(245, 158, 11, 0.1)'}}>
                            ⏳
                        </div>
                        <div style={styles.statValue}>{stats.pendingDonors}</div>
                        <div style={styles.statLabel}>Pending Reviews</div>
                        <div style={{...styles.statTrend, ...styles.trendNeutral}}>
                            {stats.pendingDonors > 0 ? 'Action Needed' : 'All Clear'}
                        </div>
                    </div>

                    <div style={styles.statCard}>
                        <div style={{...styles.statIcon, background: 'rgba(168, 85, 247, 0.1)'}}>
                            🤝
                        </div>
                        <div style={styles.statValue}>{stats.totalNgos}</div>
                        <div style={styles.statLabel}>Total NGOs</div>
                        <div style={{...styles.statTrend, ...styles.trendPositive}}>
                            +5%
                        </div>
                    </div>
                </div>

                <div style={styles.card}>
                    <div style={styles.cardHeader}>
                        <h3 style={styles.cardTitle}>Quick Actions</h3>
                    </div>
                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem'}}>
                        <button 
                            style={{...styles.actionButton, ...styles.viewButton, padding: '1rem'}}
                            onClick={() => setActiveView('donorApprovals')}
                        >
                            📋 Review Donors ({stats.pendingDonors})
                        </button>
                        <button 
                            style={{...styles.actionButton, ...styles.viewButton, padding: '1rem'}}
                            onClick={() => setActiveView('ngoApprovals')}
                        >
                            🏢 Review NGOs ({stats.pendingNgos})
                        </button>
                        <button 
                            style={{...styles.actionButton, ...styles.viewButton, padding: '1rem'}}
                            onClick={() => setActiveView('reports')}
                        >
                            📊 View Analytics
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderTable = (data, type) => {
        const filteredData = data.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                item.email.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesFilter = filterStatus === 'all' || item.status.toLowerCase() === filterStatus.toLowerCase();
            return matchesSearch && matchesFilter;
        });

        return (
            <div style={styles.tableContainer}>
                <table style={styles.table}>
                    <thead style={styles.tableHeader}>
                        <tr>
                            <th style={styles.th}>ID</th>
                            <th style={styles.th}>Name</th>
                            <th style={styles.th}>Email</th>
                            <th style={styles.th}>Phone</th>
                            <th style={styles.th}>Address</th>
                            {type === 'donor' ? (
                                <>
                                    <th style={styles.th}>Restaurant</th>
                                    <th style={styles.th}>Branch</th>
                                    <th style={styles.th}>Food Type</th>
                                </>
                            ) : (
                                <th style={styles.th}>Registration #</th>
                            )}
                            <th style={styles.th}>Status</th>
                            <th style={styles.th}>Created</th>
                            <th style={styles.th}>Document</th>
                            <th style={styles.th}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.map((item) => (
                            <tr key={item.id} style={styles.tableRow}>
                                <td style={styles.td}>{item.id}</td>
                                <td style={styles.td}>{item.name}</td>
                                <td style={styles.td}>{item.email}</td>
                                <td style={styles.td}>{item.phone || '-'}</td>
                                <td style={styles.td}>{item.address ? (item.address.length > 30 ? item.address.substring(0, 30) + '...' : item.address) : '-'}</td>
                                {type === 'donor' ? (
                                    <>
                                        <td style={styles.td}>{item.restaurant_name || '-'}</td>
                                        <td style={styles.td}>{item.branch_name || '-'}</td>
                                        <td style={styles.td}>{item.food_type || '-'}</td>
                                    </>
                                ) : (
                                    <td style={styles.td}>{item.registration_number || '-'}</td>
                                )}
                                <td style={styles.td}>
                                    <span style={{
                                        ...styles.badge,
                                        ...(item.status === 'Approved' ? styles.badgeApproved :
                                            item.status === 'Rejected' ? styles.badgeRejected :
                                            item.status === 'Blocked' ? styles.badgeBlocked :
                                            styles.badgePending)
                                    }}>
                                        {item.status}
                                    </span>
                                </td>
                                <td style={styles.td}>{item.created_at ? new Date(item.created_at).toLocaleDateString() : '-'}</td>
                                <td style={styles.td}>
                                    {item.document_path ? (
                                        <a
                                            href={`${BACKEND_URL}/uploads/${type === 'ngo' ? 'ngo_docs/' : ''}${item.document_path}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{color: '#3b82f6', textDecoration: 'none', fontWeight: '500'}}
                                        >
                                            📄 View
                                        </a>
                                    ) : (
                                        <span style={{color: '#9ca3af'}}>No document</span>
                                    )}
                                </td>
                                <td style={styles.td}>
                                    {item.status === 'Under Review' ? (
                                        <div>
                                            <button
                                                style={{...styles.actionButton, ...styles.approveButton}}
                                                onClick={() => type === 'ngo' ? handleNgoAction(item.id, 'approve') : handleAction(item.id, 'approve')}
                                            >
                                                Approve
                                            </button>
                                            <button
                                                style={{...styles.actionButton, ...styles.rejectButton}}
                                                onClick={() => type === 'ngo' ? handleNgoAction(item.id, 'reject') : handleAction(item.id, 'reject')}
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    ) : item.status === 'Approved' ? (
                                        <div>
                                            <button
                                                style={{...styles.actionButton, ...styles.blockButton}}
                                                onClick={() => type === 'ngo' ? handleNgoAction(item.id, 'block') : handleAction(item.id, 'block')}
                                            >
                                                Block
                                            </button>
                                            <button
                                                style={{...styles.actionButton, ...styles.deleteButton}}
                                                onClick={() => type === 'ngo' ? handleNgoAction(item.id, 'delete') : handleAction(item.id, 'delete')}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    ) : item.status === 'Blocked' ? (
                                        <button
                                            style={{...styles.actionButton, ...styles.unblockButton}}
                                            onClick={() => type === 'ngo' ? handleNgoAction(item.id, 'unblock') : handleAction(item.id, 'unblock')}
                                        >
                                            Unblock
                                        </button>
                                    ) : (
                                        <span style={{color: '#6b7280'}}>No actions</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    const renderContent = () => {
        if (loading) {
            return (
                <div style={styles.loadingContainer}>
                    <div style={styles.loadingSpinner}></div>
                    <span>Loading...</span>
                </div>
            );
        }

        switch (activeView) {
            case "dashboard":
                return renderDashboard();
            case "donorApprovals":
                const pendingDonors = donors.filter(d => d.status === "Under Review");
                return pendingDonors.length > 0 ? renderTable(pendingDonors, 'donor') : (
                    <div style={styles.emptyState}>
                        <div style={styles.emptyStateIcon}>✅</div>
                        <div style={styles.emptyStateText}>No pending donor approvals</div>
                    </div>
                );
            case "allDonors":
                return donors.length > 0 ? renderTable(donors, 'donor') : (
                    <div style={styles.emptyState}>
                        <div style={styles.emptyStateIcon}>🍽️</div>
                        <div style={styles.emptyStateText}>No donors found</div>
                    </div>
                );
            case "ngoApprovals":
                const pendingNgos = ngos.filter(n => n.status === "Under Review");
                return pendingNgos.length > 0 ? renderTable(pendingNgos, 'ngo') : (
                    <div style={styles.emptyState}>
                        <div style={styles.emptyStateIcon}>🏢</div>
                        <div style={styles.emptyStateText}>No pending NGO approvals</div>
                    </div>
                );
            case "allNgos":
                return ngos.length > 0 ? renderTable(ngos, 'ngo') : (
                    <div style={styles.emptyState}>
                        <div style={styles.emptyStateIcon}>🤝</div>
                        <div style={styles.emptyStateText}>No NGOs found</div>
                    </div>
                );
            case "reports":
                const stats = getStats();
                return (
                    <div>
                        <div style={styles.statsGrid}>
                            <div style={styles.statCard}>
                                <div style={{...styles.statIcon, background: 'rgba(34, 197, 94, 0.1)'}}>
                                    ✅
                                </div>
                                <div style={styles.statValue}>{stats.approvedDonors}</div>
                                <div style={styles.statLabel}>Approved Donors</div>
                            </div>
                            <div style={styles.statCard}>
                                <div style={{...styles.statIcon, background: 'rgba(239, 68, 68, 0.1)'}}>
                                    ❌
                                </div>
                                <div style={styles.statValue}>{donors.filter(d => d.status === 'Rejected').length}</div>
                                <div style={styles.statLabel}>Rejected Donors</div>
                            </div>
                            <div style={styles.statCard}>
                                <div style={{...styles.statIcon, background: 'rgba(245, 158, 11, 0.1)'}}>
                                    ⏳
                                </div>
                                <div style={styles.statValue}>{stats.pendingDonors}</div>
                                <div style={styles.statLabel}>Pending Donors</div>
                            </div>
                            <div style={styles.statCard}>
                                <div style={{...styles.statIcon, background: 'rgba(168, 85, 247, 0.1)'}}>
                                    🏢
                                </div>
                                <div style={styles.statValue}>{stats.approvedNgos}</div>
                                <div style={styles.statLabel}>Approved NGOs</div>
                            </div>
                            <div style={styles.statCard}>
                                <div style={{...styles.statIcon, background: 'rgba(156, 163, 175, 0.1)'}}>
                                    ❌
                                </div>
                                <div style={styles.statValue}>{ngos.filter(n => n.status === 'Rejected').length}</div>
                                <div style={styles.statLabel}>Rejected NGOs</div>
                            </div>
                            <div style={styles.statCard}>
                                <div style={{...styles.statIcon, background: 'rgba(245, 158, 11, 0.1)'}}>
                                    ⏳
                                </div>
                                <div style={styles.statValue}>{stats.pendingNgos}</div>
                                <div style={styles.statLabel}>Pending NGOs</div>
                            </div>
                        </div>

                        <div style={styles.card}>
                            <div style={styles.cardHeader}>
                                <h3 style={styles.cardTitle}>System Overview</h3>
                            </div>
                            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem'}}>
                                <div style={{padding: '1.5rem', background: '#f8fafc', borderRadius: '12px'}}>
                                    <h4 style={{margin: '0 0 1rem 0', color: '#1e293b'}}>Monthly Growth</h4>
                                    <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
                                        <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                            <span>New Donors</span>
                                            <span style={{color: '#16a34a', fontWeight: '600'}}>+12%</span>
                                        </div>
                                        <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                            <span>New NGOs</span>
                                            <span style={{color: '#16a34a', fontWeight: '600'}}>+8%</span>
                                        </div>
                                        <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                            <span>Total Registrations</span>
                                            <span style={{color: '#16a34a', fontWeight: '600'}}>+15%</span>
                                        </div>
                                    </div>
                                </div>
                                <div style={{padding: '1.5rem', background: '#f8fafc', borderRadius: '12px'}}>
                                    <h4 style={{margin: '0 0 1rem 0', color: '#1e293b'}}>Popular Areas</h4>
                                    <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
                                        <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                            <span>East Gate</span>
                                            <span style={{fontWeight: '600'}}>45 deliveries</span>
                                        </div>
                                        <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                            <span>North Block</span>
                                            <span style={{fontWeight: '600'}}>32 deliveries</span>
                                        </div>
                                        <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                            <span>West Side</span>
                                            <span style={{fontWeight: '600'}}>18 deliveries</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            default:
                return renderDashboard();
        }
    };

    return (
        <>
            <style>{spinKeyframes}</style>
            <div style={styles.dashboard}>
                {/* Enhanced Sidebar */}
                <aside style={styles.sidebar}>
                    <div style={styles.sidebarHeader}>
                        <div style={styles.logoContainer}>
                            <div style={styles.logo}>🍽️</div>
                        </div>
                        <h2 style={styles.sidebarTitle}>Admin Panel</h2>
                        <p style={styles.sidebarSubtitle}>Food Donation Platform</p>
                    </div>

                    <nav style={styles.navigation}>
                        {sidebarMenu.map((item) => (
                            <div
                                key={item.key}
                                onClick={() => setActiveView(item.key)}
                                style={{
                                    ...styles.navItem,
                                    ...(activeView === item.key ? styles.navActive : {}),
                                }}
                                onMouseEnter={(e) => {
                                    if (activeView !== item.key) {
                                        Object.assign(e.currentTarget.style, styles.navItemHover);
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (activeView !== item.key) {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                        e.currentTarget.style.transform = 'translateX(0)';
                                    }
                                }}
                            >
                                {activeView === item.key && <div style={styles.navActiveIndicator}></div>}
                                <div style={styles.navItemContent}>
                                    <div style={styles.navIcon}>{item.icon}</div>
                                    <div style={styles.navText}>
                                        <div style={styles.navLabel}>{item.label}</div>
                                        <div style={styles.navDescription}>{item.description}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </nav>

                    <div style={styles.sidebarFooter}>
                        <button
                            onClick={handleLogout}
                            style={styles.logoutButton}
                            onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.logoutButtonHover)}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            🚪 Logout
                        </button>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main style={styles.mainContent}>
                    {/* Top Bar */}
                    <div style={styles.topBar}>
                        <div>
                            <div style={styles.breadcrumb}>
                                <span>Admin</span>
                                <span>•</span>
                                <span>{sidebarMenu.find(item => item.key === activeView)?.label}</span>
                            </div>
                            
                        </div>

                        {/* Search and Filter Controls */}
                        {(activeView.includes('Donors') || activeView.includes('Ngos')) && (
                            <div style={styles.searchContainer}>
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={styles.searchInput}
                                    onFocus={(e) => Object.assign(e.target.style, styles.searchInputFocus)}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                />
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    style={styles.filterSelect}
                                >
                                    <option value="all" style={{background: '#262424', color: '#f7fafc'}}>All Status</option>
                                    <option value="approved" style={{background: '#262424', color: '#f7fafc'}}>Approved</option>
                                    <option value="under review" style={{background: '#262424', color: '#f7fafc'}}>Pending</option>
                                    <option value="rejected" style={{background: '#262424', color: '#f7fafc'}}>Rejected</option>
                                    <option value="blocked" style={{background: '#262424', color: '#f7fafc'}}>Blocked</option>
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Content Area */}
                    <div style={styles.contentArea}>
                        {message.text && (
                            <div style={{
                                ...styles.messageAlert,
                                ...(message.type === 'success' ? styles.messageSuccess : styles.messageError)
                            }}>
                                <span>{message.type === 'success' ? '✅' : '❌'}</span>
                                {message.text}
                            </div>
                        )}
                        {renderContent()}
                    </div>
                </main>
            </div>
        </>
    );
}