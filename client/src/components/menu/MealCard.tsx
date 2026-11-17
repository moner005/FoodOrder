import type { MenuItem } from '@/types/menu'

interface MealCardProps {
  menuItem: MenuItem
  onToggleAvailability: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export default function MealCard({ menuItem, onToggleAvailability, onEdit, onDelete }: MealCardProps) {
  return (
    <article className="meal-card">
      {menuItem.imageUrl ? (
        <img
          className="meal-card-media"
          src={menuItem.imageUrl}
          alt={menuItem.name}
          loading="lazy"
        />
      ) : (
        <div className="meal-card-placeholder">
          No image
        </div>
      )}

      <div className="meal-card-body">
        <div className="meal-card-head">
          <h3 className="meal-card-name">{menuItem.name}</h3>
          <span
            className={`meal-status ${menuItem.isAvailable ? 'available' : 'sold-out'}`}
          >
            {menuItem.isAvailable ? 'Available' : 'Sold out'}
          </span>
        </div>

        <p className="meal-card-category">
          {menuItem.category}
        </p>
        <p className="meal-card-description">{menuItem.description}</p>
        <p className="meal-card-price">${menuItem.price.toFixed(2)}</p>

        <div className="meal-card-actions">
          <button
            className="button secondary small"
            type="button"
            onClick={() => onToggleAvailability(menuItem.id)}
          >
            {menuItem.isAvailable ? 'Mark sold out' : 'Mark available'}
          </button>
          <button
            className="button secondary small"
            type="button"
            onClick={() => onEdit(menuItem.id)}
          >
            Edit
          </button>
          <button
            className="button danger small"
            type="button"
            onClick={() => onDelete(menuItem.id)}
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  )
}