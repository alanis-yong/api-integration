import { Link } from 'react-router-dom'
import type { Item } from '../hooks/useItems'
import { ItemImage } from './ItemImage'
import { getCategory } from '../utils/categories'

interface ItemCardProps {
  item: Item
  onAddToCart: (item: Item) => void
}

const formatPrice = (amount: number): string =>
  `${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽`

export function ItemCard({ item, onAddToCart }: ItemCardProps) {

  return (
    <div className="item-card" data-testid="item-card-test">
      <Link to={`/product/${item.id}`} className="item-card__image">
        <ItemImage id={item.id} name={item.name} />
      </Link>
      <div className="item-card__body">
        <span className="item-card__tag">{getCategory(item.name)}</span>
        <Link to={`/product/${item.id}`} className="item-card__name-link">
          <h3 className="item-card__name">{item.name}</h3>
        </Link>
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
