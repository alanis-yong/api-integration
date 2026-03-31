import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface PaymentFormProps {
  totalPrice: number
  onSubmit: () => void
}

const formatPrice = (amount: number): string =>
  `${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽`

export function PaymentForm({ totalPrice, onSubmit }: PaymentFormProps) {
  const navigate = useNavigate()
  const [form, setForm] = useState({ cardNumber: '', name: '', expiry: '', cvc: '', promo: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [field]: e.target.value })
    if (errors[field]) setErrors({ ...errors, [field]: '' })
  }

  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!form.cardNumber.trim()) errs.cardNumber = 'Card number is required'
    if (!form.name.trim()) errs.name = 'Cardholder name is required'
    if (!form.expiry.trim()) errs.expiry = 'Expiry date is required'
    if (!form.cvc.trim()) errs.cvc = 'CVC is required'
    if (form.promo && !['XSOLLA10', 'STUDENT20'].includes(form.promo.toUpperCase())) {
      errs.promo = 'Invalid promo code'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      onSubmit()
      navigate('/checkout/confirmation')
    }
  }

  const inputClass = (field: string) =>
    ['form-group__input', errors[field] && 'form-group__input--error'].filter(Boolean).join(' ')

  return (
    <form className="checkout-form" onSubmit={handleSubmit}>
      <h2 className="checkout-form__title">Payment Details</h2>

      <div className="form-group">
        <label className="form-group__label">Card Number</label>
        <input className={inputClass('cardNumber')} value={form.cardNumber} onChange={set('cardNumber')} placeholder="4242 4242 4242 4242" />
        {errors.cardNumber && <span className="form-group__error">{errors.cardNumber}</span>}
      </div>

      <div className="form-group">
        <label className="form-group__label">Cardholder Name</label>
        <input className={inputClass('name')} value={form.name} onChange={set('name')} placeholder="JOHN DOE" />
        {errors.name && <span className="form-group__error">{errors.name}</span>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-group__label">Expiry Date</label>
          <input className={inputClass('expiry')} value={form.expiry} onChange={set('expiry')} placeholder="MM / YY" />
          {errors.expiry && <span className="form-group__error">{errors.expiry}</span>}
        </div>
        <div className="form-group">
          <label className="form-group__label">CVC</label>
          <input className={inputClass('cvc')} value={form.cvc} onChange={set('cvc')} placeholder="123" />
          {errors.cvc && <span className="form-group__error">{errors.cvc}</span>}
        </div>
      </div>

      <div className="form-group">
        <label className="form-group__label">Promo Code (optional)</label>
        <input className={inputClass('promo')} value={form.promo} onChange={set('promo')} placeholder="Enter code" />
        {errors.promo && <span className="form-group__error">{errors.promo}</span>}
      </div>

      <div className="checkout-form__actions">
        <button type="button" className="checkout-form__btn checkout-form__btn--back" onClick={() => navigate('/checkout/shipping')}>
          ← Back
        </button>
        <button type="submit" className="checkout-form__btn checkout-form__btn--next">
          Pay {formatPrice(totalPrice)}
        </button>
      </div>
    </form>
  )
}
