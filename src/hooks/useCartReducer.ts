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
  }, [items])

  // Lecture: Add Item to Cart
  const addToCart = async (item: Item) => {

  }

  // Lecture: Clear Cart
  const clearCart = () => {}

  // Lecture: Calculate Total Items and Price
  const totalItems = 0
  const totalPrice = 0

  return { cartItems, addToCart, clearCart, totalItems, totalPrice, loading, error }
}
