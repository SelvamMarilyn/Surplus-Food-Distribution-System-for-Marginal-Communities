import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

/**
 * The main AdminPanel component that renders a professional dashboard
 * to manage donor applications and view analytics.
 */
export default function AdminPanel() {
    // State to hold the list of donors fetched from the backend.
    const [donors, setDonors] = useState([]);
    // State to manage the loading status of the data.
    const [loading, setLoading] = useState(true);
    // State to display user feedback messages.
    const [message, setMessage] = useState({ text: "", type: "" });
    // State to manage the active view in the dashboard (e.g., approvals, reports).
    const [activeView, setActiveView] = useState("donorApprovals");
    const [ngos, setNgos] = useState([]); 
    // React Router hook for programmatic navigation.
    const navigate = useNavigate();

    // Base URL for the backend server to construct correct file paths.
    const BACKEND_URL = "http://localhost:5000";

    // Menu items for the sidebar.
    const sidebarMenu = [
        { key: "donorApprovals", label: "Donor Approvals" },
        { key: "allDonors", label: "All Donors" },
        { key: "ngoApprovals", label: "NGO Approvals" },
        { key: "allNgos", label: "All NGOs" },
        { key: "reports", label: "Reports & Analytics" },
    ];

    /**
     * Styles object for all CSS-in-JS styling, providing a cohesive and professional look.
     */
    const styles = {
        dashboard: {
            display: 'flex',
            minHeight: '100vh',
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            backgroundColor: '#f8f9fa',
        },
        sidebar: {
            width: '240px',
            backgroundColor: '#2c3e50',
            color: '#ecf0f1',
            padding: '2rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
        },
        sidebarTitle: {
            fontSize: '1.5rem',
            fontWeight: 'bold',
            marginBottom: '2rem',
            textAlign: 'center',
            color: '#fff',
        },
        navItem: {
            padding: '0.75rem 1rem',
            marginBottom: '0.5rem',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'background-color 0.2s, color 0.2s',
            fontWeight: '500',
        },
        navItemHover: {
            backgroundColor: '#34495e',
            color: '#fff',
        },
        navActive: {
            backgroundColor: '#3498db',
            color: '#fff',
            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
        },
        mainContent: {
            flexGrow: '1',
            padding: '2rem',
            overflowY: 'auto',
        },
        contentTitle: {
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: '#34495e',
            marginBottom: '1.5rem',
        },
        messageBox: {
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            fontWeight: '600',
            textAlign: 'center',
        },
        messageSuccess: {
            backgroundColor: '#d4edda',
            color: '#155724',
        },
        messageError: {
            backgroundColor: '#f8d7da',
            color: '#721c24',
        },
        tableContainer: {
            overflowX: 'auto',
        },
        table: {
            width: '100%',
            borderCollapse: 'collapse',
            backgroundColor: '#fff',
            borderRadius: '10px',
            boxShadow: '0 5px 15px rgba(0,0,0,0.08)',
        },
        th: {
            textAlign: 'left',
            padding: '1rem 1.5rem',
            backgroundColor: '#ecf0f1',
            color: '#7f8c8d',
            textTransform: 'uppercase',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            letterSpacing: '0.05em',
        },
        td: {
            padding: '1rem 1.5rem',
            borderBottom: '1px solid #e0e6ed',
            color: '#34495e',
            fontSize: '0.9rem',
        },
        actionButtonContainer: {
            display: 'flex',
            gap: '0.5rem',
        },
        actionButton: {
            padding: '0.5rem 1rem',
            borderRadius: '999px',
            border: 'none',
            color: '#fff',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background-color 0.2s, box-shadow 0.2s',
            fontSize: '0.8rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        },
        approveButton: {
            backgroundColor: '#2ecc71',
        },
        approveButtonHover: {
            backgroundColor: '#27ae60',
        },
        rejectButton: {
            backgroundColor: '#e74c3c',
        },
        rejectButtonHover: {
            backgroundColor: '#c0392b',
        },
        btn: {
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            border: 'none',
            color: '#fff',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
        },
        statusBadge: {
            padding: '0.25rem 0.75rem',
            borderRadius: '999px',
            fontSize: '0.75rem',
            fontWeight: 'bold',
        },
        statusApproved: {
            backgroundColor: '#d4edda',
            color: '#155724',
        },
        statusRejected: {
            backgroundColor: '#f8d7da',
            color: '#721c24',
        },
        statusPending: {
            backgroundColor: '#fff3cd',
            color: '#856404',
        },
    };

    /**
     * Fetches donors from the backend based on the active view.
     */
    const fetchDonors = async () => {
        try {
            setLoading(true);
            const endpoint =
                activeView === "allDonors"
                    ? `${BACKEND_URL}/api/admin/all-donors`
                    : `${BACKEND_URL}/api/admin/donors`;
            const res = await axios.get(endpoint);
            setDonors(res.data);
            setLoading(false);
        } catch (error) {
            setMessage({ text: "Failed to retrieve donors.", type: "error" });
            setLoading(false);
        }
    };

    /**
     * Effect hook to fetch donors whenever the active view changes.
     */
    useEffect(() => {
        const isAuthenticated = localStorage.getItem("isAuthenticated");
        if (!isAuthenticated) {
            navigate("/admin-login");
        } else {
            fetchDonors();
            if (activeView === "ngoApprovals" || activeView === "allNgos") {
                fetchNgos();
            }
        }
    }, [activeView, navigate]);

    /**
     * Handles the action to approve or reject a donor.
     * @param {string} id - The ID of the donor to act on.
     * @param {string} action - The action to perform ('approve' or 'reject').
     */
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
        }else {
        url = `${BACKEND_URL}/api/admin/${action}-donor/${id}`;
        method = "post";
        }

        const res = await axios({ method, url });
        setMessage({ text: res.data.message, type: "success" });
        fetchDonors();
    } catch (error) {
        console.error(`Failed to ${action} donor:`, error);
        setMessage({
        text: error.response?.data?.message || `Failed to ${action} donor.`,
        type: "error",
        });
    }
    };
    const fetchNgos = async () => {
    try {
        const res = await axios.get(`${BACKEND_URL}/api/admin/ngos`);
        setNgos(res.data); // you'll need a new state: const [ngos,setNgos]=useState([]);
    } catch (err) { console.error("Failed to fetch NGOs:", err);
    setMessage({
      text: "Failed to fetch NGOs",
      type: "error",
    }); }
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


    /**
     * Logs the user out by removing the authentication token and navigating to the login page.
     */
    const handleLogout = () => {
        localStorage.removeItem("isAuthenticated");
        navigate("/admin-login");
    };

    /**
     * Renders the content for the currently active view.
     */
    const renderContent = () => {
        if (loading) {
            return <div style={{ textAlign: 'center', padding: '2rem', color: '#7f8c8d' }}>Loading...</div>;
        }

        switch (activeView) {
            case "donorApprovals":
                const pendingDonors = donors.filter((d) => d.status === "Under Review");
                return (
                    <div style={styles.tableContainer}>
                        <table style={styles.table}>
                            <thead style={styles.thead}>
                                <tr>
                                    <th style={styles.th}>ID</th>
                                    <th style={styles.th}>Name</th>
                                    <th style={styles.th}>Email</th>
                                    {/* <th style={styles.th}>Documents</th> */}
                                    <th style={styles.th}>Restaurant</th>
                                    <th style={styles.th}>Branch</th>
                                    <th style={styles.th}>Address</th>
                                    <th style={styles.th}>Phone</th>
                                    <th style={styles.th}>Opening Hours</th>
                                    <th style={styles.th}>Food Type</th>
                                    <th style={styles.th}>Description</th>
                                    <th style={styles.th}>Email Verified</th>
                                    <th style={styles.th}>Document</th>
                                    <th style={styles.th}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingDonors.length > 0 ? (
                                    pendingDonors.map((donor) => (
                                        <tr key={donor.id} style={{ transition: 'background-color 0.15s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}>
                                            <td style={styles.td}>{donor.id}</td>
                                            <td style={styles.td}>{donor.name}</td>
                                            <td style={styles.td}>{donor.email}</td>
                                            <td style={styles.td}>{donor.restaurant_name || "N/A"}</td>
                                            <td style={styles.td}>{donor.branch_name || "N/A"}</td>
                                            <td style={styles.td}>{donor.address || "N/A"}</td>
                                            <td style={styles.td}>{donor.phone || "N/A"}</td>
                                            <td style={styles.td}>{donor.opening_hours || "N/A"}</td>
                                            <td style={styles.td}>{donor.food_type || "N/A"}</td>
                                            <td style={styles.td}>{donor.description || "N/A"}</td>
                                            <td style={styles.td}>{donor.is_email_verified ? "Yes" : "No"}</td>
                                            <td style={styles.td}>
                                                {donor.document_path ? (
                                                    <a
                                                        href={`${BACKEND_URL}/uploads/${donor.document_path}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{ color: '#3498db', fontWeight: 'bold', textDecoration: 'none' }}
                                                    >
                                                        View Document
                                                    </a>
                                                ) : (
                                                    <span style={{ color: '#999' }}>No document</span>
                                                )}
                                            </td>
                                            <td style={styles.td}>
                                                <div style={styles.actionButtonContainer}>
                                                    <button
                                                        onClick={() => handleAction(donor.id, 'approve')}
                                                        style={styles.approveButton}
                                                        onMouseOver={(e) => Object.assign(e.currentTarget.style, styles.approveButtonHover)}
                                                        onMouseOut={(e) => Object.assign(e.currentTarget.style, styles.approveButton)}
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleAction(donor.id, 'reject')}
                                                        style={styles.rejectButton}
                                                        onMouseOver={(e) => Object.assign(e.currentTarget.style, styles.rejectButtonHover)}
                                                        onMouseOut={(e) => Object.assign(e.currentTarget.style, styles.rejectButton)}
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#7f8c8d' }}>No pending donor applications.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                );
            case "allDonors":
                return (
                    <div style={styles.tableContainer}>
                        <table style={styles.table}>
                            <thead style={styles.thead}>
                                <tr>
                                    <th style={styles.th}>ID</th>
                                    <th style={styles.th}>Name</th>
                                    <th style={styles.th}>Email</th>
                                    <th style={styles.th}>Restaurant</th>
                                    <th style={styles.th}>Branch</th>
                                    <th style={styles.th}>Phone</th>
                                    <th style={styles.th}>Food Type</th>
                                    <th style={styles.th}>View Document</th>
                                    <th style={styles.th}>Status</th>
                                    <th style={styles.th}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {donors.length > 0 ? (
                                    donors.map((donor) => (
                                        <tr key={donor.id} style={{ transition: 'background-color 0.15s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}>
                                            <td style={styles.td}>{donor.id}</td>
                                            <td style={styles.td}>{donor.name}</td>
                                            <td style={styles.td}>{donor.email}</td>
                                            <td style={styles.td}>{donor.restaurant_name || "N/A"}</td>
                                            <td style={styles.td}>{donor.branch_name || "N/A"}</td>
                                            <td style={styles.td}>{donor.phone || "N/A"}</td>
                                          <td style={styles.td}>{donor.food_type || "N/A"}</td>
                                          <td style={styles.td}>
                                                {donor.document_path ? (
                                                    <a
                                                        href={`${BACKEND_URL}/uploads/${donor.document_path}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{ color: '#3498db', fontWeight: 'bold', textDecoration: 'none' }}
                                                    >
                                                        View Document
                                                    </a>
                                                ) : (
                                                    <span style={{ color: '#999' }}>No document</span>
                                                )}
                                            </td>
                                            <td style={styles.td}>
                                                <span style={{
                                                    ...styles.statusBadge,
                                                    ...(donor.status === 'Approved' ? styles.statusApproved : donor.status === 'Rejected' ? styles.statusRejected : styles.statusPending)
                                                }}>
                                                    {donor.status}
                                                </span>
                                            </td>
                                            <td style={styles.td}>
                                                {donor.status === "Approved" ? (
                                                    <div style={{ display: "flex", gap: "0.5rem" }}>
                                                    <button
                                                        onClick={() => handleAction(donor.id, "block")}
                                                        style={{ backgroundColor: "orange", color: "#fff", padding: "0.5rem 1rem", borderRadius: "6px" }}
                                                    >
                                                        Block
                                                    </button>
                                                    <button
                                                        onClick={() => handleAction(donor.id, "delete")}
                                                        style={{ backgroundColor: "red", color: "#fff", padding: "0.5rem 1rem", borderRadius: "6px" }}
                                                    >
                                                        Delete
                                                    </button>
                                                    </div>
                                                ) : donor.status === "Blocked" ? (
                                                    <div style={{ display: "flex", gap: "0.5rem" }}>
                                                    <span style={{ color: "orange", fontWeight: "bold" }}>🚫 Blocked</span>
                                                    <button
                                                        onClick={() => handleAction(donor.id, "unblock")}
                                                        style={{ backgroundColor: "green", color: "#fff", padding: "0.5rem 1rem", borderRadius: "6px" }}
                                                    >
                                                        Unblock
                                                    </button>
                                                    </div>
                                                ) : (
                                                    donor.status
                                                )}
                                                </td>


                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" style={{ textAlign: 'center', padding: '2rem', color: '#7f8c8d' }}>No donors found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                );
            case "ngoApprovals":
                const pendingNgos = ngos.filter((n) => n.status === "Under Review");
                return (
                    <div style={styles.tableContainer}>
                        <table style={styles.table}>
                            <thead style={styles.thead}>
                                <tr>
                                    <th style={styles.th}>ID</th>
                                    <th style={styles.th}>Name</th>
                                    <th style={styles.th}>Email</th>
                                    <th style={styles.th}>Registration Number</th>
                                    <th style={styles.th}>Address</th>
                                    <th style={styles.th}>Phone</th>
                                    <th style={styles.th}>Email Verified</th>
                                    <th style={styles.th}>Document</th>
                                    <th style={styles.th}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingNgos.length > 0 ? (
                                    pendingNgos.map((ngo) => (
                                        <tr key={ngo.id} style={{ transition: 'background-color 0.15s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}>
                                            <td style={styles.td}>{ngo.id}</td>
                                            <td style={styles.td}>{ngo.name}</td>
                                            <td style={styles.td}>{ngo.email}</td>
                                            <td style={styles.td}>{ngo.registration_number || "N/A"}</td>
                                            <td style={styles.td}>{ngo.address || "N/A"}</td>
                                            <td style={styles.td}>{ngo.phone || "N/A"}</td>
                                            <td style={styles.td}>{ngo.is_email_verified ? "Yes" : "No"}</td>
                                            <td style={styles.td}>
                                                {ngo.document_path ? (
                                                    <a
                                                        href={`${BACKEND_URL}/uploads/ngo_docs/${ngo.document_path.replace('/uploads/ngo_docs/','')}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{ color: '#3498db', fontWeight: 'bold', textDecoration: 'none' }}
                                                    >
                                                        View Document
                                                    </a>
                                                ) : (
                                                    <span style={{ color: '#999' }}>No document</span>
                                                )}
                                            </td>
                                            <td style={styles.td}>
                                                <div style={styles.actionButtonContainer}>
                                                    <button
                                                        onClick={() => handleNgoAction(ngo.id, 'approve')}
                                                        style={styles.approveButton}
                                                        onMouseOver={(e) => Object.assign(e.currentTarget.style, styles.approveButtonHover)}
                                                        onMouseOut={(e) => Object.assign(e.currentTarget.style, styles.approveButton)}
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleNgoAction(ngo.id, 'reject')}
                                                        style={styles.rejectButton}
                                                        onMouseOver={(e) => Object.assign(e.currentTarget.style, styles.rejectButtonHover)}
                                                        onMouseOut={(e) => Object.assign(e.currentTarget.style, styles.rejectButton)}
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="9" style={{ textAlign: 'center', padding: '2rem', color: '#7f8c8d' }}>No pending NGO applications.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                );
            case "allNgos":
                return (
                    <div style={styles.tableContainer}>
                        <table style={styles.table}>
                            <thead style={styles.thead}>
                                <tr>
                                    <th style={styles.th}>ID</th>
                                    <th style={styles.th}>Name</th>
                                    <th style={styles.th}>Email</th>
                                    <th style={styles.th}>Registration Number</th>
                                    <th style={styles.th}>Address</th>
                                    <th style={styles.th}>Phone</th>
                                    <th style={styles.th}>Email Verified</th>
                                    <th style={styles.th}>Document</th>
                                    <th style={styles.th}>Status</th>
                                    <th style={styles.th}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ngos.length > 0 ? (
                                    ngos.map((ngo) => (
                                        <tr key={ngo.id}>
                                            <td style={styles.td}>{ngo.id}</td>
                                            <td style={styles.td}>{ngo.name}</td>
                                            <td style={styles.td}>{ngo.email}</td>
                                            <td style={styles.td}>{ngo.registration_number || "N/A"}</td>
                                            <td style={styles.td}>{ngo.address || "N/A"}</td>
                                            <td style={styles.td}>{ngo.phone || "N/A"}</td>
                                            <td style={styles.td}>{ngo.is_email_verified ? "Yes" : "No"}</td>
                                            <td style={styles.td}>
                                                {ngo.document_path ? (
                                                    <a
                                                        href={`${BACKEND_URL}/uploads/ngo_docs/${ngo.document_path}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{ color: '#3498db', fontWeight: 'bold', textDecoration: 'none' }}
                                                    >
                                                        View Document
                                                    </a>
                                                ) : (
                                                    <span style={{ color: '#999' }}>No document</span>
                                                )}
                                            </td>
                                            <td style={styles.td}>
                                                <span style={{
                                                    ...styles.statusBadge,
                                                    ...(ngo.status === 'Approved' ? styles.statusApproved : ngo.status === 'Rejected' ? styles.statusRejected : styles.statusPending)
                                                }}>
                                                    {ngo.status}
                                                </span>
                                            </td>
                                            <td style={styles.td}>
                                                {ngo.status === "Approved" ? (
                                                    <div style={{ display: "flex", gap: "0.5rem" }}>
                                                        <button
                                                            onClick={() => handleNgoAction(ngo.id, "block")}
                                                            style={{ backgroundColor: "orange", color: "#fff", padding: "0.5rem 1rem", borderRadius: "6px" }}
                                                        >
                                                            Block
                                                        </button>
                                                        <button
                                                            onClick={() => handleNgoAction(ngo.id, "delete")}
                                                            style={{ backgroundColor: "red", color: "#fff", padding: "0.5rem 1rem", borderRadius: "6px" }}
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                ) : ngo.status === "Blocked" ? (
                                                    <button
                                                        onClick={() => handleNgoAction(ngo.id, "unblock")}
                                                        style={{ backgroundColor: "green", color: "#fff", padding: "0.5rem 1rem", borderRadius: "6px" }}
                                                    >
                                                        Unblock
                                                    </button>
                                                ) : (
                                                    <div style={styles.actionButtonContainer}>
                                                        <button
                                                            onClick={() => handleNgoAction(ngo.id, 'approve')}
                                                            style={styles.approveButton}
                                                            onMouseOver={(e) => Object.assign(e.currentTarget.style, styles.approveButtonHover)}
                                                            onMouseOut={(e) => Object.assign(e.currentTarget.style, styles.approveButton)}
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleNgoAction(ngo.id, 'reject')}
                                                            style={styles.rejectButton}
                                                            onMouseOver={(e) => Object.assign(e.currentTarget.style, styles.rejectButtonHover)}
                                                            onMouseOut={(e) => Object.assign(e.currentTarget.style, styles.rejectButton)}
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="10" style={{ ...styles.td, textAlign: 'center', color: '#999' }}>
                                            No NGOs found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                );
            case "reports":
                const stats = {
                    approved: donors.filter((d) => d.status === "Approved").length,
                    rejected: donors.filter((d) => d.status === "Rejected").length,
                    pending: donors.filter((d) => d.status === "Under Review").length,
                    ngoApproved: ngos.filter((n) => n.status === "Approved").length,
                    ngoRejected: ngos.filter((n) => n.status === "Rejected").length,
                    ngoPending: ngos.filter((n) => n.status === "Under Review").length,
                };
                return (
                    <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '10px', boxShadow: '0 5px 15px rgba(0,0,0,0.08)' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#34495e', marginBottom: '1rem' }}>Reports & Analytics</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                            <div style={{ backgroundColor: '#e8f7f1', borderRadius: '8px', padding: '1.25rem', border: '1px solid #d4edda' }}>
                                <p style={{ fontSize: '1.1rem', fontWeight: '600', color: '#2ecc71' }}>✅ Approved Donors</p>
                                <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#27ae60', marginTop: '0.5rem' }}>{stats.approved}</p>
                            </div>
                            <div style={{ backgroundColor: '#fbebed', borderRadius: '8px', padding: '1.25rem', border: '1px solid #f8d7da' }}>
                                <p style={{ fontSize: '1.1rem', fontWeight: '600', color: '#e74c3c' }}>❌ Rejected Donors</p>
                                <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#c0392b', marginTop: '0.5rem' }}>{stats.rejected}</p>
                            </div>
                            <div style={{ backgroundColor: '#fff8e1', borderRadius: '8px', padding: '1.25rem', border: '1px solid #fff3cd' }}>
                                <p style={{ fontSize: '1.1rem', fontWeight: '600', color: '#f39c12' }}>⏳ Pending Donors</p>
                                <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#e67e22', marginTop: '0.5rem' }}>{stats.pending}</p>
                            </div>
                            <div style={{ backgroundColor: '#e3f2fd', borderRadius: '8px', padding: '1.25rem', border: '1px solid #bbdefb' }}>
                                <p style={{ fontSize: '1.1rem', fontWeight: '600', color: '#2196f3' }}>🏢 Approved NGOs</p>
                                <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1976d2', marginTop: '0.5rem' }}>{stats.ngoApproved}</p>
                            </div>
                            <div style={{ backgroundColor: '#fce4ec', borderRadius: '8px', padding: '1.25rem', border: '1px solid #f8bbd9' }}>
                                <p style={{ fontSize: '1.1rem', fontWeight: '600', color: '#e91e63' }}>❌ Rejected NGOs</p>
                                <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#c2185b', marginTop: '0.5rem' }}>{stats.ngoRejected}</p>
                            </div>
                            <div style={{ backgroundColor: '#f3e5f5', borderRadius: '8px', padding: '1.25rem', border: '1px solid #e1bee7' }}>
                                <p style={{ fontSize: '1.1rem', fontWeight: '600', color: '#9c27b0' }}>⏳ Pending NGOs</p>
                                <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#7b1fa2', marginTop: '0.5rem' }}>{stats.ngoPending}</p>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div style={styles.dashboard}>
            {/* Sidebar */}
            <aside style={styles.sidebar}>
                <h2 style={styles.sidebarTitle}>Admin Panel</h2>
                <div style={{ flexGrow: 1 }}>
                    {sidebarMenu.map((item) => (
                        <div
                            key={item.key}
                            onClick={() => setActiveView(item.key)}
                            style={{
                                ...styles.navItem,
                                ...(activeView === item.key ? styles.navActive : {}),
                            }}
                            onMouseOver={(e) => Object.assign(e.currentTarget.style, styles.navItemHover)}
                            onMouseOut={(e) => activeView === item.key ? Object.assign(e.currentTarget.style, styles.navActive) : e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>
                        </div>
                    ))}
                </div>
                <button
                    onClick={handleLogout}
                    style={{ ...styles.btn, backgroundColor: '#e74c3c', marginTop: '1rem' }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#c0392b'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#e74c3c'}
                >
                    Logout
                </button>
            </aside>

            {/* Main Content */}
            <main style={styles.mainContent}>
                <h1 style={styles.contentTitle}>{sidebarMenu.find(item => item.key === activeView).label}</h1>
                {message.text && (
                    <div
                        style={{
                            ...styles.messageBox,
                            ...(message.type === 'success' ? styles.messageSuccess : styles.messageError),
                        }}
                    >
                        {message.text}
                    </div>
                )}
                {renderContent()}
            </main>
        </div>
    );
}
