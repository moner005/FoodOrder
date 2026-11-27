
import { create } from 'zustand';
import type { CartLine } from '@/types/cart';

const CART_STORAGE_PREFIX = 'foodorder-cart-v2:';
const SESSION_KEY = 'session';

interface CartStore {
  items: CartLine[];
  load: (userId?: string | null) => void;
  addItem: (item: CartLine) => boolean;
  increaseQuantity: (mealId: string) => void;
  decreaseQuantity: (mealId: string) => void;
  removeItem: (mealId: string) => void;
  clear: () => void;
  clearIfUnchanged: (userId: string, expected: CartLine[]) => boolean;
  reset: () => void;
}

// Get the ID of the currently logged-in user.
function getCurrentUserId(): string | null {
  try {
    const savedSession = localStorage.getItem(SESSION_KEY);

    if (!savedSession) return null;

    const session = JSON.parse(savedSession);

    return typeof session.id === 'string' && session.id
      ? session.id
      : null;
  } catch {
    return null;
  }
}

// Every user gets a separate cart storage key.
function getCartKey(userId: string) {
  return `${CART_STORAGE_PREFIX}${userId}`;
}

function readCart(userId: string, requireReadableStorage = false): CartLine[] {
  try {
    const saved = localStorage.getItem(getCartKey(userId));

    if (!saved) return [];

    const parsed = JSON.parse(saved);

    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter(
        (item) =>
          item &&
          typeof item.mealId === 'string' &&
          Number.isInteger(item.quantity) &&
          item.quantity > 0,
      )
      .map((item) => ({
        mealId: item.mealId,
        restaurantId: item.restaurantId,
        restaurantName: item.restaurantName,
        quantity: item.quantity,
        note: typeof item.note === 'string' ? item.note : '',
        name: item.name ?? '',
        description: item.description ?? '',
        price: Number(item.price ?? 0),
        imageUrl: item.imageUrl ?? '',
      }));
  } catch (error) {
    if (requireReadableStorage) throw error;
    return [];
  }
}

function saveCart(userId: string, items: CartLine[]) {
  localStorage.setItem(
    getCartKey(userId),
    JSON.stringify(items),
  );
}

export const useCartStore = create<CartStore>((set) => {
  let accountId = getCurrentUserId();

  // Only an explicit sign-in changes the cart account used by this tab.
  function updateCart(change: (current: CartLine[]) => CartLine[]): boolean {
    const userId = accountId;
    if (!userId || getCurrentUserId() !== userId) {
      set({ items: [] });
      return false;
    }

    try {
      const current = readCart(userId, true);
      const items = change(current);
      if (items !== current) {
        if (items.length) saveCart(userId, items);
        else localStorage.removeItem(getCartKey(userId));
      }
      set({ items });
      return items !== current;
    } catch {
      return false;
    }
  }

  return {
    items: [],
    load: (userId = accountId) => {
      accountId = userId;
      set({ items: userId && getCurrentUserId() === userId ? readCart(userId) : [] });
    },
    addItem: (newItem) => updateCart((current) => {
      const existing = current.find((item) => item.mealId === newItem.mealId);
      if (!existing) return [...current, newItem];
      if (existing.quantity >= 99) return current;
      return current.map((item) =>
        item.mealId === newItem.mealId ? { ...item, quantity: item.quantity + 1 } : item,
      );
    }),
    increaseQuantity: (mealId) => {
      updateCart((current) => current.map((item) =>
        item.mealId === mealId ? { ...item, quantity: Math.min(99, item.quantity + 1) } : item,
      ));
    },
    decreaseQuantity: (mealId) => {
      updateCart((current) => current
        .map((item) => item.mealId === mealId ? { ...item, quantity: item.quantity - 1 } : item)
        .filter((item) => item.quantity > 0));
    },
    removeItem: (mealId) => {
      updateCart((current) => current.filter((item) => item.mealId !== mealId));
    },
    clear: () => { updateCart(() => []); },

    clearIfUnchanged: (userId, expected) => {
      if (accountId !== userId || getCurrentUserId() !== userId) return false;
      const current = readCart(userId, true);
      const signature = (items: CartLine[]) => JSON.stringify(items
        .map(({ mealId, quantity, note }) => ({ mealId, quantity, note }))
        .sort((a, b) => a.mealId.localeCompare(b.mealId)));
      if (signature(current) !== signature(expected)) {
        set({ items: current });
        return false;
      }
      localStorage.removeItem(getCartKey(userId));
      set({ items: [] });
      return true;
    },

    reset: () => {
      accountId = null;
      set({ items: [] });
    },
  };
});
