
export const DEMO_CART_ITEMS = [
  {
    key: 'demo-1',
    mealId: 'meal-101',
    name: 'Classic Beef Burger',
    description: 'Grilled beef, cheddar, lettuce and house sauce',
    quantity: 2,
    note: 'No onions',
    priceMinor: 1250,
  },
  {
    key: 'demo-2',
    mealId: 'meal-102',
    name: 'Truffle Parmesan Fries',
    description: 'Crispy fries with parmesan and truffle sauce',
    quantity: 1,
    note: '',
    priceMinor: 650,
  },
  {
    key: 'demo-3',
    mealId: 'meal-103',
    name: 'Iced Caramel Latte',
    description: 'Espresso, milk and caramel',
    quantity: 1,
    note: 'Less ice',
    priceMinor: 475,
  },
];

export const DEMO_DELIVERY_FEE_MINOR = 250;

export const DEMO_ORDERS = [
  {
    id: 'FO-2026-014',
    dateLabel: 'Nov 10, 2026',
    itemCount: 2,
    totalMinor: 2875,
    status: 'Delivered',
    statusKey: 'delivered',
  },
  {
    id: 'FO-2026-015',
    dateLabel: 'Nov 11, 2026',
    itemCount: 3,
    totalMinor: 4250,
    status: 'Preparing',
    statusKey: 'preparing',
  },
  {
    id: 'FO-2026-016',
    dateLabel: 'Nov 12, 2026',
    itemCount: 1,
    totalMinor: 1825,
    status: 'Cancelled',
    statusKey: 'cancelled',
  },
];

export function formatDemoMoney(amountMinor: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amountMinor / 100);
}

export const DEMO_TOTAL_SPENT = DEMO_ORDERS
  .filter((order) => order.statusKey !== 'cancelled')
  .reduce((total, order) => total + order.totalMinor, 0);