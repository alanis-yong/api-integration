import type { Item } from '../hooks/useItems'
import { ItemImage } from './ItemImage'

interface ItemCardProps {
  item: Item
  onAddToCart: (item: Item) => void
  quantityInCart: number
}

const formatPrice = (amount: number): string =>
  `${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽`

export function ItemCard({ item, onAddToCart, quantityInCart }: ItemCardProps) {
const isOutOfStock = item.stock <= 0;
const isLimitReached = quantityInCart >= item.stock;

  return (
    <div className="item-card">
      <div className="item-card__image">
        <ItemImage id={item.id} name={item.name} />
      </div>
      <div className="item-card__body">
        <h3 className="item-card__name">{item.name}</h3>
        <p className="item-card__desc">{item.description}</p>
        <div className="item-card__footer">
          <span className="item-card__price">{formatPrice(item.price)}</span>
          <div className={`item-card__stock ${isOutOfStock ? 'item-card__stock--empty' : ''}`}>
          {isOutOfStock ? (
            <span>Out of stock</span>
          ) : (
            <span><strong>{item.stock}</strong> left</span>
          )}
        </div>
          <button 
            className="item-card__btn" 
            onClick={() => onAddToCart(item)}
            disabled={isOutOfStock || isLimitReached} // 1. Actually disable the button
          >
            {isOutOfStock ? 'Sold Out' : isLimitReached ? 'Limit reached' : 'Add to cart'} {/* 2. Change the text */}
          </button>
        </div>
      </div>
    </div>
  )
}
