import { useEffect, useState } from 'react'
import { getItems } from '../api/api'

export interface Item {
  id: number
  name: string
  description: string
  price: number
  stock: number
  created_at: string
}

interface UseItemsResult {
  items: Item[]
  loading: boolean
  error: string | null
}

export function useItems(): UseItemsResult {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchItems = async () => {
      // Lecture: Get Items
      try{
        setLoading(true)
        const data = await getItems()
        setItems(data)
      } catch (error: any){
        setError('items loading failed')
      } finally {
        setLoading(false)
      }
    }
    fetchItems()
  }, [])

  return { items, loading, error }
}
