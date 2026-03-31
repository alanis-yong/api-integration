import axios from 'axios'
import type { Item } from '../hooks/useItems'

// Lecture: Create Resuable API Instance
const api = axios.create({
  // Dev: Vite proxies /api → http://localhost:8080 (see vite.config.ts). Prod/preview: call API directly.
  baseURL: import.meta.env.DEV ? '/api' : 'http://localhost:8080',
})

// Lecture: Add JWT token to headers using Axios interceptors
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if(token){
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Lecture: Login User
export const login = async (email: string, password: string) => {
  const response = await api.post('/login', {email, password})
  return response.data
}

// Homework: Refresh Token
export const refreshToken = async () => {
  return {}
}

// Homework: Register User
export const register = async () => {
  return {}
}

// Lecture: Get Items
export const getItems = async (): Promise<Item[]> => {
  const response = await api.get('/items')
  return response.data
}

// Lecture: Get Cart
export const getCart = async () => {
  const response = await api.get('/user/cart')
  return response.data
}

// Lecture: Add Item to Cart
export const addCartItem = async (item_id: number, quantity: number) => {
  const response = await api.patch(`/user/cart/items/${item_id}`, {quantity})
  return response.data
}

// Lecture: Create Payment Order
export const createOrder = async (line_items: {item_id: number, quantity: number, price: number}, total: number) => {
  const response = await api.post('/orders',{line_items, total},{headers: {'Idempotency-Key' : crypto.randomUUID()}})
  return response.data
}
