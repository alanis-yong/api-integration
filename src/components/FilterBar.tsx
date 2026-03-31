import { CATEGORIES, type Category } from '../utils/categories'

interface FilterBarProps {
  activeCategory: Category
  onCategoryChange: (category: Category) => void
}

export function FilterBar({ activeCategory, onCategoryChange }: FilterBarProps) {
  return (
    <div className="filter-bar">
      {CATEGORIES.map((category) => (
        <button
          key={category}
          className={['filter-chip', activeCategory === category && 'filter-chip--active']
            .filter(Boolean)
            .join(' ')}
          onClick={() => onCategoryChange(category)}
        >
          {category}
        </button>
      ))}
    </div>
  )
}
