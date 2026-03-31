import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export interface ShippingData {
  fullName: string
  email: string
  city: string
  postalCode: string
  address: string
  phone: string
}

interface ShippingFormProps {
  initialData?: ShippingData
  onSubmit: (data: ShippingData) => void
}

const EMPTY: ShippingData = { fullName: '', email: '', city: '', postalCode: '', address: '', phone: '' }

export function ShippingForm({ initialData, onSubmit }: ShippingFormProps) {
  const navigate = useNavigate()
  const [form, setForm] = useState<ShippingData>(initialData || EMPTY)
  const [errors, setErrors] = useState<Partial<Record<keyof ShippingData, string>>>({})

  const set = (field: keyof ShippingData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [field]: e.target.value })
    if (errors[field]) setErrors({ ...errors, [field]: undefined })
  }

  const validate = (): boolean => {
    const errs: Partial<Record<keyof ShippingData, string>> = {}
    if (!form.fullName.trim()) errs.fullName = 'Name is required'
    if (!form.email.trim()) errs.email = 'Email is required'
    else if (!form.email.includes('@')) errs.email = 'Invalid email address'
    if (!form.city.trim()) errs.city = 'City is required'
    if (!form.postalCode.trim()) errs.postalCode = 'Postal code is required'
    if (!form.address.trim()) errs.address = 'Address is required'
    if (!form.phone.trim()) errs.phone = 'Phone is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      onSubmit(form)
      navigate('/checkout/payment')
    }
  }

  const inputClass = (field: keyof ShippingData) =>
    ['form-group__input', errors[field] && 'form-group__input--error'].filter(Boolean).join(' ')

  return (
    <form className="checkout-form" onSubmit={handleSubmit}>
      <h2 className="checkout-form__title">Shipping Address</h2>

      <div className="form-group">
        <label className="form-group__label">Full Name</label>
        <input className={inputClass('fullName')} value={form.fullName} onChange={set('fullName')} placeholder="John Doe" />
        {errors.fullName && <span className="form-group__error">{errors.fullName}</span>}
      </div>

      <div className="form-group">
        <label className="form-group__label">Email</label>
        <input className={inputClass('email')} type="email" value={form.email} onChange={set('email')} placeholder="john@example.com" />
        {errors.email && <span className="form-group__error">{errors.email}</span>}
      </div>

      {/* Two-column row: City + Postal Code */}
      <div className="form-row">
        <div className="form-group">
          <label className="form-group__label">City</label>
          <input className={inputClass('city')} value={form.city} onChange={set('city')} placeholder="Moscow" />
          {errors.city && <span className="form-group__error">{errors.city}</span>}
        </div>
        <div className="form-group">
          <label className="form-group__label">Postal Code</label>
          <input className={inputClass('postalCode')} value={form.postalCode} onChange={set('postalCode')} placeholder="101000" />
          {errors.postalCode && <span className="form-group__error">{errors.postalCode}</span>}
        </div>
      </div>

      <div className="form-group">
        <label className="form-group__label">Address</label>
        <input className={inputClass('address')} value={form.address} onChange={set('address')} placeholder="ul. Leninskiy Prospekt 1, apt 42" />
        {errors.address && <span className="form-group__error">{errors.address}</span>}
      </div>

      <div className="form-group">
        <label className="form-group__label">Phone</label>
        <input className={inputClass('phone')} type="tel" value={form.phone} onChange={set('phone')} placeholder="+7 (999) 123-4567" />
        {errors.phone && <span className="form-group__error">{errors.phone}</span>}
      </div>

      <div className="checkout-form__actions">
        <button type="button" className="checkout-form__btn checkout-form__btn--back" onClick={() => navigate('/cart')}>
          ← Back
        </button>
        <button type="submit" className="checkout-form__btn checkout-form__btn--next">
          Continue to Payment →
        </button>
      </div>
    </form>
  )
}
