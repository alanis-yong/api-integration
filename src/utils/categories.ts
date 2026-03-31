export const CATEGORIES = ['All', 'Clothing', 'Accessories', 'Electronics', 'Stationery'] as const

export type Category = (typeof CATEGORIES)[number]

export const getCategory = (name: string): Category => {
  const map: Record<string, Category> = {
    'Xsolla T-Shirt': 'Clothing',
    'Developer Hoodie': 'Clothing',
    'Sticker Pack': 'Accessories',
    'Mechanical Keyboard': 'Electronics',
    'Laptop Stand': 'Accessories',
    'USB-C Hub': 'Electronics',
    'Notebook (A5)': 'Stationery',
    'Cable Organiser': 'Accessories',
  }
  return map[name] || 'Accessories'
}
