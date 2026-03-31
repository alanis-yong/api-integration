import { useState } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import './App.css'
import { ItemCard } from './components/ItemCard'
import { CartPage } from './components/CartPage'
import { LoginModal } from './components/LoginModal'
import { FilterBar } from './components/FilterBar'
import { ProductDetail } from './components/ProductDetail'
import { SkeletonCard } from './components/SkeletonCard'
import { ThemeToggle } from './components/ThemeToggle'
import { CheckoutLayout } from './components/CheckoutLayout'
import { ShippingForm, type ShippingData } from './components/ShippingForm'
import { PaymentForm } from './components/PaymentForm'
import { ConfirmationPage } from './components/ConfirmationPage'
import { useItems } from './hooks/useItems'
import { useCart } from './hooks/useCartReducer'
import { getCategory, type Category } from './utils/categories'

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
  const [activeCategory, setActiveCategory] = useState<Category>('All')
  const [shippingData, setShippingData] = useState<ShippingData | undefined>()

  const filteredItems = activeCategory === 'All'
    ? items
    : items.filter((item) => getCategory(item.name) === activeCategory)

  return (
    <div className="shop">
      <header className="shop__header">
        <div className="shop__header-inner">
          <div className="shop__logo">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="28" height="28" rx="6" fill="#6366f1" />
              <path d="M8 10h12M8 14h8M8 18h10" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span>Xsolla Store</span>
          </div>
          <nav className="shop__nav">
            <ThemeToggle />
            <Link
              to="/"
              className={['shop__nav-link', location.pathname === '/' && 'shop__nav-link--active'].filter(Boolean).join(' ')}
            >
              Store
            </Link>
            <Link
              to="/cart"
              className={['shop__cart-btn', location.pathname.startsWith('/cart') && 'shop__cart-btn--active'].filter(Boolean).join(' ')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
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
          {/* Store page with filters */}
          <Route path="/" element={
            <section className="shop__catalog">
              <FilterBar activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
              {loading && (
                <div className="shop__grid">
                  {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
              )}
              {error && (
                <div className="shop__state shop__state--error">
                  <p>Failed to load items: {error}</p>
                  <button onClick={() => window.location.reload()}>Try again</button>
                </div>
              )}
              {!loading && !error && filteredItems.length === 0 && (
                <div className="shop__state"><p>No items in this category.</p></div>
              )}
              {!loading && !error && filteredItems.length > 0 && (
                <div className="shop__grid">
                  {filteredItems.map((item) => (
                    <ItemCard key={item.id} item={item} onAddToCart={addToCart} />
                  ))}
                </div>
              )}
            </section>
          } />

          {/* Product detail */}
          <Route path="/product/:id" element={<ProductDetail items={items} onAddToCart={addToCart} />} />

          {/* Cart (Step 1) */}
          <Route path="/cart" element={
            <CartPage cartItems={cartItems} totalPrice={totalPrice} onRemoveFromCart={removeFromCart} onClearCart={clearCart} />
          } />

          {/* Shipping (Step 2) */}
          <Route path="/checkout/shipping" element={
            <CheckoutLayout step={1} cartItems={cartItems} totalPrice={totalPrice}>
              <ShippingForm initialData={shippingData} onSubmit={setShippingData} />
            </CheckoutLayout>
          } />

          {/* Payment (Step 3) */}
          <Route path="/checkout/payment" element={
            <CheckoutLayout step={2} cartItems={cartItems} totalPrice={totalPrice}>
              <PaymentForm totalPrice={totalPrice} onSubmit={() => clearCart()} />
            </CheckoutLayout>
          } />

          {/* Confirmation (Step 4) */}
          <Route path="/checkout/confirmation" element={
            <ConfirmationPage
              shippingAddress={shippingData?.address}
              itemCount={cartItems.length}
              totalPrice={totalPrice}
            />
          } />
        </Routes>
      </main>

      <footer className="shop__footer">
        <p>© 2026 Xsolla Store. No rights reserved.</p>
      </footer>

      {showLogin && <LoginModal onClose={() => { setShowLogin(false); setTokenEmail(getTokenEmail()) }} />}
    </div>
  )
}

export default App
