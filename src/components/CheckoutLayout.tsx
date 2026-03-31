import type { ReactNode } from 'react'
import { CheckoutStepper } from './CheckoutStepper'
import type { CartItem } from '../hooks/useCartReducer'

interface CheckoutLayoutProps {
  step: number
  children: ReactNode
  cartItems: CartItem[]
  totalPrice: number
  showSummary?: boolean
}

const formatPrice = (amount: number): string =>
  `${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽`

export function CheckoutLayout({ step, children, cartItems, totalPrice, showSummary = true }: CheckoutLayoutProps) {
  return (
    <div className="checkout">
      <CheckoutStepper currentStep={step} />

      <div className={['checkout__grid', !showSummary && 'checkout__grid--centered'].filter(Boolean).join(' ')}>
        <div className="checkout__main">
          {children}
        </div>

        {showSummary && (
          <aside className="checkout__sidebar">
            <div className="order-summary">
              <h2 className="order-summary__title">Order Summary</h2>
              {cartItems.map(({ item, quantity }) => (
                <div key={item.id} className="summary-row">
                  <span className="summary-row__label">{item.name} × {quantity}</span>
                  <span className="summary-row__value">{formatPrice(item.price * quantity)}</span>
                </div>
              ))}
              <hr className="order-summary__divider" />
              <div className="summary-row">
                <span className="summary-row__label">Shipping</span>
                <span className="summary-row__value summary-row__value--free">Free</span>
              </div>
              <hr className="order-summary__divider" />
              <div className="order-summary__total">
                <span>Total</span>
                <span className="order-summary__price">{formatPrice(totalPrice)}</span>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}
