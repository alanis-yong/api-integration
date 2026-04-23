// import React, { useState, useEffect, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Widget } from '@xsolla/login-sdk';

// // --- INTERFACES ---
// interface Item { 
//   id: number; 
//   sku: string;
//   name_en: string; 
//   name_cn: string; 
//   price_usd: number; 
//   price_myr: number;
//   purchase_limit: number;
//   image_url?: string; // Add this line
// }

// interface CartItem extends Item { quantity: number; }

// const LOGIN_PROJECT_ID = "a8a622df-4f2f-463f-9927-0ebc3104d68d";
// const REDIRECT_URI = "http://localhost:5173";

// const Store = () => {
//   const navigate = useNavigate();

//   // --- STATE ---
//   const [token, setToken] = useState<string | null>(() => {
//     const params = new URLSearchParams(window.location.search);
//     const jwt = params.get('token') || localStorage.getItem('token');
//     if (jwt) {
//       localStorage.setItem('token', jwt);
//       // Fixed: Stay on /store after login
//       window.history.replaceState({}, document.title, "/store");
//     }
//     return jwt;
//   });
  
//   const [products, setProducts] = useState<Item[]>([]);
//   const [cart, setCart] = useState<CartItem[]>([]);
//   const [view, setView] = useState<'home' | 'cart'>('home');
//   const [showWidget, setShowWidget] = useState(false);
//   const xlInstance = useRef<any>(null);
//   const [lang, setLang] = useState<'en' | 'cn'>('en');
//   const [currency, setCurrency] = useState<'usd' | 'myr'>('usd');
//   const [isLoading, setIsLoading] = useState(true);

//   // --- XSOLLA LOGIN WIDGET EFFECT ---
//   useEffect(() => {
//     if (!showWidget) return;
//     const timer = setTimeout(() => {
//       if (!xlInstance.current) {
//         xlInstance.current = new Widget({
//           projectId: LOGIN_PROJECT_ID,
//           callbackUrl: REDIRECT_URI,
//           preferredLocale: 'en_US'
//         });
//         xlInstance.current.mount('xsolla-login-widget');
//         xlInstance.current.on('auth', (data: any) => {
//           if (data.token) {
//             localStorage.setItem('token', data.token);
//             setToken(data.token);
//             setShowWidget(false);
//           }
//         });
//       }
//     }, 100);
//     return () => { xlInstance.current = null; clearTimeout(timer); };
//   }, [showWidget]);

//   // --- FETCH PRODUCTS ---
//   useEffect(() => {
//     const fetchProducts = async () => {
//       try {
//         setIsLoading(true);
//         const response = await fetch("http://localhost:8080/api/products");

// const data = await response.json();

// // Update this line to check for "items" as well
// const rawArray = data.items || data.virtual_items || (Array.isArray(data) ? data : []);

// if (rawArray.length > 0) {
//   const mapped = rawArray.map((item: any, index: number) => {
//     // Xsolla API often puts names inside a 'name' object
//     const nameEn = item.name?.en || item.name || "Unknown Item";
//     const nameCn = item.name?.zh || item.name?.cn || nameEn; // 'zh' is common for Chinese in APIs

//     return {
//       id: item.id || index,
//       sku: item.sku,
//       name_en: nameEn,
//       name_cn: nameCn,
//       // Xsolla API structure: item.price.amount
//       price_usd: item.price?.amount || item.price_usd || 0,
//       price_myr: item.price?.amount || item.price_myr || 0,
//       image_url: item.image_url
//     };
//   });
//   setProducts(mapped);
// }
//       } catch (err) {
//         console.error("Fetch failed:", err);
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     fetchProducts();
//   }, []);

//   const addToCart = (item: Item) => {
//     setCart(prev => {
//       const existing = prev.find(i => i.id === item.id);
//       if (existing) return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
//       return [...prev, { ...item, quantity: 1 }];
//     });
//   };

//   const handleCheckout = async () => {
//     console.log("🚀 Checkout Started");

//     if (!token) {
//         console.warn("No token found, showing login widget");
//         setShowWidget(true);
//         return;
//     }

//     const total = cart.reduce((sum, item) => 
//         (currency === 'usd' ? item.price_usd : item.price_myr) * item.quantity + sum, 0
//     );
    
//     if (total <= 0) {
//         alert("Error: Total is $0.00. Please check if items were added correctly.");
//         return;
//     }

//     try {
//         // Decode the JWT to get user details
//         const base64Url = token.split('.')[1];
//         const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
//         const payload = JSON.parse(window.atob(base64));
//         const realUserId = String(payload.sub);
//         const userEmail = payload.email || "user@example.com";

//         const idempotencyKey = crypto.randomUUID(); 

//         // Map cart items for the backend
//         const itemsPayload = cart.map(i => ({
//             sku: i.sku,
//             quantity: i.quantity
//         }));

//         // Request payment token from your Go backend
//         const response = await fetch("http://localhost:8080/api/payments/token", {
//             method: "POST",
//             headers: { 
//                 "Content-Type": "application/json",
//                 "Authorization": `Bearer ${token}`,
//                 "Idempotency-Key": idempotencyKey
//             },
//             body: JSON.stringify({
//                 user_id: realUserId, 
//                 email: userEmail,
//                 amount: parseFloat(total.toFixed(2)),
//                 items: itemsPayload 
//             }),
//         });

//         if (!response.ok) {
//             const errorText = await response.text();
//             throw new Error(`Backend failed: ${errorText}`);
//         }

//         const data = await response.json();
        
//         if (data.token) {
//             console.log("🎟️ Xsolla Token Received:", data.token);
//             const xWidget = (window as any).XPayStationWidget;
//             if (xWidget) {
//                 // INITIALIZE AND OPEN THE ACTUAL WIDGET
//                 xWidget.init({ 
//                     access_token: data.token, 
//                     sandbox: true 
//                 });
//                 xWidget.open();

//                 xWidget.on('close', () => {
//                     console.log("Payment window closed.");
//                 });
//             } else {
//                 alert("Xsolla Pay Station script not found. Please ensure it is in your index.html");
//             }
//         }
//     } catch (err) {
//         console.error("❌ Checkout error:", err);
//         alert(`Checkout failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
//     }
//   };

//   return (
//     <div style={appWrapper}>
//       {/* Cinematic Background Layers */}
//       <div style={videoBackground} />
//       <div style={scanlineOverlay} />

//       <nav style={navbarStyle}>
//         <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
//           {/* Back Arrow Button */}
//           <button onClick={() => navigate('/')} style={backBtn}>
//             ←
//           </button>
//           <div style={brand}>
//             ALANIS' <span style={{ color: '#d4af37' }}>MERCHANT</span>
//           </div>
//         </div>
        
//         <div style={navLinks}>
//           <button onClick={() => setLang(lang === 'en' ? 'cn' : 'en')} style={navBtn}>
//             {lang === 'en' ? '🌐 EN' : '🌐 CN'}
//           </button>
//           <button onClick={() => setCurrency(currency === 'usd' ? 'myr' : 'usd')} style={navBtn}>
//             {currency.toUpperCase()}
//           </button>
//           <button onClick={() => setView('home')} style={view === 'home' ? activeLink : navBtn}>ITEMS</button>
//           <button onClick={() => setView('cart')} style={view === 'cart' ? activeLink : navBtn}>CART ({cart.length})</button>
//           <button onClick={token ? () => {localStorage.clear(); setToken(null)} : () => setShowWidget(true)} style={goldBtn}>
//             {token ? "LOGOUT" : "LOGIN"}
//           </button>
//         </div>
//       </nav>

//       <main style={mainContent}>
//         {view === 'home' ? (
//           <div>
//             <h1 style={sectionTitle}>ROYAL INVENTORY</h1>
//             <div style={gridStyle}>
//               {products.map(item => (
//                 <div key={item.id} style={cardStyle}>
//   <div>
//     {/* ADD THE IMAGE HERE */}
//     {item.image_url && (
//       <img 
//         src={item.image_url} 
//         alt={item.name_en} 
//         style={{ width: '120px', height: '120px', marginBottom: '20px', objectFit: 'contain' }} 
//       />
//     )}
    
//     <h3 style={itemTitle}>{lang === 'en' ? item.name_en : item.name_cn}</h3>
//     <p style={priceStyle}>
//       {currency === 'usd' 
//   ? `$${Number(item.price_usd || 0).toFixed(2)}` 
//   : `RM${Number(item.price_myr || 0).toFixed(2)}`}
//     </p>
//   </div>
//   <button onClick={() => addToCart(item)} style={buyBtn}>ADD TO CART</button>
// </div>
//               ))}
//             </div>
//           </div>
//         ) : (
//           <div style={{ maxWidth: '800px', margin: '0 auto' }}>
//             <h1 style={sectionTitle}>YOUR SELECTIONS</h1>
//             {cart.length === 0 ? <p style={{color: '#8d99ae'}}>Your vault is empty.</p> : (
//               <div>
//                 {cart.map(item => (
//                   <div key={item.id} style={cartRow}>
//                     <span>{lang === 'en' ? item.name_en : item.name_cn} (x{item.quantity})</span>
//                     <span style={{color: '#d4af37'}}>
//                       {currency === 'usd' ? '$' : 'RM'}
//                       {((currency === 'usd' ? item.price_usd : item.price_myr) * item.quantity).toFixed(2)}
//                     </span>
//                   </div>
//                 ))}
//                 <div style={{ textAlign: 'right', marginTop: '40px' }}>
//                   <h2 style={{ letterSpacing: '4px', marginBottom: '20px' }}>
//                     TOTAL: <span style={{color: '#d4af37'}}>
//                       {currency === 'usd' ? '$' : 'RM'}
//                       {cart.reduce((sum, item) => sum + ((currency === 'usd' ? item.price_usd : item.price_myr) * item.quantity), 0).toFixed(2)}
//                     </span>
//                   </h2>
//                   <button onClick={handleCheckout} style={checkoutBtn}>
//                     INITIATE TRANSACTION
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>
//         )}
//       </main>

//       {showWidget && (
//         <div style={modalOverlay}>
//           <div style={modalContent}>
//              <div id="xsolla-login-widget" style={{ width: '400px', height: '550px' }}></div>
//              <button onClick={() => setShowWidget(false)} style={closeBtn}>CLOSE</button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// // --- ASTRUM THEME STYLES ---
// const appWrapper: React.CSSProperties = { height: '100vh', width: '100%', background: '#020205', color: '#f4ebd0', fontFamily: '"Cinzel", serif', overflowY: 'auto', position: 'fixed', top: 0, left: 0 };
// const videoBackground: React.CSSProperties = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundImage: `url('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2000')`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.15, zIndex: 1 };
// const scanlineOverlay: React.CSSProperties = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%), radial-gradient(circle, transparent 20%, #000 100%)', zIndex: 2, pointerEvents: 'none' };
// const navbarStyle: React.CSSProperties = { position: 'sticky', top: 0, zIndex: 10, height: '90px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 60px', borderBottom: '1px solid rgba(212, 175, 55, 0.2)', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)' };
// const brand: React.CSSProperties = { fontSize: '20px', fontWeight: 'bold', letterSpacing: '4px', color: '#f4ebd0' };
// const backBtn = { background: 'none', border: '1px solid #d4af37', color: '#d4af37', fontSize: '20px', cursor: 'pointer', padding: '5px 15px', borderRadius: '4px' };
// const navLinks = { display: 'flex', gap: '25px', alignItems: 'center' };
// const navBtn: React.CSSProperties = { background: 'none', border: 'none', color: '#8d99ae', cursor: 'pointer', fontSize: '14px', letterSpacing: '2px', fontFamily: '"Cinzel", serif' };
// const activeLink = { ...navBtn, color: '#d4af37', borderBottom: '1px solid #d4af37' };
// const goldBtn = { background: '#d4af37', color: '#000', border: 'none', padding: '10px 20px', fontWeight: 'bold', cursor: 'pointer', letterSpacing: '1px', fontFamily: '"Cinzel", serif' };
// const mainContent: React.CSSProperties = { position: 'relative', zIndex: 10, padding: '60px' };
// const sectionTitle = { fontSize: '32px', letterSpacing: '8px', marginBottom: '40px', textAlign: 'center' as const, color: '#d4af37' };
// const gridStyle = { 
//   display: 'grid', 
//   gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
//   gap: '30px',
//   alignItems: 'stretch' 
// };
// const cardStyle: React.CSSProperties = { 
//   background: 'rgba(255,255,255,0.03)', 
//   border: '1px solid rgba(212,175,55,0.1)', 
//   padding: '40px', 
//   textAlign: 'center',
//   // ADD THESE FOUR LINES:
//   display: 'flex',
//   flexDirection: 'column',
//   justifyContent: 'space-between', // Pushes content apart
//   height: '100%'                  // Ensures all cards are equal height
// };
// const itemTitle = { 
//   fontSize: '18px', 
//   letterSpacing: '2px', 
//   marginBottom: '15px',
//   minHeight: '50px', // Ensures even 1-line titles take up 2-line space
//   display: 'flex',
//   alignItems: 'center',
//   justifyContent: 'center'
// };
// const priceStyle = { 
//   fontSize: '24px', 
//   color: '#d4af37', 
//   marginBottom: '25px',
//   marginTop: 'auto' // This is the secret—it pushes the price to a consistent spot
// };
// const buyBtn = { width: '100%', padding: '12px', background: 'none', border: '1px solid #d4af37', color: '#d4af37', cursor: 'pointer', fontWeight: 'bold', letterSpacing: '2px', fontFamily: '"Cinzel", serif' };
// const checkoutBtn = { padding: '20px 50px', background: '#d4af37', color: '#000', border: 'none', fontWeight: 'bold', fontSize: '18px', cursor: 'pointer', letterSpacing: '3px', fontFamily: '"Cinzel", serif' };
// const cartRow = { display: 'flex', justifyContent: 'space-between', padding: '20px 0', borderBottom: '1px solid rgba(212,175,55,0.1)', fontSize: '18px' };
// const modalOverlay: React.CSSProperties = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
// const modalContent: React.CSSProperties = { background: '#1a1a1a', padding: '20px', borderRadius: '8px', border: '1px solid #d4af37' };
// const closeBtn = { width: '100%', marginTop: '10px', background: '#333', color: '#fff', border: 'none', padding: '10px', cursor: 'pointer' };

// export default Store;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// --- INTERFACES ---
interface Item { 
  id: number; 
  sku: string;
  name_en: string; 
  name_cn: string; 
  description_en: string; 
  description_cn: string;
  price_usd: number; 
  price_myr: number;
  image_url?: string;
}
interface CartItem extends Item { quantity: number; }

const Store = () => {
  const navigate = useNavigate();

  // --- STATE ---
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [products, setProducts] = useState<Item[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [view, setView] = useState<'home' | 'cart'>('home');
  const [lang, setLang] = useState<'en' | 'cn'>('en');
  const [currency, setCurrency] = useState<'usd' | 'myr'>('usd');
  const [isLoading, setIsLoading] = useState(true);

  // --- FETCH PRODUCTS FROM API ---
//   useEffect(() => {
//     const fetchProducts = async () => {
//       try {
//         setIsLoading(true);
//         const response = await fetch("http://localhost:8080/api/products");
//         const data = await response.json();
//         const rawArray = data.items || data.virtual_items || (Array.isArray(data) ? data : []);

//         if (rawArray.length > 0) {
//           const mapped = rawArray.map((item: any, index: number) => {
//   // 1. Get English Name
//   const nameEn = item.name?.en || item.name || "Unknown Item";

//   // 2. Get Chinese Name (Updated to check your backend field)
//   // This checks: item.name_cn (Go) -> item.name.zh (Xsolla) -> item.name.cn (Xsolla) -> fallback to English
//   const nameCn = item.name_cn || item.name?.zh || item.name?.cn || nameEn;

//   // 3. Handle Price (Keep your current logic or adjust for MYR)
//   const price = item.price?.amount || item.price || 0;

//   return {
//     id: item.id || index,
//     sku: item.sku,
//     name_en: nameEn,
//     name_cn: nameCn, // <--- This will now correctly hold the translation
//     price_usd: price,
//     price_myr: currency === 'myr' ? price * 4.7 : price, // Example conversion if needed
//     image_url: item.image_url
//   };
// });
//           setProducts(mapped);
//         }
//       } catch (err) {
//         console.error("Fetch failed:", err);
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     fetchProducts();
//   }, []);

useEffect(() => {
  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      // Fetch with the current language state
      const response = await fetch(`http://localhost:8080/api/products?lang=${lang}`);
      const data = await response.json();
      
      const rawArray = data.items || data.virtual_items || (Array.isArray(data) ? data : []);

      if (rawArray.length > 0) {
        // In Store.tsx useEffect
const mapped = rawArray.map((item: any, index: number) => {
  // Safe helper for Name
  const displayName = typeof item.name === 'string' 
    ? item.name 
    : (item.name?.cn || item.name?.en || "Unknown Item");

  // Safe helper for Description
  const displayDesc = typeof item.description === 'string' 
    ? item.description 
    : (item.description?.cn || item.description?.en || "");

  return {
    id: item.id || index,
    sku: item.sku,
    name_en: lang === 'en' ? displayName : item.name_en,
    name_cn: lang === 'cn' ? displayName : item.name_cn,
    // Add these two lines to store the description
    description_en: lang === 'en' ? displayDesc : item.description_en,
    description_cn: lang === 'cn' ? displayDesc : item.description_cn,
    price_usd: item.price?.amount || 0,
    price_myr: currency === 'myr' ? (item.price?.amount || 0) * 4.7 : (item.price?.amount || 0),
    image_url: item.image_url
  };
});
        setProducts(mapped);
      }
    } catch (err) {
      console.error("Fetch failed:", err);
    } finally {
      setIsLoading(false);
    }
  };
  fetchProducts();
}, [lang]); // <--- This triggers the re-fetch

  const addToCart = (item: Item) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const handleCheckout = async () => {
    if (!token) {
        alert("ACCESS DENIED: Please login through the Game Portal first.");
        navigate('/');
        return;
    }

    const total = cart.reduce((sum, item) => 
        (currency === 'usd' ? Number(item.price_usd) : Number(item.price_myr)) * item.quantity + sum, 0
    );
    
    if (total <= 0) {
        alert("Your cart is empty or values are invalid.");
        return;
    }

    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        
        // --- ADDED: A unique key for this specific transaction ---
        const idempotencyKey = crypto.randomUUID();

        const response = await fetch("http://localhost:8080/api/payments/token", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
                "Idempotency-Key": idempotencyKey // --- ADDED: Professional standard header ---
            },
            body: JSON.stringify({
                user_id: String(payload.sub), 
                email: payload.email || "traveler@astrum.com",
                amount: Number(total.toFixed(2)), // Ensure it's a Number type
                currency: currency.toUpperCase(), // --- ADDED: Backend needs to know if it's USD or MYR ---
                items: cart.map(i => ({ 
                    sku: i.sku, 
                    quantity: Number(i.quantity) 
                }))
            }),
        });

        // --- DEBUGGING: If it fails, let's see why ---
        if (!response.ok) {
            const errorDetail = await response.text();
            console.error("Backend Error Detail:", errorDetail);
            alert(`Backend Error: ${errorDetail}`);
            return;
        }

        const data = await response.json();
        if (data.token) {
            console.log("🎟️ Access Token Received:", data.token);
            const xWidget = (window as any).XPayStationWidget;
            if (xWidget) {
                xWidget.init({ access_token: data.token, sandbox: true });
                xWidget.open();
            } else {
                alert("Xsolla Pay Station script not loaded. Check your index.html!");
            }
        }
    } catch (err) {
        console.error("Checkout failed:", err);
        alert("Checkout failed. Check the console for details.");
    }
};

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    navigate('/');
  };

  return (
    <div style={appWrapper}>
      <div style={videoBackground} />
      <div style={scanlineOverlay} />

      <nav style={navbarStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button onClick={() => navigate('/')} style={backBtn}>←</button>
          <div style={brand}><span style={{ color: '#d4af37' }}>THE ROYAL TREASURY</span></div>
        </div>
        
        <div style={navLinks}>
          <button onClick={() => setLang(lang === 'en' ? 'cn' : 'en')} style={navBtn}>
            {lang === 'en' ? '🌐 EN' : '🌐 CN'}
          </button>
          <button onClick={() => setCurrency(currency === 'usd' ? 'myr' : 'usd')} style={navBtn}>
            {currency.toUpperCase()}
          </button>
          <button onClick={() => setView('home')} style={view === 'home' ? activeLink : navBtn}>ITEMS</button>
          <button onClick={() => setView('cart')} style={view === 'cart' ? activeLink : navBtn}>CART ({cart.length})</button>
          <button onClick={handleLogout} style={token ? logoutBtn : goldBtn}>
            {token ? "LOGOUT" : "LOGIN REQUIRED"}
          </button>
        </div>
      </nav>

      <main style={mainContent}>
        {isLoading ? <p style={sectionTitle}>LOADING STORE...</p> : 
         view === 'home' ? (
          <div>
            <h1 style={sectionTitle}>AVAILABLE TREASURES</h1>
            <div style={gridStyle}>
              {products.map(item => (
  <div key={item.id} style={cardStyle}>
    <div>
      {item.image_url && (
        <img src={item.image_url} alt={item.name_en} style={itemImage} />
      )}
      <h3 style={itemTitle}>{lang === 'en' ? item.name_en : item.name_cn}</h3>
      
      {/* --- ADD THIS NEW BLOCK --- */}
      <p style={descStyle}>
        {lang === 'en' ? item.description_en : item.description_cn}
      </p>
      {/* --------------------------- */}

      <p style={priceStyle}>
        {currency === 'usd' ? `$${Number(item.price_usd).toFixed(2)}` : `RM${Number(item.price_myr).toFixed(2)}`}
      </p>
    </div>
    <button onClick={() => addToCart(item)} style={buyBtn}>ADD TO CART</button>
  </div>
))}
            </div>
          </div>
        ) : (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={sectionTitle}>YOUR SELECTIONS</h1>
            {cart.length === 0 ? <p style={{color: '#8d99ae'}}>Your cart is empty.</p> : (
              <div>
                {cart.map(item => (
                  <div key={item.id} style={cartRow}>
                    <span>{lang === 'en' ? item.name_en : item.name_cn} (x{item.quantity})</span>
                    <span style={{color: '#d4af37'}}>
                      {currency === 'usd' ? '$' : 'RM'}
                      {((currency === 'usd' ? Number(item.price_usd) : Number(item.price_myr)) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
                <div style={{ textAlign: 'right', marginTop: '40px' }}>
                  <h2 style={{ letterSpacing: '4px' }}>TOTAL: <span style={{color: '#d4af37'}}>
                    {currency === 'usd' ? '$' : 'RM'}
                    {cart.reduce((sum, item) => sum + ((currency === 'usd' ? Number(item.price_usd) : Number(item.price_myr)) * item.quantity), 0).toFixed(2)}
                  </span></h2>
                  <button onClick={handleCheckout} style={checkoutBtn}>INITIATE TRANSACTION</button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

// --- STYLES ---
const appWrapper: React.CSSProperties = { height: '100vh', width: '100%', background: '#020205', color: '#f4ebd0', fontFamily: '"Cinzel", serif', overflowY: 'auto', position: 'fixed', top: 0, left: 0 };
const videoBackground: React.CSSProperties = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundImage: `url('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2000')`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.15, zIndex: 1 };
const scanlineOverlay: React.CSSProperties = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%), radial-gradient(circle, transparent 20%, #000 100%)', zIndex: 2, pointerEvents: 'none' };
const navbarStyle: React.CSSProperties = { 
  position: 'sticky', 
  top: 0, 
  zIndex: 1000, // <--- Change this from 10 to 1000
  height: '90px', 
  display: 'flex', 
  justifyContent: 'space-between', 
  alignItems: 'center', 
  padding: '0 60px', 
  borderBottom: '1px solid rgba(212, 175, 55, 0.2)', 
  background: 'rgba(0,0,0,0.9)', 
  backdropFilter: 'blur(10px)' 
};
const brand: React.CSSProperties = { fontSize: '20px', fontWeight: 'bold', letterSpacing: '4px', color: '#f4ebd0' };
const backBtn = { background: 'none', border: '1px solid #d4af37', color: '#d4af37', fontSize: '20px', cursor: 'pointer', padding: '5px 15px', borderRadius: '4px' };
const navLinks = { display: 'flex', gap: '25px', alignItems: 'center' };
const navBtn: React.CSSProperties = { background: 'none', border: 'none', color: '#8d99ae', cursor: 'pointer', fontSize: '14px', letterSpacing: '2px', fontFamily: '"Cinzel", serif' };
const activeLink = { ...navBtn, color: '#d4af37', borderBottom: '1px solid #d4af37' };
const goldBtn = { background: '#d4af37', color: '#000', border: 'none', padding: '10px 20px', fontWeight: 'bold', cursor: 'pointer', letterSpacing: '1px', fontFamily: '"Cinzel", serif' };
const logoutBtn = { ...goldBtn, background: 'transparent', color: '#d4af37', border: '1px solid #d4af37' };
const mainContent: React.CSSProperties = { position: 'relative', zIndex: 10, padding: '60px' };
const sectionTitle = { fontSize: '32px', letterSpacing: '8px', marginBottom: '40px', textAlign: 'center' as const, color: '#d4af37' };
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px', alignItems: 'stretch' };
const cardStyle: React.CSSProperties = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(212,175,55,0.1)', padding: '40px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' };
const itemImage = { width: '120px', height: '120px', marginBottom: '20px', objectFit: 'contain' as const, margin: '0 auto 20px auto' };
const itemTitle = { fontSize: '18px', letterSpacing: '2px', marginBottom: '15px', minHeight: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const descStyle: React.CSSProperties = {
  fontSize: '12.5px',        // Slightly smaller for a "fine print" legendary feel
  color: '#a0a0a0',          // Muted silver so it doesn't distract from the title
  lineHeight: '1.4',         // Tighter spacing to keep the card height under control
  marginBottom: '20px',
  minHeight: '80px',         // Increased slightly to ensure cards stay aligned with full text
  textAlign: 'center',
  fontFamily: 'serif',       // Keeping it consistent with your Cinzel/Royal theme
  fontStyle: 'italic',       // Optional: makes descriptions feel like "lore"
};
const priceStyle = { fontSize: '24px', color: '#d4af37', marginBottom: '25px', marginTop: 'auto' };
const buyBtn = { width: '100%', padding: '12px', background: 'none', border: '1px solid #d4af37', color: '#d4af37', cursor: 'pointer', fontWeight: 'bold', letterSpacing: '2px', fontFamily: '"Cinzel", serif' };
const checkoutBtn = { padding: '20px 50px', background: '#d4af37', color: '#000', border: 'none', fontWeight: 'bold', fontSize: '18px', cursor: 'pointer', letterSpacing: '3px', fontFamily: '"Cinzel", serif' };
const cartRow = { display: 'flex', justifyContent: 'space-between', padding: '20px 0', borderBottom: '1px solid rgba(212,175,55,0.1)', fontSize: '18px' };

export default Store;