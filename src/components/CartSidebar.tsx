import { useState } from 'react'
import type { CartItem } from '../hooks/useCartReducer'
import { createOrder } from '../api/api'

interface CartSidebarProps {
  open: boolean
  onClose: () => void
  cartItems: CartItem[]
  totalPrice: number
  onClearCart: () => void
}

const formatPrice = (amount: number): string =>
  `${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽`

export function CartSidebar({
  open,
  onClose,
  cartItems,
  totalPrice,
  onClearCart,
}: CartSidebarProps) {
  const [paying, setPaying] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 6000)
  }

  const handlePay = async () => {
    // Lecture: Handle Payment
    setPaying(true)
    try {
      const line_items = cartItems.map(({item, quantity}) => {
        return {
          item_id: item.id,
          quantity: quantity,
          price: item.price
        }
      })
      const response = await createOrder(line_items, totalPrice)
      console.log('response', response)
      showToast('success', 'Payment Success')
      onClearCart()
      onClose()
    } catch (error: any){
      showToast('error', 'Payment Failed')
    } finally {
      setPaying(false)
    }
  }

  return (
    <>
      {toast && (
        <div className={`toast toast--${toast.type}`}>
          {toast.message}
        </div>
      )}
      {open && <div className="cart-overlay" onClick={onClose} />}
      <aside className={`cart-sidebar ${open ? 'cart-sidebar--open' : ''}`}>
        <div className="cart-sidebar__header">
          <h2 className="cart-sidebar__title">Your Cart</h2>
          <button className="cart-sidebar__close" onClick={onClose} aria-label="Close cart">
            ✕
          </button>
        </div>

        {cartItems.length === 0 ? (
          <div className="cart-sidebar__empty">
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
              <circle cx="28" cy="28" r="27" stroke="#e0e0f0" strokeWidth="2" />
              <path
                d="M17 20h3l3 14h12l3-10H22"
                stroke="#c0c0d8"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="25" cy="38" r="1.5" fill="#c0c0d8" />
              <circle cx="34" cy="38" r="1.5" fill="#c0c0d8" />
            </svg>
            <p>Your cart is empty</p>
          </div>
        ) : (
          <>
            <ul className="cart-sidebar__list">
              {cartItems.map(({ item, quantity }) => (
                <li key={item.id} className="cart-item">
                  <div className="cart-item__info">
                    <span className="cart-item__name">{item.name}</span>
                    <span className="cart-item__unit-price">{formatPrice(item.price)} each</span>
                  </div>
                  <div className="cart-item__controls">
                    <span className="cart-item__qty-value">x{quantity}</span>
                    <span className="cart-item__subtotal">{formatPrice(item.price * quantity)}</span>
                    <button
                      className="cart-item__remove"
                      onClick={() => console.log('Homework: remove item from cart')}
                      aria-label={`Remove ${item.name}`}
                    >
                      ✕
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="cart-sidebar__footer">
              <div className="cart-sidebar__total">
                <span>Total</span>
                <span className="cart-sidebar__total-price">{formatPrice(totalPrice)}</span>
              </div>
              <button className="cart-sidebar__checkout" onClick={handlePay} disabled={paying}>
                {paying ? 'Processing…' : 'Pay'}
              </button>
              <button className="cart-sidebar__clear" onClick={() => console.log('Homework: clear cart')}>
                Clear cart
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  )
}
