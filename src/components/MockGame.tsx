import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Widget } from '@xsolla/login-sdk';

const LOGIN_PROJECT_ID = "a8a622df-4f2f-463f-9927-0ebc3104d68d";
const REDIRECT_URI = "https://xsolla-alanis-gamestore.vercel.app";

const MockGame = () => {
  const navigate = useNavigate();

  // --- AUTH STATE ---
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [showWidget, setShowWidget] = useState(false);
  const xlInstance = useRef<any>(null);

  // --- FIX: CAPTURE JWT FROM URL REDIRECT ---
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const jwt = urlParams.get('token');

    if (jwt) {
      console.log("🎟️ Token captured from URL redirect!");
      
      // Save to storage and update state
      localStorage.setItem('token', jwt);
      setToken(jwt);

      // Clean the URL (removes the ?token=... part so it looks professional)
      window.history.replaceState({}, document.title, '/');
    }
  }, []);

  // --- XSOLLA LOGIN WIDGET EFFECT ---
  useEffect(() => {
    if (!showWidget) return;

    const initWidget = () => {
      if (!xlInstance.current) {
        xlInstance.current = new Widget({
          projectId: LOGIN_PROJECT_ID,
          callbackUrl: REDIRECT_URI,
          preferredLocale: 'en_US',
          // Force the response to be a token in the URL fragment/query
          response_type: 'token', 
        } as any);

        xlInstance.current.mount('xsolla-login-widget');

        // Backup: handle in-page auth if the redirect doesn't trigger
        xlInstance.current.on('auth', (data: any) => {
          console.log("Xsolla Auth Payload:", data);
          const receivedToken = data.token || data.access_token;
          
          if (receivedToken) {
            localStorage.setItem('token', receivedToken);
            setToken(receivedToken);
            setShowWidget(false);
          }
        });
      }
    };

    const timer = setTimeout(initWidget, 200);
    return () => {
      clearTimeout(timer);
      xlInstance.current = null;
    };
  }, [showWidget]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  return (
    <div style={appWrapper}>
      <div style={videoBackground} />
      <div style={scanlineOverlay} />

      <nav style={navbarStyle}>
        <div style={brand} onClick={() => navigate('/')}>
          THE ASTRUM GAME <span style={alphaTag}>V.0.4</span>
        </div>
        
        <div style={navLinks}>
          <span style={activeLink}>HOME</span>
          <span style={navItem} onClick={() => navigate('/store')}>STORE</span>
          <button 
            onClick={token ? handleLogout : () => setShowWidget(true)} 
            style={token ? logoutBtn : goldBtn}
          >
            {token ? "LOGOUT" : "LOGIN"}
          </button>
        </div>
      </nav>

      <main style={mainContent}>
        <div style={homeScreen}>
          <h1 style={titleStyle}>ASTRUM</h1>
          <p style={description}>
            {token ? "Welcome back, Traveler. Your legacy awaits." : "Enter the gate. Claim your gilded legacy."}
          </p>
          
          <div style={menuOptions}>
            <button style={token ? activeBtn : disabledBtn}>
                {token ? "RESUME MISSION" : "LOGIN TO UNLOCK MISSION"}
            </button>
            <button style={activeBtn} onClick={() => navigate('/store')}>
              VISIT THE MERCHANT
            </button>
          </div>
        </div>
      </main>

      {/* LOGIN MODAL */}
      {showWidget && (
        <div style={modalOverlay}>
          <div style={modalContent}>
             <div id="xsolla-login-widget" style={{ width: '400px', height: '550px' }}></div>
             <button onClick={() => setShowWidget(false)} style={closeBtn}>CLOSE</button>
          </div>
        </div>
      )}

      <footer style={footerStyle}>
        <div style={footerLeft}>
          <span>REGION: ASIA_NORTH</span>
          <span>LATENCY: 18ms</span>
        </div>
        <div style={footerRight}>
          <span>&copy; 2026 XSOLLA SCHOOL PROJECT</span>
        </div>
      </footer>
    </div>
  );
};

// --- STYLES ---
const appWrapper: React.CSSProperties = { height: '100vh', width: '100%', background: '#020205', color: '#f4ebd0', fontFamily: '"Cinzel", serif', overflow: 'hidden', position: 'fixed', top: 0, left: 0 };
const videoBackground: React.CSSProperties = { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundImage: `url('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2000')`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.3, zIndex: 1 };
const scanlineOverlay: React.CSSProperties = { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%), radial-gradient(circle, transparent 20%, #000 100%)', zIndex: 2, pointerEvents: 'none' };
const navbarStyle: React.CSSProperties = { position: 'relative', zIndex: 10, height: '90px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 60px', borderBottom: '1px solid rgba(212, 175, 55, 0.2)', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)' };
const brand: React.CSSProperties = { fontSize: '20px', fontWeight: 'bold', letterSpacing: '4px', color: '#d4af37', cursor: 'pointer' };
const alphaTag = { color: '#8d99ae', fontSize: '12px', letterSpacing: '1px' };
const navLinks = { display: 'flex', gap: '40px', alignItems: 'center' };
const navItem: React.CSSProperties = { fontSize: '14px', letterSpacing: '2px', cursor: 'pointer', color: '#8d99ae' };
const activeLink = { ...navItem, color: '#d4af37', borderBottom: '1px solid #d4af37' };
const mainContent: React.CSSProperties = { position: 'relative', zIndex: 10, height: 'calc(100vh - 90px)', padding: '40px 60px' };
const homeScreen: React.CSSProperties = { paddingTop: '10vh', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' };
const titleStyle: React.CSSProperties = { fontSize: '120px', margin: 0, color: '#d4af37', letterSpacing: '20px' };
const description = { fontSize: '20px', color: '#8d99ae', letterSpacing: '4px', marginBottom: '40px' };
const menuOptions = { display: 'flex', flexDirection: 'column' as const, gap: '15px', width: '350px' };
const activeBtn = { padding: '18px', background: '#d4af37', color: '#000', border: 'none', cursor: 'pointer', fontWeight: 'bold', letterSpacing: '2px', fontFamily: '"Cinzel", serif' };
const goldBtn = { ...activeBtn, padding: '10px 20px', fontSize: '14px' };
const logoutBtn = { ...goldBtn, background: 'transparent', color: '#d4af37', border: '1px solid #d4af37' };
const disabledBtn = { padding: '18px', background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.2)', border: '1px solid #5e503f', cursor: 'not-allowed', fontFamily: '"Cinzel", serif' };
const modalOverlay: React.CSSProperties = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalContent: React.CSSProperties = { background: '#1a1a1a', padding: '20px', borderRadius: '8px', border: '1px solid #d4af37' };
const closeBtn = { width: '100%', marginTop: '10px', background: '#333', color: '#fff', border: 'none', padding: '10px', cursor: 'pointer', fontFamily: '"Cinzel", serif' };
const footerStyle: React.CSSProperties = { position: 'absolute', bottom: 0, width: '100%', height: '60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 60px', fontSize: '10px', color: 'rgba(141, 153, 174, 0.4)', zIndex: 10, background: 'rgba(0,0,0,0.5)', boxSizing: 'border-box' };
const footerLeft = { display: 'flex', gap: '30px' };
const footerRight = { textAlign: 'right' as const };

export default MockGame;