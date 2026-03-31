interface QuantitySelectorProps {
  value: number
  onChange: (value: number) => void
  max?: number
}

export function QuantitySelector({ value, onChange, max = 99 }: QuantitySelectorProps) {
  return (
    <div className="qty-selector">
      <button
        className={['qty-selector__btn', value <= 1 && 'qty-selector__btn--disabled']
          .filter(Boolean)
          .join(' ')}
        onClick={() => onChange(Math.max(1, value - 1))}
        disabled={value <= 1}
      >
        −
      </button>
      <span className="qty-selector__value">{value}</span>
      <button
        className={['qty-selector__btn', value >= max && 'qty-selector__btn--disabled']
          .filter(Boolean)
          .join(' ')}
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
      >
        +
      </button>
    </div>
  )
}
