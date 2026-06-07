import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaQrcode, FaClipboardList, FaBell, FaStar, FaArrowRight } from 'react-icons/fa';
import Signup from './Signup';
import '../App.css';

export default function HomePage() {
  const navigate = useNavigate();
  const [showSignup, setShowSignup] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'));
  }, []);

  const handleCloseSignup = () => setShowSignup(false);
  const handleShowSignup = () => setShowSignup(true);

  const handleDemoClick = () => {
    // Navigate to a demo restaurant link or standard slug
    // We will use a mock restaurant ID or let them view a custom link
    // Let's redirect to a specific demo endpoint, we'll explain it in the route
    navigate('/menu/demo');
  };

  return (
    <div style={{ background: 'var(--bg-dark-radial)', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      
      {/* Background radial spotlights */}
      <div className="ambient-glow-purple" style={{ top: '-10%', left: '20%', width: '500px', height: '500px' }}></div>
      <div className="ambient-glow-emerald" style={{ bottom: '-10%', right: '10%', width: '600px', height: '600px' }}></div>

      {/* Hero Section */}
      <div className="container" style={{ paddingTop: '160px', paddingBottom: '80px', position: 'relative', zIndex: 2 }}>
        <div className="text-center max-w-3xl mx-auto d-flex flex-column align-items-center gap-3">
          <div className="badge px-3 py-2 bg-purple-subtle border border-primary text-light mb-2" style={{ background: 'rgba(139, 92, 246, 0.1)', borderRadius: '9999px', fontSize: '0.9rem' }}>
            ✨ Smart QR Menu & Order Operations SaaS
          </div>
          
          <h1 className="display-3 fw-bold text-white mb-3" style={{ letterSpacing: '-1.5px', lineHeight: '1.1' }}>
            Transform Your Dining Room <br />
            Into a <span style={{ background: 'linear-gradient(135deg, #a78bfa 0%, #8B5CF6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Digital Experience</span>
          </h1>
          
          <p className="lead text-secondary mb-4 mx-auto" style={{ maxWidth: '650px', fontSize: '1.2rem' }}>
            InstantPlate helps restaurants, cafes, and hotels deploy interactive QR codes at tables. 
            Empower guests to browse, customize items, call waitstaff, and place orders directly from their phones.
          </p>

          <div className="d-flex gap-3 justify-content-center mt-2">
            {isLoggedIn ? (
              <button onClick={() => navigate('/dashboard')} className="btn-glass-primary py-3 px-5 d-flex align-items-center gap-2" style={{ fontSize: '1.05rem' }}>
                Go to Dashboard <FaArrowRight />
              </button>
            ) : (
              <button onClick={handleShowSignup} className="btn-glass-primary py-3 px-5 d-flex align-items-center gap-2" style={{ fontSize: '1.05rem' }}>
                Get Started for Free <FaArrowRight />
              </button>
            )}
            
            <button onClick={handleDemoClick} className="btn-glass-secondary py-3 px-5" style={{ fontSize: '1.05rem' }}>
              Try Customer QR Menu Demo
            </button>
          </div>
        </div>
      </div>

      {/* Value Pillars Section */}
      <div className="container py-5" style={{ position: 'relative', zIndex: 2 }}>
        <div className="text-center mb-5">
          <h2 className="fw-bold text-white">Full-Stack Dining Room Automation</h2>
          <p className="text-secondary">All the tools required to build a premium guest experience</p>
        </div>

        <div className="row g-4">
          {/* Pillar 1 */}
          <div className="col-md-4">
            <div className="glass-panel p-4 h-100 d-flex flex-column gap-3">
              <div className="p-3 rounded-4 d-inline-block" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#a78bfa', width: 'fit-content' }}>
                <FaQrcode size={28} />
              </div>
              <h4 className="fw-bold text-white m-0">Smart QR Table Cards</h4>
              <p className="text-secondary m-0">
                Generate table-specific QR codes instantly. Print cards for tables so customers scan and check out immediately with localized table identification.
              </p>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="col-md-4">
            <div className="glass-panel p-4 h-100 d-flex flex-column gap-3">
              <div className="p-3 rounded-4 d-inline-block" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#34d399', width: 'fit-content' }}>
                <FaClipboardList size={28} />
              </div>
              <h4 className="fw-bold text-white m-0">Live Kitchen Console</h4>
              <p className="text-secondary m-0">
                Incoming orders are immediately funneled to your kitchen feed. Advance orders from pending to cooking, to served, and keep guests synchronized on progress.
              </p>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="col-md-4">
            <div className="glass-panel p-4 h-100 d-flex flex-column gap-3">
              <div className="p-3 rounded-4 d-inline-block" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', width: 'fit-content' }}>
                <FaBell size={28} />
              </div>
              <h4 className="fw-bold text-white m-0">Instant Service Requests</h4>
              <p className="text-secondary m-0">
                Let customers summon waiters or request checkout invoices with payment preferences. Real-time visual alerts flash on the kitchen console.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Quote / CTA */}
      <div className="container py-5 text-center" style={{ position: 'relative', zIndex: 2 }}>
        <div className="glass-panel p-5 max-w-4xl mx-auto" style={{ borderStyle: 'dashed' }}>
          <h3 className="fw-bold text-white mb-3">Scale Your Operations and Save Up to 25% on Service Overhead</h3>
          <p className="text-secondary mb-4 mx-auto" style={{ maxWidth: '600px' }}>
            Join hundreds of restaurants streamlining their services and boosting cart sizes through dynamic add-on customizations.
          </p>
          <button onClick={handleShowSignup} className="btn-glass-primary px-4 py-2">
            Build Your Interactive Menu Now
          </button>
        </div>
      </div>

      <Signup show={showSignup} handleClose={handleCloseSignup} />
    </div>
  );
}