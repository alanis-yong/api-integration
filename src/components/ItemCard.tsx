import type { Item } from '../hooks/useItems'
import { ItemImage } from './ItemImage'

interface ItemCardProps {
  item: Item
  onAddToCart: (item: Item) => void
}

const formatPrice = (amount: number): string =>
  `${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽`

export function ItemCard({ item, onAddToCart }: ItemCardProps) {

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
          <button className="item-card__btn" onClick={() => onAddToCart(item)}>
            Add to cart
          </button>
        </div>
      </div>
    </div>
  )
}
