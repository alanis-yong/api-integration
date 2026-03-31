import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ItemImage } from './ItemImage'
import { Breadcrumb } from './Breadcrumb'
import { QuantitySelector } from './QuantitySelector'
import { getCategory } from '../utils/categories'
import type { Item } from '../hooks/useItems'

interface ProductDetailProps {
  items: Item[]
  onAddToCart: (item: Item) => void
}

const formatPrice = (amount: number): string =>
  `${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽`

export function ProductDetail({ items, onAddToCart }: ProductDetailProps) {
  const { id } = useParams<{ id: string }>()
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  const item = items.find((i) => i.id === Number(id))

  if (!item) {
    return (
      <div className="product-detail">
        <div className="product-detail__empty">
          <p>Product not found.</p>
          <Link to="/" className="product-detail__back-link">← Back to store</Link>
        </div>
      </div>
    )
  }

  const category = getCategory(item.name)
  const relatedItems = items.filter((i) => i.id !== item.id).slice(0, 4)
  const stockStatus = item.stock > 10 ? 'in-stock' : item.stock > 0 ? 'low-stock' : 'out-of-stock'
  const stockLabel = item.stock > 10 ? 'In Stock' : item.stock > 0 ? `Only ${item.stock} left` : 'Out of Stock'

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      onAddToCart(item)
    }
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="product-detail">
      <Breadcrumb
        items={[
          { label: 'Store', to: '/' },
          { label: category, to: `/?category=${category}` },
          { label: item.name },
        ]}
      />

      <div className="product-detail__grid">
        {/* Left: Image */}
        <div className="product-detail__image">
          <ItemImage id={item.id} name={item.name} />
        </div>

        {/* Right: Info */}
        <div className="product-detail__info">
          <div className="product-detail__badges">
            <span className="badge badge--category">{category}</span>
            <span className={`badge badge--${stockStatus}`}>{stockLabel}</span>
          </div>

          <h1 className="product-detail__name">{item.name}</h1>
          <p className="product-detail__price">{formatPrice(item.price)}</p>
          <p className="product-detail__description">{item.description}</p>

          <div className="product-detail__actions">
            <label className="product-detail__qty-label">Quantity</label>
            <QuantitySelector
              value={quantity}
              onChange={setQuantity}
              max={item.stock}
            />
          </div>

          <button
            className={['product-detail__add-btn', added && 'product-detail__add-btn--added']
              .filter(Boolean)
              .join(' ')}
            onClick={handleAddToCart}
            disabled={item.stock === 0}
          >
            {added ? '✓ Added!' : `Add to Cart — ${formatPrice(item.price * quantity)}`}
          </button>
        </div>
      </div>

      {/* Related Products */}
      {relatedItems.length > 0 && (
        <section className="related-products">
          <h2 className="related-products__title">Related Products</h2>
          <div className="related-products__row">
            {relatedItems.map((related) => (
              <Link
                key={related.id}
                to={`/product/${related.id}`}
                className="related-card"
              >
                <div className="related-card__image">
                  <ItemImage id={related.id} name={related.name} />
                </div>
                <div className="related-card__info">
                  <span className="related-card__name">{related.name}</span>
                  <span className="related-card__price">{formatPrice(related.price)}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
