import React, { useState, useEffect, useRef } from 'react';
import { Widget } from '@xsolla/login-sdk';

// --- INTERFACES ---
interface Item { 
  id: number; 
  sku: string;
  name_en: string; 
  name_cn: string; 
  price_usd: number; 
  price_myr: number;
  purchase_limit: number;
}
interface CartItem extends Item { quantity: number; }

const LOGIN_PROJECT_ID = "a8a622df-4f2f-463f-9927-0ebc3104d68d";
const REDIRECT_URI = "http://localhost:5173";

const Store = () => {
  // --- STATE ---
  const [token, setToken] = useState<string | null>(() => {
    const jwt = new URLSearchParams(window.location.search).get('token') || localStorage.getItem('token');
    if (jwt) {
      localStorage.setItem('token', jwt);
      window.history.replaceState({}, document.title, "/");
    }
    return jwt;
  });
  
  // Starting with Demo Data so the UI isn't blank while loading
  const [products, setProducts] = useState<Item[]>([
    {
      id: 1,
      sku: "gold_sword",
      name_en: "Gold Sword (Demo)",
      name_cn: "金剑",
      price_usd: 10.00,
      price_myr: 45.00,
      purchase_limit: 0
    }
  ]);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [view, setView] = useState<'home' | 'cart'>('home');
  const [showWidget, setShowWidget] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const xlInstance = useRef<any>(null);
  const [lang, setLang] = useState<'en' | 'cn'>('en');
  const [currency, setCurrency] = useState<'usd' | 'myr'>('usd');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
  if (!showWidget) return;

  // Small timeout to ensure the DOM element #xsolla-login-widget exists
  const timer = setTimeout(() => {
    if (!xlInstance.current) {
      xlInstance.current = new Widget({
        projectId: LOGIN_PROJECT_ID,
        callbackUrl: REDIRECT_URI,
        preferredLocale: 'en_US'
      });

      // Mount the widget to the div in your modal
      xlInstance.current.mount('xsolla-login-widget');

      // Listen for the successful login event
      xlInstance.current.on('auth', (data: any) => {
        if (data.token) {
          console.log("🔑 Login Successful, Token acquired");
          localStorage.setItem('token', data.token);
          setToken(data.token);
          setShowWidget(false); // Close the modal
        }
      });
    }
  }, 100);

  return () => {
    xlInstance.current = null;
    clearTimeout(timer);
  };
}, [showWidget]);

  // --- FETCH PRODUCTS FROM GO BACKEND ---
  useEffect(() => {
  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("http://localhost:8080/api/products");
      const data = await response.json();
      
      console.log("RAW BACKEND DATA:", data); // Check this in the console!

      // Extract the array correctly
      const rawArray = data.virtual_items || (Array.isArray(data) ? data : []);

      if (rawArray.length > 0) {
        const mapped = rawArray.map((item: any, index: number) => ({
  id: item.id || index,
  sku: item.sku,
  // Use bracket notation for keys with dashes
  name_en: item['name-en'] || (item.name?.en) || item.name_en || "Unknown Item",
  name_cn: item['name-cn'] || (item.name?.cn) || item.name_cn || "未知物品",
  
  // Ensure we grab the price from the backend field names
  price_usd: item.price_usd || item.prices?.find((p: any) => p.currency === 'USD' && p.is_default)?.amount || 0,
            price_myr: item.price_myr || item.prices?.find((p: any) => p.currency === 'MYR')?.amount || 0,
          }));

        setProducts(mapped); // THIS replaces the gold sword
      } else {
        console.warn("Backend returned an empty list of products.");
      }
    } catch (err) {
      console.error("Fetch failed:", err);
    } finally {
      setIsLoading(false);
    }
  };
  fetchProducts();
}, []);

  // --- ACTIONS ---
  const addToCart = (item: Item) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const handleLogout = () => {
    localStorage.clear();
    setToken(null);
    setView('home');
  };

  const handleCheckout = async () => {
    console.log("🚀 Checkout Started");

    if (!token) {
        console.warn("No token found, showing login widget");
        setShowWidget(true);
        return;
    }

    const total = cart.reduce((sum, item) => 
        (currency === 'usd' ? item.price_usd : item.price_myr) * item.quantity + sum, 0
    );
    
    if (total <= 0) {
        alert("Error: Total is $0.00. Please check if backend prices are seeded correctly.");
        return;
    }

    try {
        // Decode the JWT safely
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        const realUserId = String(payload.sub);
        const userEmail = payload.email || "alanis@example.com";

        const idempotencyKey = crypto.randomUUID(); 

        // --- FIX 1: Map cart to an array of objects for the Xsolla Schema ---
        const itemsPayload = cart.map(i => ({
            sku: i.sku,
            quantity: i.quantity
        }));

        const response = await fetch("http://localhost:8080/api/payments/token", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
                "Idempotency-Key": idempotencyKey
            },
            body: JSON.stringify({
                user_id: realUserId, 
                email: userEmail,
                amount: parseFloat(total.toFixed(2)), // Ensure float format
                items: itemsPayload // --- FIX 2: Send array, not string ---
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Backend failed: ${errorText}`);
        }

        const data = await response.json();
        
        if (data.token) {
    console.log("🎟️ Xsolla Token Received:", data.token);
    const xWidget = (window as any).XPayStationWidget;
    if (xWidget) {
        xWidget.init({ 
            access_token: data.token, 
            sandbox: true 
        });
        xWidget.open();

        xWidget.on('close', () => {
            console.log("Payment window closed.");
            // REMOVED fetchInventory(token); line here to fix the error
        });
    } else {
        alert("Xsolla Pay Station script not found.");
    }
}
    } catch (err) {
        console.error("❌ Checkout error:", err);
        alert(`Checkout failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
};

  // --- UI RENDERING ---
  return (
    <div style={{ ...pageStyle, backgroundColor: isDarkMode ? '#1a1a1a' : '#f9f9f9', color: isDarkMode ? '#fff' : '#000' }}>
      <nav style={navStyle}>
        <h2 onClick={() => setView('home')} style={{ cursor: 'pointer', margin: 0 }}>Alanis' Store</h2>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <button onClick={() => setIsDarkMode(!isDarkMode)} style={navBtnStyle}>{isDarkMode ? '🌙 Dark' : '☀️ Light'}</button>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setLang(lang === 'en' ? 'cn' : 'en')} style={navBtnStyle}>
              {lang === 'en' ? '🌐 EN' : '🌐 CN'}
            </button>
            <button onClick={() => setCurrency(currency === 'usd' ? 'myr' : 'usd')} style={navBtnStyle}>
              {currency.toUpperCase()}
            </button>
          </div>
          <button onClick={() => setView('home')} style={navBtnStyle}>Home</button>
          <button onClick={() => setView('cart')} style={navBtnStyle}>Cart ({cart.length})</button>
          <button onClick={token ? handleLogout : () => setShowWidget(true)} style={loginBtnStyle}>
            {token ? "Logout" : "Login"}
          </button>
        </div>
      </nav>

      {showWidget && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <span style={{ color: '#000', fontWeight: 'bold' }}>Login</span>
              <button onClick={() => setShowWidget(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>✕ Close</button>
            </div>
            <div id="xsolla-login-widget" style={{ width: '400px', height: '550px' }}></div>
          </div>
        </div>
      )}

      <div style={{ padding: '40px' }}>
        {isLoading && products.length === 1 && products[0].sku === "gold_sword" && (
           <div style={{ textAlign: 'center', marginBottom: '20px', opacity: 0.7 }}>
             Refreshing items from backend...
           </div>
        )}

        {view === 'home' ? (
          <div>
            <h1>Featured Items</h1>
            <div style={gridStyle}>
              {products.map(item => (
                <div key={item.id} style={{ ...cardStyle, backgroundColor: isDarkMode ? '#2d2d2d' : '#fff' }}>
                  <h3>{lang === 'en' ? item.name_en : item.name_cn}</h3>
                  <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                    {currency === 'usd' ? `$${item.price_usd.toFixed(2)}` : `RM${item.price_myr.toFixed(2)}`}
                  </p>
                  {item.purchase_limit > 0 && (
                    <p style={{ fontSize: '0.8rem', color: '#ff4d4f' }}>Limit: {item.purchase_limit} per user</p>
                  )}
                  <button onClick={() => addToCart(item)} style={buyBtnStyle}>Add to Cart</button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h1>Your Cart</h1>
            {cart.length === 0 ? <p>Your cart is empty.</p> : (
              <div>
                {cart.map(item => {
                  const currentPrice = currency === 'usd' ? item.price_usd : item.price_myr;
                  return (
                    <div key={item.id} style={cartRow}>
                      <span>{lang === 'en' ? item.name_en : item.name_cn} (x{item.quantity})</span>
                      <span>
                        {currency === 'usd' ? '$' : 'RM'}
                        {(currentPrice * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  );
                })}
                <div style={{ textAlign: 'right', marginTop: '20px' }}>
                  <h3>
                    Total: {currency === 'usd' ? '$' : 'RM'}
                    {cart.reduce((sum, item) => {
                      const p = currency === 'usd' ? item.price_usd : item.price_myr;
                      return sum + (p * item.quantity);
                    }, 0).toFixed(2)}
                  </h3>
                  <button onClick={handleCheckout} style={{ ...buyBtnStyle, width: 'auto', padding: '12px 30px' }}>
                    💳 Proceed to {currency.toUpperCase()} Payment
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// --- STYLES ---
// const pageStyle: React.CSSProperties = { minHeight: '100vh', transition: '0.3s' };
// const navStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', padding: '0 40px', alignItems: 'center', height: '70px', borderBottom: '1px solid #ddd' };
// Inside Store.tsx
const pageStyle: React.CSSProperties = { 
  minHeight: '100vh', 
  transition: '0.3s',
  background: 'transparent', // Change from #f9f9f9 to transparent
  color: '#fff'              // Force text to white
};

const navStyle: React.CSSProperties = { 
  display: 'flex', 
  justifyContent: 'space-between', 
  padding: '0 40px', 
  alignItems: 'center', 
  height: '70px', 
  borderBottom: '1px solid rgba(255,255,255,0.1)', // Light border instead of dark
  background: 'rgba(0,0,0,0.4)',                   // Semi-transparent dark nav
  backdropFilter: 'blur(10px)'                     // This creates the "Pro" glass effect
};
const navBtnStyle = { background: 'none', border: 'none', cursor: 'pointer', padding: '8px 12px', color: 'inherit' };
const loginBtnStyle = { backgroundColor: '#3D46F5', color: 'white', padding: '10px 20px', borderRadius: '6px', border: 'none', cursor: 'pointer' };
const modalOverlay: React.CSSProperties = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalContent: React.CSSProperties = { backgroundColor: 'white', padding: '25px', borderRadius: '12px' };
const vaultStyle = { padding: '20px', borderRadius: '12px', marginBottom: '30px', border: '1px solid #3D46F5' };
const vaultItemStyle = { padding: '10px 15px', background: '#3D46F5', color: 'white', borderRadius: '8px' };
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' };
const cardStyle: React.CSSProperties = { border: '1px solid #ddd', padding: '20px', borderRadius: '12px', textAlign: 'center' };
const buyBtnStyle = { backgroundColor: '#3D46F5', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', width: '100%', fontWeight: 'bold' };
const cartRow = { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' };

export default Store;