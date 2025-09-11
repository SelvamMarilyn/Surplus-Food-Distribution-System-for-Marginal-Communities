import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import aboutImage from '../assets/aboutus.png';

function HomePage() {
  const navigate = useNavigate();

  const styles = {
    // --- Overall Page & Layout ---
    page: {
      fontFamily: '"Poppins", sans-serif',
      color: '#333',
      backgroundColor: '#f4f7f6',
      minHeight: '100vh',
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 20px',
    },
    // --- Navigation Bar ---
    navbar: {
      backgroundColor: '#fff',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
      padding: '1rem 20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: '0',
      zIndex: '1000',
    },
    logo: {
      fontWeight: '700',
      fontSize: '1.7rem',
      color: '#01947e', // Teal for a fresh feel
    },
    navLinks: {
      display: 'flex',
      alignItems: 'center',
      gap: '1.5rem',
    },
    navLink: {
      textDecoration: 'none',
      color: '#555',
      fontWeight: '500',
      transition: 'color 0.3s ease',
      cursor: 'pointer',
    },
    // --- Hero Section ---
    hero: {
      backgroundColor: '#01947e',
      color: '#fff',
      padding: '10rem 20px',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
    },
    heroTagline: {
      fontSize: '1.2rem',
      maxWidth: '700px',
      margin: '0 auto',
      opacity: '0.8',
    },
    // --- Button Styles ---
    button: {
      padding: '1.2rem 3rem',
      fontSize: '1.1rem',
      fontWeight: '600',
      border: 'none',
      borderRadius: '50px',
      cursor: 'pointer',
      boxShadow: '0 8px 15px rgba(0, 0, 0, 0.2)',
      textDecoration: 'none',
      display: 'inline-block',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    },
    callToActionButton: {
      background: 'linear-gradient(45deg, #6fa3ddff, #cc80acff)', // New orange-to-yellow gradient
      color: '#fff',
      marginTop: '2rem',
      padding: '1.5rem 4rem', // Significantly increased padding
      fontSize: '1.3rem', // Larger font size
      fontWeight: '700',
      boxShadow: '0 10px 20px rgba(255, 140, 0, 0.4)', // Matching shadow color
      transform: 'scale(1)',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    },
    // --- Sections ---
    section: {
      padding: '6rem 0',
      textAlign: 'center',
    },
    sectionTitle: {
      fontSize: '2.5rem',
      color: '#01947e',
      marginBottom: '4rem',
      fontWeight: '700',
    },
    // --- About Us Section ---
    aboutSection: {
      backgroundColor: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '3rem',
      flexWrap: 'wrap-reverse',
    },
    aboutText: {
      flex: '1',
      textAlign: 'left',
      minWidth: '300px',
      fontSize: '1.1rem',
      lineHeight: '1.8',
    },
    aboutImage: {
      flex: '1',
      minWidth: '300px',
      textAlign: 'center',
      maxWidth: '500px',
    },
    // --- How It Works Section ---
    howItWorksGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '2rem',
    },
    howItWorksItem: {
      backgroundColor: '#fff',
      padding: '2.5rem',
      borderRadius: '15px',
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
      transition: 'transform 0.3s ease',
      cursor: 'pointer',
    },
    icon: {
      fontSize: '3rem',
      marginBottom: '1.5rem',
      color: '#01947e',
    },
    // --- Key Features Section ---
    featuresSection: {
      backgroundColor: '#f4f7f6',
    },
    featureCard: {
      backgroundColor: '#fff',
      padding: '2.5rem',
      borderRadius: '15px',
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.08)',
      transition: 'transform 0.3s ease',
      cursor: 'pointer',
      height: '100%',
    },
    featureIcon: {
      fontSize: '2.5em',
      color: '#01947e',
      marginBottom: '1rem',
    },
    // --- Testimonials Section ---
    testimonialsSection: {
      backgroundColor: '#e8f2f0',
    },
    testimonialCard: {
      backgroundColor: '#fff',
      padding: '2rem',
      borderRadius: '10px',
      boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
      marginBottom: '1.5rem',
      textAlign: 'left',
      fontStyle: 'italic',
      position: 'relative',
      transition: 'transform 0.3s ease',
      borderLeft: '4px solid #01947e',
    },
    quoteIcon: {
      position: 'absolute',
      top: '1rem',
      left: '1rem',
      fontSize: '2em',
      color: '#ddd',
    },
    testimonialAuthor: {
      fontWeight: '600',
      marginTop: '1rem',
      display: 'block',
      color: '#555',
      fontStyle: 'normal',
    },
    // --- Final Call to Action ---
    finalCta: {
      backgroundColor: '#2c3e50',
      color: '#fff',
    },
    // --- Footer ---
    footer: {
      backgroundColor: '#2c3e50',
      color: '#f4f7f6',
      padding: '3rem 20px',
      textAlign: 'center',
    }
  };

  // --- Hover and Click Logic ---
  const handleButtonHover = (e, isHovering) => {
    e.currentTarget.style.transform = isHovering ? 'translateY(-5px)' : 'translateY(0)';
    e.currentTarget.style.boxShadow = isHovering ? '0 12px 20px rgba(0, 0, 0, 0.3)' : '0 8px 15px rgba(0, 0, 0, 0.2)';
  };
  
  const handleCallToActionButtonHover = (e, isHovering) => {
    e.currentTarget.style.transform = isHovering ? 'scale(1.05) translateY(-5px)' : 'scale(1) translateY(0)';
    e.currentTarget.style.boxShadow = isHovering ? '0 15px 30px rgba(255, 140, 0, 0.6)' : '0 10px 20px rgba(255, 140, 0, 0.4)';
  };

  const handleItemHover = (e, isHovering) => {
    e.currentTarget.style.transform = isHovering ? 'translateY(-10px)' : 'translateY(0)';
    e.currentTarget.style.boxShadow = isHovering ? '0 15px 30px rgba(0, 0, 0, 0.15)' : '0 8px 25px rgba(0, 0, 0, 0.1)';
  };

  const handleLinkHover = (e, isHovering) => {
    e.currentTarget.style.color = isHovering ? '#01b89d' : '#555';
  };

  // --- Functionality Buttons ---
  const handleGetStarted = () => navigate('/register-donor');
  const handleRegisterDonor = () => navigate('/register-donor');
  const handleRegisterNGO = () => navigate('/register-ngo');
  const handleLogin = () => navigate('/login');

  return (
    <div style={styles.page}>
      
      {/* Navigation Bar */}
      <nav style={styles.navbar}>
        <div style={styles.logo}>FoodBridge</div>
        <div style={styles.navLinks}>
          <a href="#about" style={styles.navLink} onMouseEnter={(e) => handleLinkHover(e, true)} onMouseLeave={(e) => handleLinkHover(e, false)}>About</a>
          <a href="#howitworks" style={styles.navLink} onMouseEnter={(e) => handleLinkHover(e, true)} onMouseLeave={(e) => handleLinkHover(e, false)}>How It Works</a>
          <a href="#features" style={styles.navLink} onMouseEnter={(e) => handleLinkHover(e, true)} onMouseLeave={(e) => handleLinkHover(e, false)}>Features</a>
          <a href="#testimonials" style={styles.navLink} onMouseEnter={(e) => handleLinkHover(e, true)} onMouseLeave={(e) => handleLinkHover(e, false)}>Testimonials</a>
          <button
             style={{ ...styles.button, backgroundColor: '#f0f0f0', color: '#333', padding: '0.75rem 1.5rem', fontSize: '0.9rem', boxShadow: 'none' }} 
             onMouseEnter={(e) => handleButtonHover(e, true)} 
             onMouseLeave={(e) => handleButtonHover(e, false)} 
             onClick={handleLogin}>Login</button>
          <Link to="/admin">
            <button style={{
                padding: '10px 20px',
                backgroundColor: '#555',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
            }}>
                Go to Admin Panel
            </button>
        </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header style={styles.hero}>
        <div style={styles.container}>
          <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem', fontWeight: '700' }}>Surplus Food Distribution System</h1>
          <p style={styles.heroTagline}>Bridging the gap between food surplus and community needs, with technology.</p>
          <button 
            style={styles.callToActionButton} 
            onMouseEnter={(e) => handleCallToActionButtonHover(e, true)} 
            onMouseLeave={(e) => handleCallToActionButtonHover(e, false)} 
            onClick={handleGetStarted}>Get Started Now</button>
        </div>
      </header>

      {/* About Us Section */}
      <section id="about" style={{...styles.section, ...styles.aboutSection}}>
        <div style={{...styles.container, display: 'flex', alignItems: 'center', gap: '3rem', flexWrap: 'wrap-reverse', textAlign: 'left'}}>
          <div style={styles.aboutText}>
            <h2 style={{...styles.sectionTitle, textAlign: 'left', marginBottom: '1.5rem'}}>About Our Mission</h2>
            <p>The Surplus Food Distribution System is a purpose-driven platform designed to connect **food donors** (restaurants, catering services) with **Community Service Partners** (NGOs). Our mission is to efficiently manage the distribution of surplus food, ensuring it reaches vulnerable communities and marginalized groups, thereby reducing food waste and combating hunger.</p>
            <p>By leveraging technology and a robust network of partners, we aim to create a sustainable and scalable solution to a global problem. We believe in transparency, efficiency, and the power of community.</p>
          </div>
          <div style={styles.aboutImage}>
            <img src={aboutImage} alt="Our mission in action" style={{maxWidth: '100%', height: 'auto', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)'}} />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="howitworks" style={{...styles.section, backgroundColor: '#e8f2f0'}}>
        <div style={styles.container}>
          <h2 style={styles.sectionTitle}>How It Works</h2>
          <div style={styles.howItWorksGrid}>
            <div 
              style={styles.howItWorksItem} 
              onMouseEnter={(e) => handleItemHover(e, true)} 
              onMouseLeave={(e) => handleItemHover(e, false)}>
              <div style={styles.icon}>🛒</div>
              <h3 style={{fontSize: '1.4rem', marginBottom: '0.5rem'}}>1. Donate Food</h3>
              <p>Verified donors post details of their surplus food, including photos and quantity.</p>
              <button 
                style={{...styles.button, backgroundColor: '#01947e', color: '#fff', padding: '0.75rem 1.5rem', fontSize: '0.9rem'}} 
                onMouseEnter={(e) => handleButtonHover(e, true)} 
                onMouseLeave={(e) => handleButtonHover(e, false)} 
                onClick={handleRegisterDonor}>Register as a Donor</button>
            </div>
            <div 
              style={styles.howItWorksItem} 
              onMouseEnter={(e) => handleItemHover(e, true)} 
              onMouseLeave={(e) => handleItemHover(e, false)}>
              <div style={styles.icon}>🎯</div>
              <h3 style={{fontSize: '1.4rem', marginBottom: '0.5rem'}}>2. Smart Matching</h3>
              <p>Our intelligent algorithm connects your donation to the most suitable NGO based on location and need.</p>
              <button 
                style={{...styles.button, backgroundColor: '#007BFF', color: '#fff', padding: '0.75rem 1.5rem', fontSize: '0.9rem'}} 
                onMouseEnter={(e) => handleButtonHover(e, true)} 
                onMouseLeave={(e) => handleButtonHover(e, false)}>Learn More</button>
            </div>
            <div 
              style={styles.howItWorksItem} 
              onMouseEnter={(e) => handleItemHover(e, true)} 
              onMouseLeave={(e) => handleItemHover(e, false)}>
              <div style={styles.icon}>🚚</div>
              <h3 style={{fontSize: '1.4rem', marginBottom: '0.5rem'}}>3. Verified Delivery</h3>
              <p>Our NGO partners deliver the food and provide geo-tagged proof of delivery to ensure transparency.</p>
              <button 
                style={{...styles.button, backgroundColor: '#28A745', color: '#fff', padding: '0.75rem 1.5rem', fontSize: '0.9rem'}} 
                onMouseEnter={(e) => handleButtonHover(e, true)} 
                onMouseLeave={(e) => handleButtonHover(e, false)} 
                onClick={handleRegisterNGO}>Register as an NGO</button>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section id="features" style={{...styles.section, ...styles.featuresSection}}>
        <div style={styles.container}>
          <h2 style={styles.sectionTitle}>Key Features</h2>
          <div style={styles.howItWorksGrid}>
            <div 
              style={styles.featureCard} 
              onMouseEnter={(e) => handleItemHover(e, true)} 
              onMouseLeave={(e) => handleItemHover(e, false)}>
              <div style={styles.featureIcon}>✅</div>
              <h3 style={{fontSize: '1.4rem', marginBottom: '0.5rem'}}>Smart Matching</h3>
              <p>Our intelligent system uses location data and needs-based algorithms to connect donors with the nearest and most suitable NGOs.</p>
            </div>
            <div 
              style={styles.featureCard} 
              onMouseEnter={(e) => handleItemHover(e, true)} 
              onMouseLeave={(e) => handleItemHover(e, false)}>
              <div style={styles.featureIcon}>📸</div>
              <h3 style={{fontSize: '1.4rem', marginBottom: '0.5rem'}}>Transparent Reporting</h3>
              <p>Donors receive geo-tagged photos and delivery confirmations, providing peace of mind that their donations reached their intended destination.</p>
            </div>
            <div 
              style={styles.featureCard} 
              onMouseEnter={(e) => handleItemHover(e, true)} 
              onMouseLeave={(e) => handleItemHover(e, false)}>
              <div style={styles.featureIcon}>📍</div>
              <h3 style={{fontSize: '1.4rem', marginBottom: '0.5rem'}}>Heat Map View</h3>
              <p>NGOs can view a real-time heat map of food surplus hotspots, allowing them to plan logistics and prioritize pick-ups efficiently.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" style={{...styles.section, backgroundColor: '#fff'}}>
        <div style={styles.container}>
          <h2 style={styles.sectionTitle}>What Our Partners Tell</h2>
          <div style={styles.howItWorksGrid}>
            <div 
              style={styles.testimonialCard} 
              onMouseEnter={(e) => handleItemHover(e, true)} 
              onMouseLeave={(e) => handleItemHover(e, false)}>
              <p>"This platform has completely transformed how we receive donations. The smart matching feature saves us so much time and ensures we get food to those who need it most, without delay."</p>
              <span style={styles.testimonialAuthor}>- Jane Doe, Director, Food for All</span>
            </div>
            <div 
              style={styles.testimonialCard} 
              onMouseEnter={(e) => handleItemHover(e, true)} 
              onMouseLeave={(e) => handleItemHover(e, false)}>
              <p>"As a restaurant owner, it feels great to know my surplus food isn't going to waste. The process is simple, and I can see the impact of my donations in real-time."</p>
              <span style={styles.testimonialAuthor}>- John Smith, Owner, Urban Kitchen</span>
            </div>
          </div>
        </div>
      </section>
      
      {/* Final Call to Action Section */}
      <section style={{...styles.section, ...styles.finalCta}}>
        <div style={styles.container}>
          <h2 style={{...styles.sectionTitle, color: '#fff', marginBottom: '20px'}}>Join Our Mission to End Hunger</h2>
          <p style={{color: '#e0e0e0', fontSize: '1.2em', marginBottom: '40px'}}>Sign up today to start making a difference, one meal at a time.</p>
          <button 
            style={{...styles.button, backgroundColor: '#01947e', color: '#fff'}} 
            onMouseEnter={(e) => handleButtonHover(e, true)} 
            onMouseLeave={(e) => handleButtonHover(e, false)} 
            onClick={handleGetStarted}>Join Now</button>
        </div>
      </section>
      
      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.container}>
          <p>© 2024 FoodBridge. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;