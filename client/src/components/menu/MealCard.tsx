import type { MenuItem } from '../../types/menu';
 

interface MealCardProps {
  menuItem: MenuItem;
  onToggleAvailability: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

function MealCard({ menuItem, onEdit, onDelete, onToggleAvailability }: MealCardProps) {
  return (
    <div className="meal-card">
      <img src={menuItem.imageUrl} alt={menuItem.name} />
      <h3>{menuItem.name}</h3>
      <p>{menuItem.description}</p>
      <p>${menuItem.price.toFixed(2)}</p>
      <p>{menuItem.isAvailable ? 'Available' : 'Not Available'}</p>
      <p>Category: {menuItem.category}</p>
      <button onClick={() => onToggleAvailability(menuItem.id)}>{menuItem.isAvailable ? 'Mark Sold Out' : 'Mark Available'}</button>
      <button onClick={() => onEdit(menuItem.id)}>Edit</button>
      <button onClick={() => onDelete(menuItem.id)}>Delete</button>
    </div>
  );
};

export default MealCard;