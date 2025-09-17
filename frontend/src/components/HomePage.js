import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import aboutImage from '../assets/aboutus.png';
import heroVideo from '../assets/food-hero-video.mp4';

function HomePage() {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  // const [isVisible, setIsVisible] = useState({});

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const styles = {
    // --- Overall Page & Layout ---
    page: {
      fontFamily: "'Cormorant Garamond', serif",
      color: '#f7fafc',
      backgroundColor: '#121212', // medium black for body
      minHeight: '100vh',
      lineHeight: '1.6',
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 20px',
    },
    
    // --- Navigation Bar ---
    navbar: {
      backgroundColor: 'rgba(15, 15, 15, 0.9)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      padding: '1rem 20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      zIndex: '1000',
      transition: 'all 0.3s ease',
    },
    logo: {
      fontWeight: '800',
      fontSize: '1.8rem',
      
      background: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)',
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      letterSpacing: '-0.5px',
    },
    navLinks: {
      display: 'flex',
      alignItems: 'center',
      gap: '2rem',
    },
    navLink: {
      textDecoration: 'none',
      color: '#e2e8f0',
      fontWeight: '500',
      fontSize: '1.7rem',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      position: 'relative',
      padding: '0.5rem 0',
    },

    
    // --- Hero Section ---
    hero: {
      color: '#fff',
      padding: '12rem 20px 8rem',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
      marginTop: '80px',
    },
    heroBackground: {
      position: 'absolute',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      background: `
        radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
        radial-gradient(circle at 40% 80%, rgba(120, 219, 255, 0.3) 0%, transparent 50%)
      `,
      animation: 'float 20s ease-in-out infinite',
    },
    heroContent: {
      position: 'relative',
      zIndex: '2',
    },
    heroTitle: {
      fontFamily: "'Great Vibes', cursive",
      fontSize: "6rem",
      fontWeight: "400",
      color: "#fff",
      marginBottom: '1.5rem',
      lineHeight: '1.1',
    },
    heroTagline: {
      fontSize: '2rem',
      maxWidth: '600px',
      margin: '0 auto 2rem',
      opacity: '0.95',
      fontWeight: '400',
    },
    heroStats: {
      display: 'flex',
      justifyContent: 'center',
      gap: '3rem',
      marginTop: '4rem',
      flexWrap: 'wrap',
    },
    statItem: { textAlign: 'center' },
    statNumber: { fontSize: '2.5rem', fontWeight: '800', display: 'block', marginBottom: '0.5rem', color: '#020409ff' },
    statLabel: { fontSize: '0.9rem', opacity: '0.8', textTransform: 'uppercase', letterSpacing: '1px',color: '#020409ff' },

    
    // --- Button Styles ---
    primaryButton: {
      background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
      fontFamily: "'Cormorant Garamond', serif",
      color: '#fff',
      padding: '1rem 2.5rem',
      fontSize: '1.5rem',
      fontWeight: '600',
      border: 'none',
      borderRadius: '50px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
    },
    secondaryButton: {
      background: 'transparent',
      fontFamily: "'Cormorant Garamond', serif",
      color: '#fff',
      border: '2px solid rgba(255, 255, 255, 0.4)',
      padding: '0.75rem 2rem',
      fontSize: '1.7rem',
      fontWeight: '600',
      borderRadius: '50px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
    },
    loginButton: {
      background: 'transparent',
      fontFamily: "'Cormorant Garamond', serif",
      color: '#feca57',
      border: '2px solid #feca57',
      padding: '0.75rem 1.5rem',
      fontSize: '1rem',
      fontWeight: '600',
      borderRadius: '25px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
    },
    adminButton: {
      background: '#ff6b6b',
      fontFamily: "'Cormorant Garamond', serif",
      color: 'white',
      border: 'none',
      padding: '0.75rem 1.5rem',
      borderRadius: '25px',
      cursor: 'pointer',
      fontSize: '1rem',
      fontWeight: '600',
      transition: 'all 0.3s ease',
    },
    
    // --- Sections ---
    section: {
      padding: '6rem 0',
    },
    sectionTitle: {
      fontSize: 'clamp(2rem, 4vw, 2.5rem)',
      color: '#2d3748',
      marginBottom: '1rem',
      fontWeight: '700',
      textAlign: 'center',
      letterSpacing: '-0.5px',
    },
    sectionSubtitle: {
      fontSize: '1.5rem',
      color: '#718096',
      textAlign: 'center',
      maxWidth: '600px',
      margin: '0 auto 4rem',
      lineHeight: '1.6',
    },
    
    // --- About Section ---
    aboutSection: {
      backgroundColor: '#f7fafc',
    },
    aboutContent: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
      gap: '4rem',
      alignItems: 'center',
    },
    aboutText: {
      fontSize: '1.5rem',
      lineHeight: '1.8',
      color: '#4a5568',
    },
    aboutImage: {
      position: 'relative',
      borderRadius: '20px',
      overflow: 'hidden',
      boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
    },
    
    // --- Features Grid ---
    featuresGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
      gap: '2rem',
      marginTop: '4rem',
    },
    featureCard: {
      background: '#262424ff',
      padding: '2.5rem',
      borderRadius: '20px',
      boxShadow: '0 10px 40px rgba(23, 23, 23, 0.1)',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      border: '1px solid rgba(0, 0, 0, 0.05)',
      position: 'relative',
      overflow: 'hidden',
    },
    featureIcon: {
      fontSize: '3rem',
      marginBottom: '1.5rem',
      display: 'block',
    },
    featureTitle: {
      fontSize: '1.9rem',
      fontWeight: '700',
      color: '#f3f6fbff',
      marginBottom: '1rem',
    },
    featureDescription: {
      color: '#e2e4e5ff',
      lineHeight: '1.7',
      fontSize: '1.5rem',
    },
    
    // --- How It Works ---
    processStep: {
      textAlign: 'center',
      position: 'relative',
    },
    stepNumber: {
      width: '60px',
      height: '60px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.9rem',
      fontWeight: '700',
      margin: '0 auto 1.5rem',
    },
    stepTitle: {
      fontSize: '1.7rem',
      fontWeight: '700',
      color: '#f0f2f5ff',
      marginBottom: '1rem',
    },
    stepDescription: {
      fontSize: '1.5rem',
      color: '#e2eaf6ff',
      lineHeight: '1.6',
      marginBottom: '1.5rem',
    },
    
    // --- Testimonials ---
    testimonialsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '2rem',
      marginTop: '4rem',
    },
    testimonialCard: {
      background: '#fff',
      padding: '2rem',
      borderRadius: '15px',
      boxShadow: '0 10px 30px rgba(248, 244, 244, 0.76)',
      position: 'relative',
      transition: 'all 0.3s ease',
    },
    testimonialQuote: {
      fontSize: '1.6rem',
      lineHeight: '1.7',
      color: '#111111ff',
      marginBottom: '1.5rem',
      fontStyle: 'italic',
    },
    testimonialAuthor: {
      fontSize: '1.6rem',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
    },
    authorAvatar: {
      width: '50px',
      height: '50px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      fontSize: '1.2rem',
      fontWeight: '700',
    },
    authorInfo: {
      flex: '1',
    },
    authorName: {
      fontSize: '1.6rem',
      fontWeight: '600',
      color: '#2d3748',
      marginBottom: '0.25rem',
    },
    authorTitle: {
      color: '#718096',
      fontSize: '1.4rem',
    },
    
    // --- CTA Section ---
    ctaSection: {
      background: 'linear-gradient(135deg, #f6f8faff 0%, #4a5568 100%)',
      color: '#020000ff',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
    },
    ctaContent: {
      position: 'relative',
      zIndex: '2',
    },
    
    // --- Footer ---
    footer: {
     background: 'linear-gradient(135deg, #f6f8faff 0%, #4a5568 100%)',
      padding: '3rem 20px 2rem',
      textAlign: 'center',
    },
    
    // --- Animations ---
    '@keyframes float': {
      '0%, 100%': { transform: 'translateY(0px)' },
      '50%': { transform: 'translateY(-20px)' },
    },
    '@keyframes fadeInUp': {
      from: {
        opacity: '0',
        transform: 'translateY(30px)',
      },
      to: {
        opacity: '1',
        transform: 'translateY(0)',
      },
    },
  };

  // Enhanced hover effects
  const handleButtonHover = (e, isHovering, type = 'primary') => {
    if (type === 'primary') {
      e.currentTarget.style.transform = isHovering ? 'translateY(-3px) scale(1.02)' : 'translateY(0) scale(1)';
      e.currentTarget.style.boxShadow = isHovering ? '0 15px 40px rgba(255, 107, 107, 0.4)' : '0 10px 30px rgba(255, 107, 107, 0.3)';
    } else if (type === 'secondary') {
      e.currentTarget.style.background = isHovering ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)';
      e.currentTarget.style.transform = isHovering ? 'translateY(-2px)' : 'translateY(0)';
    } else if (type === 'login') {
      e.currentTarget.style.background = isHovering ? '#667eea' : 'rgba(102, 126, 234, 0.1)';
      e.currentTarget.style.color = isHovering ? '#fff' : '#667eea';
    } else if (type === 'admin') {
      e.currentTarget.style.background = isHovering ? '#4a5568' : '#2d3748';
      e.currentTarget.style.transform = isHovering ? 'translateY(-2px)' : 'translateY(0)';
    }
  };

  const handleCardHover = (e, isHovering) => {
    e.currentTarget.style.transform = isHovering ? 'translateY(-10px)' : 'translateY(0)';
    e.currentTarget.style.boxShadow = isHovering ? '0 20px 60px rgba(0, 0, 0, 0.15)' : '0 10px 40px rgba(0, 0, 0, 0.1)';
  };

  const handleNavLinkHover = (e, isHovering) => {
    e.currentTarget.style.color = isHovering ? '#667eea' : '#4a5568';
    e.currentTarget.style.transform = isHovering ? 'translateY(-1px)' : 'translateY(0)';
  };

  // Navigation functions
  const handleGetStarted = () => navigate('/register-donor');
  const handleRegisterDonor = () => navigate('/register-donor');
  const handleRegisterNGO = () => navigate('/register-ngo');
  const handleLogin = () => navigate('/login');

  return (
    <div style={styles.page}>
      {/* Enhanced Navigation */}
      <nav style={styles.navbar}>
        <div style={styles.logo}>HopeBites</div>
        <div style={styles.navLinks}>
          <a href="#about" style={styles.navLink} 
             onMouseEnter={(e) => handleNavLinkHover(e, true)} 
             onMouseLeave={(e) => handleNavLinkHover(e, false)}>About</a>
          <a href="#process" style={styles.navLink}
             onMouseEnter={(e) => handleNavLinkHover(e, true)} 
             onMouseLeave={(e) => handleNavLinkHover(e, false)}>How It Works</a>
          <a href="#features" style={styles.navLink}
             onMouseEnter={(e) => handleNavLinkHover(e, true)} 
             onMouseLeave={(e) => handleNavLinkHover(e, false)}>Features</a>
          <a href="#testimonials" style={styles.navLink}
             onMouseEnter={(e) => handleNavLinkHover(e, true)} 
             onMouseLeave={(e) => handleNavLinkHover(e, false)}>Success Stories</a>
          
          <button
            style={styles.loginButton}
            onMouseEnter={(e) => handleButtonHover(e, true, 'login')}
            onMouseLeave={(e) => handleButtonHover(e, false, 'login')}
            onClick={handleLogin}>
            Login
          </button>
          
          <Link to="/admin">
            <button 
              style={styles.adminButton}
              onMouseEnter={(e) => handleButtonHover(e, true, 'admin')}
              onMouseLeave={(e) => handleButtonHover(e, false, 'admin')}>
              Admin Panel
            </button>
          </Link>
        </div>
      </nav>

      {/* Enhanced Hero Section */}
      <header style={styles.hero}>
        <video autoPlay muted loop playsInline
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}>
          <source src={heroVideo} type="video/mp4" />
        </video>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', zIndex: 1 }}></div>

        <div style={{ position: 'relative', zIndex: 2 }}>
          <h1 style={styles.heroTitle}>Surplus for Sustenance</h1>
          <p style={styles.heroTagline}>
            Connect food donors with community partners through intelligent matching, 
            transparent delivery tracking, and real-time impact measurement.
          </p>
          <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button style={styles.primaryButton} onClick={handleLogin}>Start Donating Today</button>
            <button style={styles.secondaryButton}>Watch Demo</button>
          </div>
        </div>
      </header>

      {/* Enhanced About Section */}
      <section id="about" style={{...styles.section, ...styles.aboutSection}}>
        <div style={styles.container}>
          <h2 style={styles.sectionTitle}>Bridging Communities Through Technology</h2>
          <p style={styles.sectionSubtitle}>
            We're revolutionizing food distribution by creating intelligent connections between surplus and need.
          </p>
          
          <div style={styles.aboutContent}>
            <div style={styles.aboutText}>
              <h3 style={{ fontSize: '2rem', fontWeight: '700', color: '#2d3748', marginBottom: '1.5rem' }}>
                Our Mission
              </h3>
              <p style={{ marginBottom: '1.5rem' }}>
                HopeBites leverages cutting-edge technology to create seamless connections between food donors 
                and community service partners. Our intelligent platform ensures that surplus food reaches 
                vulnerable communities efficiently and transparently.
              </p>
              <p style={{ marginBottom: '1.5rem' }}>
                Through real-time matching algorithms, geo-tagged delivery verification, and comprehensive 
                impact tracking, we're building a sustainable ecosystem that reduces waste while fighting hunger.
              </p>
              <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem' }}>
                <div>
                  <h4 style={{ fontWeight: '700', color: '#667eea', fontSize: '1.8rem', marginBottom: '0.5rem' }}>95%</h4>
                  <p style={{ color: '#718096', fontSize: '1.2rem' }}>Delivery Success Rate</p>
                </div>
                <div>
                  <h4 style={{ fontWeight: '700', color: '#667eea', fontSize: '1.8rem', marginBottom: '0.5rem' }}>24/7</h4>
                  <p style={{ color: '#718096', fontSize: '1.2rem' }}>Platform Availability</p>
                </div>
              </div>
            </div>
            <div style={styles.aboutImage}>
              <img src={aboutImage} alt="Impact visualization" 
                   style={{ width: '100%', height: 'auto', display: 'block' }} />
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Process Section */}
      <section id="process" style={styles.section}>
        <div style={styles.container}>
          <h2 style={styles.sectionTitle}>How HopeBites Works</h2>
          <p style={styles.sectionSubtitle}>
            A streamlined process designed for maximum impact and minimum friction.
          </p>
          
          <div style={styles.featuresGrid}>
            <div style={styles.processStep}>
              <div style={styles.stepNumber}>1</div>
              <h3 style={styles.stepTitle}>Smart Food Posting</h3>
              <p style={styles.stepDescription}>
                Donors upload surplus food details with photos, quantity, and pickup preferences. 
                Our AI categorizes and prioritizes based on urgency and nutritional value.
              </p>
              <button 
                style={{...styles.primaryButton, fontSize: '1.5rem', padding: '0.75rem 2rem'}}
                onMouseEnter={(e) => handleButtonHover(e, true, 'primary')}
                onMouseLeave={(e) => handleButtonHover(e, false, 'primary')}
                onClick={handleRegisterDonor}>
                Become a Donor
              </button>
            </div>
            
            <div style={styles.processStep}>
              <div style={styles.stepNumber}>2</div>
              <h3 style={styles.stepTitle}>Intelligent Matching</h3>
              <p style={styles.stepDescription}>
                Our algorithm considers location proximity, NGO capacity, community needs, 
                and historical data to create optimal matches in real-time.
              </p>
              <button 
                style={{...styles.secondaryButton, color: '#667eea', border: '2px solid #667eea', fontFamily: "'Cormorant Garamond', serif",fontSize: '1.5rem', padding: '0.75rem 2rem'}}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#667eea';
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#667eea';
                }}>
                See Algorithm
              </button>
            </div>
            
            <div style={styles.processStep}>
              <div style={styles.stepNumber}>3</div>
              <h3 style={styles.stepTitle}>Verified Impact</h3>
              <p style={styles.stepDescription}>
                NGOs provide geo-tagged delivery confirmations with recipient counts and photos, 
                creating a transparent chain of impact for every donation.
              </p>
              <button 
                style={{...styles.primaryButton, background: 'linear-gradient(135deg, #10ac84 0%, #1dd1a1 100%)', fontSize: '1.5rem', padding: '0.75rem 2rem'}}
                onMouseEnter={(e) => handleButtonHover(e, true, 'primary')}
                onMouseLeave={(e) => handleButtonHover(e, false, 'primary')}
                onClick={handleRegisterNGO}>
                Join as NGO
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section id="features" style={{...styles.section, backgroundColor: '#f7fafc'}}>
        <div style={styles.container}>
          <h2 style={styles.sectionTitle}>Platform Features</h2>
          <p style={styles.sectionSubtitle}>
            Advanced technology meets social impact through these core capabilities.
          </p>
          
          <div style={styles.featuresGrid}>
            <div 
              style={styles.featureCard}
              onMouseEnter={(e) => handleCardHover(e, true)}
              onMouseLeave={(e) => handleCardHover(e, false)}>
              <div style={{...styles.featureIcon, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
                🎯
              </div>
              <h3 style={styles.featureTitle}>AI-Powered Matching</h3>
              <p style={styles.featureDescription}>
                Machine learning algorithms analyze donor patterns, NGO capacity, and community needs 
                to create optimal matches that maximize impact and minimize waste.
              </p>
            </div>
            
            <div 
              style={styles.featureCard}
              onMouseEnter={(e) => handleCardHover(e, true)}
              onMouseLeave={(e) => handleCardHover(e, false)}>
              <div style={{...styles.featureIcon, background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
                📍
              </div>
              <h3 style={styles.featureTitle}>Real-Time Tracking</h3>
              <p style={styles.featureDescription}>
                Live GPS tracking, delivery confirmations, and impact metrics provide complete 
                transparency from donation to distribution.
              </p>
            </div>
            
            <div 
              style={styles.featureCard}
              onMouseEnter={(e) => handleCardHover(e, true)}
              onMouseLeave={(e) => handleCardHover(e, false)}>
              <div style={{...styles.featureIcon, background: 'linear-gradient(135deg, #10ac84 0%, #1dd1a1 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
                📊
              </div>
              <h3 style={styles.featureTitle}>Impact Analytics</h3>
              <p style={styles.featureDescription}>
                Comprehensive dashboards show donation history, community impact, 
                environmental savings, and social outcomes with detailed reporting.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Testimonials */}
      <section id="testimonials" style={styles.section}>
        <div style={styles.container}>
          <h2 style={styles.sectionTitle}>Success Stories</h2>
          <p style={styles.sectionSubtitle}>
            Hear from the partners and communities transforming lives through HopeBites.
          </p>
          
          <div style={styles.testimonialsGrid}>
            <div 
              style={styles.testimonialCard}
              onMouseEnter={(e) => handleCardHover(e, true)}
              onMouseLeave={(e) => handleCardHover(e, false)}>
              <p style={styles.testimonialQuote}>
                "HopeBites has revolutionized our operations. The intelligent matching system connects us 
                with the right donors at the right time, and the impact tracking helps us show real results to our stakeholders."
              </p>
              <div style={styles.testimonialAuthor}>
                <div style={styles.authorAvatar}>MR</div>
                <div style={styles.authorInfo}>
                  <div style={styles.authorName}>Maria Rodriguez</div>
                  <div style={styles.authorTitle}>Operations Manager, Hope Foundation</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
{/* Enhanced Footer */}
      <footer style={styles.footer}>
      {/* Enhanced Call-to-Action Section */}
      {/* <section style={{...styles.section, ...styles.ctaSection}}> */}
        <div style={styles.container}>
          <div style={styles.ctaContent}>
            <h2 style={{...styles.sectionTitle, color: '#fff', marginBottom: '1rem'}}>
              Ready to Make an Impact?
            </h2>
            <p style={{...styles.sectionSubtitle, color: 'rgba(255, 255, 255, 0.8)', marginBottom: '3rem'}}>
              Join thousands of donors and NGOs creating positive change in communities worldwide.
            </p>
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button 
                style={{...styles.primaryButton, background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)'}}
                onMouseEnter={(e) => handleButtonHover(e, true, 'primary')}
                onMouseLeave={(e) => handleButtonHover(e, false, 'primary')}
                onClick={handleLogin}>
                Start Your Journey
              </button>
              <button 
                style={styles.secondaryButton}
                onMouseEnter={(e) => handleButtonHover(e, true, 'secondary')}
                onMouseLeave={(e) => handleButtonHover(e, false, 'secondary')}>
                Learn More
              </button>
            </div>

            {/* Additional CTA Stats */}
            <div style={{...styles.heroStats, marginTop: '4rem', opacity: '0.9'}}>
              <div style={styles.statItem}>
                <span style={{...styles.statNumber, fontSize: '2rem'}}>0</span>
                <span style={styles.statLabel}>Setup Cost</span>
              </div>
              <div style={styles.statItem}>
                <span style={{...styles.statNumber, fontSize: '2rem'}}>5min</span>
                <span style={styles.statLabel}>Quick Setup</span>
              </div>
              <div style={styles.statItem}>
                <span style={{...styles.statNumber, fontSize: '2rem'}}>24/7</span>
                <span style={styles.statLabel}>Support</span>
              </div>
            </div>
          </div>
        </div>
      {/* </section> */}
      
      
        <div style={styles.container}>
          <div style={{ 
            borderTop: '1px solid #e6e9efff', 
            paddingTop: '2rem', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <p style={{ color: '#020409ff',margin: '0', fontSize: '1.5rem' }}>
              © 2025 HopeBites. All rights reserved.
            </p>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <a href="#privacy" style={{ color: '#020409ff', textDecoration: 'none', fontSize: '1.5rem' }}>Privacy</a>
              <a href="#terms" style={{ color: '#020409ff', textDecoration: 'none', fontSize: '1.5rem' }}>Terms</a>
              <a href="#cookies" style={{ color: '#020409ff', textDecoration: 'none', fontSize: '1.5rem' }}>Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;