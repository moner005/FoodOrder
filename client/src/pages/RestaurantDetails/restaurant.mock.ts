import type { Meal, MealCategory } from '@/types/meal'
import type { Restaurant } from '@/types/restaurant'

// Fictional frontend fixtures. USD is a fixture choice, not a project-wide currency decision.
// Replace this module's data source with the team's agreed service when available.
const photo = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1000&q=80`

export const restaurant: Restaurant = {
  id: 'olive-and-ember',
  name: 'Olive & Ember',
  description: 'Wood-fired favorites, generous bowls, and a little something sweet. Thoughtfully made comfort food for slow evenings and everyday appetites.',
  imageUrl: photo('photo-1414235077428-338989a2e8c0'),
  cuisine: 'Italian-inspired neighborhood kitchen',
  address: '18 Olive Lane, Willow Quarter',
  contact: { email: 'hello@oliveandember.example' },
  openingHours: [
    { days: 'Monday – Thursday', hours: '12:00 – 21:00' },
    { days: 'Friday – Saturday', hours: '12:00 – 22:00' },
    { days: 'Sunday', hours: '12:00 – 20:00' },
  ],
  isOpen: true,
  currency: 'USD',
  deliveryFeeMinor: 250,
  minimumSubtotalMinor: 1200,
  supportedAreas: ['Willow Quarter', 'Old Market'],
}

export const categories: MealCategory[] = [
  { id: 'pizza', name: 'From the oven' },
  { id: 'pasta', name: 'Pasta & bowls' },
  { id: 'sides', name: 'On the side' },
  { id: 'dessert', name: 'Something sweet' },
]

export const meals: Meal[] = [
  { id: 'ember-margherita', name: 'Classic Margherita', description: 'A blistered crust, crushed tomatoes, creamy mozzarella, and fresh basil.', categoryId: 'pizza', priceMinor: 1250, imageUrl: photo('photo-1579751626657-72bc17010498'), available: true, dietaryLabels: ['Vegetarian'], allergens: ['Wheat', 'Milk'] },
  { id: 'ember-pepperoni', name: 'Pepperoni & Honey', description: 'Pepperoni, mozzarella, and a drizzle of chili honey on our slow-fermented dough.', categoryId: 'pizza', priceMinor: 1450, imageUrl: photo('photo-1628840042765-356cda07504e'), available: true, dietaryLabels: [], allergens: ['Wheat', 'Milk'] },
  { id: 'ember-tomato-pasta', name: 'Garden Tomato Pasta', description: 'Pasta tossed with roasted tomatoes, garlic, olive oil, and a handful of basil.', categoryId: 'pasta', priceMinor: 1150, imageUrl: photo('photo-1473093295043-cdd812d0e601'), available: true, dietaryLabels: ['Vegetarian'], allergens: ['Wheat', 'Egg'] },
  { id: 'ember-green-salad', name: 'The Garden Bowl', description: 'Crisp seasonal leaves, cucumber, tomatoes, and a bright lemon dressing.', categoryId: 'sides', priceMinor: 750, imageUrl: photo('photo-1512621776951-a57141f2eefd'), available: true, dietaryLabels: ['Vegan'], allergens: [] },
  { id: 'ember-fries', name: 'Golden Fries', description: 'Golden potato fries finished with sea salt, rosemary, and a garlic dip.', categoryId: 'sides', priceMinor: 450, imageUrl: photo('photo-1573080496219-bb080dd4f877'), available: true, dietaryLabels: ['Vegetarian'], allergens: ['Egg'] },
  { id: 'ember-chocolate-cake', name: 'Chocolate Table Cake', description: 'A rich slice of chocolate cake with a soft crumb and silky chocolate frosting.', categoryId: 'dessert', priceMinor: 650, imageUrl: photo('photo-1578985545062-69928b1d9587'), available: false, dietaryLabels: ['Vegetarian'], allergens: ['Wheat', 'Milk', 'Egg'] },
]
