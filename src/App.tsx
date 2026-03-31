import { useState } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import './App.css'
import { ItemCard } from './components/ItemCard'
import { CartPage } from './components/CartPage'
import { LoginModal } from './components/LoginModal'
import { useItems } from './hooks/useItems'
import { useCart } from './hooks/useCartReducer'

// Decrypt JWT token to get email
const getTokenEmail = (): string | null => {
  const token = localStorage.getItem('token')
  if (!token) return null
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.email ?? null
  } catch {
    return null
  }
}

function App() {
  const { items, loading, error } = useItems()
  const [showLogin, setShowLogin] = useState(false)
  const [tokenEmail, setTokenEmail] = useState<string | null>(getTokenEmail)
  const { cartItems, addToCart, removeFromCart, clearCart, totalItems, totalPrice } = useCart(items)
  const location = useLocation()

  return (
    <div className="shop">
      <header className="shop__header">
        <div className="shop__header-inner">
          <div className="shop__logo">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="28" height="28" rx="6" fill="#6366f1" />
              <path d="M8 10h12M8 14h8M8 18h10" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span>William's Store</span>
          </div>
          <nav className="shop__nav">
            <Link
              to="/"
              className={['shop__nav-link', location.pathname === '/' && 'shop__nav-link--active'].filter(Boolean).join(' ')}
            >
              Store
            </Link>
            <Link
              to="/cart"
              className={['shop__cart-btn', location.pathname === '/cart' && 'shop__cart-btn--active'].filter(Boolean).join(' ')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              Cart
              {totalItems > 0 && <span className="shop__cart-badge">{totalItems}</span>}
            </Link>
            {tokenEmail
              ? <button className="shop__login-btn shop__login-btn--user" disabled>{tokenEmail}</button>
              : <button className="shop__login-btn" onClick={() => setShowLogin(true)}>Login</button>
            }
          </nav>
        </div>
      </header>

      <main className="shop__main">
        <Routes>
          <Route
            path="/"
            element={
              <section className="shop__catalog">
                {loading && (
                  <div className="shop__state">
                    <div className="spinner" />
                    <p>Loading items...</p>
                  </div>
                )}

                {error && (
                  <div className="shop__state shop__state--error">
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                      <circle cx="24" cy="24" r="22" stroke="#ef4444" strokeWidth="2" />
                      <path d="M24 14v14M24 32v2" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                    <p>Failed to load items: {error}</p>
                    <button onClick={() => window.location.reload()}>Try again</button>
                  </div>
                )}

                {!loading && !error && items.length === 0 && (
                  <div className="shop__state">
                    <p>No items available right now.</p>
                  </div>
                )}

                {!loading && !error && items.length > 0 && (
                  <div className="shop__grid">
                    {items.map((item) => (
                      <ItemCard key={item.id} item={item} onAddToCart={addToCart} />
                    ))}
                  </div>
                )}
              </section>
            }
          />
          <Route
            path="/cart"
            element={
              <CartPage
                cartItems={cartItems}
                totalPrice={totalPrice}
                onRemoveFromCart={removeFromCart}
                onClearCart={clearCart}
              />
            }
          />
        </Routes>
      </main>

      <footer className="shop__footer">
        <p>© 2026 William's Shop. No rights reserved.</p>
      </footer>

      {showLogin && <LoginModal onClose={() => { setShowLogin(false); setTokenEmail(getTokenEmail()) }} />}
    </div>
  )
}

export default App
