import { useReducer, useEffect, useState } from 'react'
import type { Item } from './useItems'
import { getCart, addCartItem } from '../api/api'

export interface CartItem {
  item: Item
  quantity: number
}

type Action =
  | { type: 'ADD'; item: Item, newQuantity: number, existing: boolean }
  | { type: 'CLEAR' }
  | { type: 'INIT'; cartItems: CartItem[] }

const cartReducer = (state: CartItem[], action: Action): CartItem[] => {
  switch (action.type) {
    // Lecture: Create case for adding item in cart
    case 'INIT':
      return action.cartItems
    case 'ADD':
      if(action.existing){
        return state.map(ci => ci.item.id === action.item.id ? {...ci, quantity: action.newQuantity}: ci)
      }
      return [...state, {item: action.item,quantity: action.newQuantity}]
    case 'CLEAR':
      return []
    default:
      return state
  }
}

export const useCart = (items: Item[]) => {
  const [cartItems, dispatch] = useReducer(cartReducer, [])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Lecture: Get Cart
    if(items.length === 0) return;
    const fetch = async () => {
      try {
        setLoading(true)
        const data = await getCart()
        const parsedData = data.map((entry: {item_id: number, quantity: number}) => {
          const item = items.find(ci => ci.id === entry.item_id)
          if(!item) return null

          return {item, quantity: entry.quantity}
        }).filter(Boolean)
        dispatch({type: 'INIT', cartItems: parsedData})
      } catch (error: any) {
        setError('Cart no good')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [items])

  // Lecture: Add Item to Cart
  const addToCart = async (item: Item) => {
    const exist = cartItems.find(ci => ci.item.id === item.id);
    const newQuantity = exist ? exist.quantity + 1 : 1

    try {
      await addCartItem(item.id, newQuantity)
      dispatch({type: 'ADD', item, newQuantity, existing: !!exist})
    } catch (error: any){
      setError('Add to cart failed')
    }
  }

  // Lecture: Clear Cart
  const clearCart = () => dispatch({type: 'CLEAR'})

  // Lecture: Calculate Total Items and Price
  const totalItems = cartItems.reduce((sum, ci) => sum + ci.quantity, 0)
  const totalPrice = cartItems.reduce((sum, ci) => sum + ci.item.price * ci.quantity,0)
  return { cartItems, addToCart, clearCart, totalItems, totalPrice, loading, error }
}
