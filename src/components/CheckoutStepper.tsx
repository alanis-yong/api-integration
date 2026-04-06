import { Link } from 'react-router-dom'

const STEPS = [
  { label: 'Cart', path: '/cart' },
  { label: 'Shipping', path: '/checkout/shipping' },
  { label: 'Payment', path: '/checkout/payment' },
  { label: 'Confirmation', path: '/checkout/confirmation' },
]

interface CheckoutStepperProps {
  currentStep: number // 0-3
}

export function CheckoutStepper({ currentStep }: CheckoutStepperProps) {
  return (
    <nav className="stepper">
      {STEPS.map((step, i) => {
        const done = i < currentStep
        const active = i === currentStep
        const modifier = done ? 'stepper__step--done' : active ? 'stepper__step--active' : 'stepper__step--future'

        return (
          <div key={step.label} className="stepper__item">
            {/* Connector line before step (except first) */}
            {i > 0 && (
  <div 
    className={[
      'stepper__line', 
      (done || active) && 'stepper__line--filled' // Change this line!
    ].filter(Boolean).join(' ')} 
  />
)}

            {/* Step circle + label */}
            <div className={`stepper__step ${modifier}`}>
              {done ? (
                <Link to={step.path} className="stepper__circle">
                  <span className="stepper__check">✓</span>
                </Link>
              ) : (
                <div className="stepper__circle">
                  <span className="stepper__number">{i + 1}</span>
                </div>
              )}
              <span className="stepper__label">{step.label}</span>
            </div>
          </div>
        )
      })}
    </nav>
  )
}
