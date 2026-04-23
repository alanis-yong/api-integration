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
  const [view, setView] = useState<'home' | 'cart'| 'inventory'>('home');
  const [lang, setLang] = useState<'en' | 'cn'>('en');
  const [currency, setCurrency] = useState<'usd' | 'myr'>('usd');
  const [isLoading, setIsLoading] = useState(true);
const [inventory, setInventory] = useState<{sku: string, quantity: number}[]>([]);

useEffect(() => {
  if (view === 'inventory' && token) {
    const fetchInventory = async () => {
      try {
        const response = await fetch(`https://checkout-api-6yuf.onrender.com/api/inventory`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        
        // FIX: If data is already an array, use it directly. 
        // If it's an object with an 'items' key, use that.
        if (Array.isArray(data)) {
          setInventory(data);
        } else if (data && data.items) {
          setInventory(data.items);
        } else {
          setInventory([]);
        }
      } catch (err) {
        console.error("Failed to fetch inventory:", err);
        setInventory([]);
      }
    };
    fetchInventory();
  }
}, [view, token]);

  // Helper to get UserID from JWT
  const getUserId = () => {
    if (!token) return null;
    try {
      const payload = JSON.parse(window.atob(token.split('.')[1]));
      return String(payload.sub);
    } catch (e) {
      return null;
    }
  };

  // --- 1. LOAD CART FROM BACKEND ON LOGIN ---
  useEffect(() => {
    const loadCartFromDB = async () => {
      const userId = getUserId();
      if (!userId || products.length === 0) return;

      try {
        const response = await fetch(`https://checkout-api-6yuf.onrender.com/api/cart?user_id=${userId}`);
        const dbCartItems: { sku: string; quantity: number }[] = await response.json();

        // Match SKUs from DB with full Product info from Catalog
        const fullCart = dbCartItems.map(dbItem => {
          const product = products.find(p => p.sku === dbItem.sku);
          return product ? { ...product, quantity: dbItem.quantity } : null;
        }).filter((item): item is CartItem => item !== null);

        setCart(fullCart);
      } catch (err) {
        console.error("Failed to sync cart:", err);
      }
    };

    loadCartFromDB();
  }, [token, products]);

  // --- 2. FETCH PRODUCTS ---
  useEffect(() => {
  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`https://checkout-api-6yuf.onrender.com/api/products?lang=${lang}`);
      const data = await response.json();
      
      // Xsolla often returns items inside 'items' or 'virtual_items'
      const rawArray = data.items || data.virtual_items || (Array.isArray(data) ? data : []);

      if (rawArray.length > 0) {
        const mapped = rawArray.map((item: any, index: number) => {
  // Check for 'cn' key first, then 'zh', then 'en'
  const nameStr = typeof item.name === 'object' 
    ? (item.name.cn || item.name.zh || item.name.en) 
    : (item.name || "Unknown");

  const descStr = typeof item.description === 'object' 
    ? (item.description.cn || item.description.zh || item.description.en) 
    : (item.description || "");

  const basePrice = item.price?.amount || (typeof item.price === 'number' ? item.price : 0);

  return {
    id: item.id || index,
    sku: item.sku,
    // We set both to the translated string we just got
    name_en: nameStr,
    name_cn: nameStr, 
    description_en: descStr,
    description_cn: descStr,
    price_usd: basePrice,
    price_myr: basePrice * 4.7,
    image_url: item.image_url || item.image
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
}, [lang]);

  // --- 3. SYNC ACTIONS TO BACKEND ---
  const syncToBackend = async (sku: string, delta: number) => {
    const userId = getUserId();
    if (!userId) return;

    await fetch("https://checkout-api-6yuf.onrender.com/api/cart/update", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({ user_id: userId, sku, delta })
    });
  };

  const addToCart = (item: Item) => {
    setCart(prev => {
      const existing = prev.find(i => i.sku === item.sku);
      if (existing) return prev.map(i => i.sku === item.sku ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...item, quantity: 1 }];
    });
    syncToBackend(item.sku, 1);
  };

  const updateQuantity = (sku: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.sku === sku) return { ...item, quantity: item.quantity + delta };
        return item;
      }).filter(i => i.quantity > 0);
    });
    syncToBackend(sku, delta);
  };

  const clearCart = async () => {
    if (!window.confirm("Empty your selection?")) return;
    const userId = getUserId();
    setCart([]);
    if (userId) {
      await fetch(`https://checkout-api-6yuf.onrender.com/api/cart/clear?user_id=${userId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
    }
  };

  const handleCheckout = async () => {
    if (!token) {
        alert("ACCESS DENIED: Please login through the Game Portal first.");
        navigate('/');
        return;
    }
    const total = cart.reduce((sum, item) => (currency === 'usd' ? Number(item.price_usd) : Number(item.price_myr)) * item.quantity + sum, 0);
    if (total <= 0) return;

    try {
        const userId = getUserId();
        const response = await fetch("https://checkout-api-6yuf.onrender.com/api/payments/token", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}`, "Idempotency-Key": crypto.randomUUID() },
            body: JSON.stringify({
                user_id: userId, 
                amount: Number(total.toFixed(2)),
                currency: currency.toUpperCase(),
                items: cart.map(i => ({ sku: i.sku, quantity: i.quantity }))
            }),
        });

        const data = await response.json();
        if (data.token) {
            const xWidget = (window as any).XPayStationWidget;
            if (xWidget) {
                xWidget.init({ access_token: data.token, sandbox: true });
                xWidget.open();
            }
        }
    } catch (err) {
        console.error("Checkout failed:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setCart([]);
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
          <button onClick={() => setView('inventory')} style={view === 'inventory' ? activeLink : navBtn}>
  INVENTORY
</button>
          <button onClick={() => setView('cart')} style={view === 'cart' ? activeLink : navBtn}>CART ({cart.length})</button>
          <button onClick={handleLogout} style={token ? logoutBtn : goldBtn}>
            {token ? "LOGOUT" : "LOGIN REQUIRED"}
          </button>
        </div>
      </nav>

      <main style={mainContent}>
  {isLoading ? <p style={sectionTitle}>LOADING STORE...</p> : 
    view === 'home' ? (
      /* --- HOME VIEW (Treasures) --- */
      <div>
        <h1 style={sectionTitle}>AVAILABLE TREASURES</h1>
        <div style={gridStyle}>
          {products.map(item => (
            <div key={item.sku} style={cardStyle}>
              <div>
                {item.image_url && <img src={item.image_url} alt={item.name_en} style={itemImage} />}
                <h3 style={itemTitle}>{lang === 'en' ? item.name_en : item.name_cn}</h3>
                <p style={descStyle}>{lang === 'en' ? item.description_en : item.description_cn}</p>
                <p style={priceStyle}>
                  {currency === 'usd' ? `$${Number(item.price_usd).toFixed(2)}` : `RM${Number(item.price_myr).toFixed(2)}`}
                </p>
              </div>
              <button onClick={() => addToCart(item)} style={buyBtn}>ADD TO CART</button>
            </div>
          ))}
        </div>
      </div>
    ) : view === 'inventory' ? (
      /* --- INVENTORY VIEW (New) --- */
      <div>
        <h1 style={sectionTitle}>YOUR ARMORY</h1>
        {inventory.length === 0 ? (
          <p style={{color: '#8d99ae', textAlign: 'center'}}>Your armory is currently empty.</p>
        ) : (
          <div style={gridStyle}>
            {inventory.map(invItem => {
              // Match backend SKU with catalog details for image/names
              const details = products.find(p => p.sku === invItem.sku);
              return (
                <div key={invItem.sku} style={cardStyle}>
                  <div>
                    {details?.image_url && <img src={details.image_url} alt="owned" style={itemImage} />}
                    <h3 style={itemTitle}>
                      {lang === 'en' ? details?.name_en : details?.name_cn || invItem.sku}
                    </h3>
                    <p style={{...descStyle, minHeight: 'auto'}}>
                      {lang === 'en' ? details?.description_en : details?.description_cn}
                    </p>
                    <p style={priceStyle}>
                      OWNED: <span style={{color: '#f4ebd0'}}>{invItem.quantity}</span>
                    </p>
                  </div>
                  <button style={{...buyBtn, opacity: 0.5, cursor: 'default'}}>COLLECTED</button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    ) : (
      /* --- CART VIEW --- */
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <h1 style={{ ...sectionTitle, margin: 0 }}>YOUR SELECTIONS</h1>
          {cart.length > 0 && <button onClick={clearCart} style={clearBtn}>CLEAR ALL</button>}
        </div>
        {cart.length === 0 ? <p style={{color: '#8d99ae', textAlign: 'center'}}>Your cart is empty.</p> : (
          <div>
            {cart.map(item => (
              <div key={item.sku} style={cartRow}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span style={{ fontSize: '18px' }}>{lang === 'en' ? item.name_en : item.name_cn}</span>
                  <div style={qtyControls}>
                    <button onClick={() => updateQuantity(item.sku, -1)} style={qtyBtn}>-</button>
                    <span style={{ minWidth: '30px', textAlign: 'center' }}>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.sku, 1)} style={qtyBtn}>+</button>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ color: '#d4af37', fontSize: '20px', display: 'block' }}>
                    {currency === 'usd' ? '$' : 'RM'}
                    {((currency === 'usd' ? Number(item.price_usd) : Number(item.price_myr)) * item.quantity).toFixed(2)}
                  </span>
                </div>
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
const navbarStyle: React.CSSProperties = { position: 'sticky', top: 0, zIndex: 1000, height: '90px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 60px', borderBottom: '1px solid rgba(212, 175, 55, 0.2)', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)' };
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
const descStyle: React.CSSProperties = { fontSize: '12.5px', color: '#a0a0a0', lineHeight: '1.4', marginBottom: '20px', minHeight: '80px', textAlign: 'center', fontFamily: 'serif', fontStyle: 'italic' };
const priceStyle = { fontSize: '24px', color: '#d4af37', marginBottom: '25px', marginTop: 'auto' };
const buyBtn = { width: '100%', padding: '12px', background: 'none', border: '1px solid #d4af37', color: '#d4af37', cursor: 'pointer', fontWeight: 'bold', letterSpacing: '2px', fontFamily: '"Cinzel", serif' };
const checkoutBtn = { padding: '20px 50px', background: '#d4af37', color: '#000', border: 'none', fontWeight: 'bold', fontSize: '18px', cursor: 'pointer', letterSpacing: '3px', fontFamily: '"Cinzel", serif' };
const cartRow = { display: 'flex', justifyContent: 'space-between', padding: '20px 0', borderBottom: '1px solid rgba(212,175,55,0.1)', fontSize: '18px' };
const qtyControls: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '15px', marginTop: '10px' };
const qtyBtn: React.CSSProperties = { background: 'rgba(212, 175, 55, 0.1)', border: '1px solid #d4af37', color: '#d4af37', width: '32px', height: '32px', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const clearBtn: React.CSSProperties = { background: 'none', border: '1px solid #ff4d4d', color: '#ff4d4d', padding: '8px 16px', cursor: 'pointer', fontFamily: '"Cinzel", serif', fontSize: '12px', letterSpacing: '1px' };

export default Store;