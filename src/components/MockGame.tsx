import React, { useState } from 'react';
import Store from './Store'; // Your functional store

const MockGame = () => {
  const [showStore, setShowStore] = useState(false);

  return (
    <div style={appWrapper}>
      {/* 1. THE VISUAL "GAME" LAYER (Non-functional background) */}
      <div style={videoBackground} />
      <div style={scanlineOverlay} />

      {/* 2. THE GAME HUD (Top Bar) */}
      <nav style={topHud}>
        <div style={brand}>THE ASTRUM GAME <span style={alphaTag}>V.0.4</span></div>
        <div style={stats}>
          <div style={statItem}><span style={label}>REGION</span><br/>ASIA_NORTH</div>
          <div style={statItem}><span style={label}>LATENCY</span><br/>18ms</div>
          {/* This represents where a user would see their balance after buying something */}
          <div style={statItem}><span style={label}>CREDITS</span><br/>5,400 💎</div>
        </div>
      </nav>

      {/* 3. THE MAIN VIEW */}
      <main style={mainContent}>
        {!showStore ? (
          /* THIS IS THE "MOCK GAME" HOME SCREEN */
          <div style={homeScreen}>
            <h1 style={titleStyle}>THE ASTRUM GAME</h1>
            <p style={description}>Enter the grid. Fight for the future.</p>
            
            <div style={menuOptions}>
              {/* These buttons are "Mock" - they don't do anything */}
              <button style={disabledBtn}>START MISSION (LOCKED)</button>
              <button style={disabledBtn}>CHARACTER CUSTOMIZATION</button>
              
              {/* THIS IS THE REAL FUNCTIONAL BUTTON */}
              <button style={activeBtn} onClick={() => setShowStore(true)}>
                OPEN STOREFRONT
              </button>
            </div>
          </div>
        ) : (
          /* THIS IS YOUR REAL FUNCTIONAL STORE */
          <div style={storeWrapper}>
            <div style={storeHeader}>
              <button style={backBtn} onClick={() => setShowStore(false)}>
                ← EXIT TO MAIN MENU
              </button>
              <h2 style={storeTitle}>EQUIPMENT & APPAREL</h2>
            </div>
            
            {/* Your Store.tsx component with your Paystation/Login logic */}
            <div style={storeContainer}>
              <Store />
            </div>
          </div>
        )}
      </main>

      {/* 4. BOTTOM DECORATION */}
      <footer style={footerStyle}>
        <span>&copy; 2026 XSOLLA SCHOOL PROJECT</span>
        <span>ENCRYPTED CONNECTION_SECURE PAYMENTS</span>
      </footer>
    </div>
  );
};

// --- STYLES ---
const appWrapper: React.CSSProperties = {
  height: '100vh', width: '100vw', background: '#020205',
  color: '#fff', fontFamily: '"Arial", sans-serif',
  overflow: 'hidden', position: 'relative'
};

const videoBackground: React.CSSProperties = {
  position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
  backgroundImage: `url('https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=2000')`,
  backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.3, zIndex: 1
};

const scanlineOverlay: React.CSSProperties = {
  position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
  background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.03), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.03))',
  backgroundSize: '100% 3px, 3px 100%', zIndex: 2, pointerEvents: 'none'
};

const topHud: React.CSSProperties = {
  position: 'relative', zIndex: 10, height: '80px', display: 'flex', 
  justifyContent: 'space-between', alignItems: 'center', padding: '0 50px',
  borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.5)'
};

const brand = { fontSize: '18px', fontWeight: 'bold', letterSpacing: '2px' };
const alphaTag = { color: '#3D46F5', fontSize: '12px' };
const stats = { display: 'flex', gap: '30px' };
const statItem = { textAlign: 'right' as const, fontSize: '14px' };
const label = { fontSize: '10px', color: 'rgba(255,255,255,0.4)', letterSpacing: '1px' };

const mainContent: React.CSSProperties = { position: 'relative', zIndex: 10, height: 'calc(100vh - 80px)', padding: '50px' };

const homeScreen = { marginTop: '10vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'};
const titleStyle = { fontSize: '80px', lineHeight: '0.9', margin: '0 0 10px 0', textShadow: '0 0 30px rgba(61,70,245,0.8)' };
const description = { fontSize: '18px', color: 'rgba(255,255,255,0.6)', marginBottom: '40px' };

const menuOptions = { display: 'flex', flexDirection: 'column' as const, gap: '15px', maxWidth: '350px' };
const activeBtn = { padding: '15px', background: '#3D46F5', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: '"Arial"', fontWeight: 'bold', letterSpacing: '1px' };
const disabledBtn = { padding: '15px', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.1)', fontFamily: '"Arial"', cursor: 'pointer' };

const storeWrapper = { height: '100%' };
const storeHeader = { display: 'flex', alignItems: 'center', gap: '30px', marginBottom: '30px' };
const backBtn = { background: 'none', border: 'none', color: '#3D46F5', cursor: 'pointer', fontFamily: '"Arial"', fontWeight: 'bold' };
const storeTitle = { margin: 0, fontSize: '24px', letterSpacing: '2px' };
const storeContainer = { height: '80%', overflowY: 'auto' as const };

const footerStyle: React.CSSProperties = { position: 'absolute', bottom: '20px', width: '100%', display: 'flex', justifyContent: 'space-between', padding: '0 50px', fontSize: '10px', color: 'rgba(255,255,255,0.2)', zIndex: 10, boxSizing: 'border-box' };

export default MockGame;