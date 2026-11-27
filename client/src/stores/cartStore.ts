
import { create } from 'zustand';
import type { CartLine } from '@/types/cart';

const CART_STORAGE_PREFIX = 'foodorder-cart-v2:';
const SESSION_KEY = 'session';

interface CartStore {
  items: CartLine[];
  load: () => void;
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

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],

  load: () => {
    const userId = getCurrentUserId();

    // Guests never receive a persisted cart.
    if (!userId) {
      set({ items: [] });
      return;
    }

    set({ items: readCart(userId) });
  },

  addItem: (newItem) => {
    const userId = getCurrentUserId();

    // Block adding meals without authentication.
    if (!userId) {
      set({ items: [] });
      return false;
    }

    const current = get().items;

    const existing = current.find(
      (item) => item.mealId === newItem.mealId,
    );
    if (existing && existing.quantity >= 99) return false;

    const updated = existing
      ? current.map((item) =>
          item.mealId === newItem.mealId
          ? { ...item, quantity: Math.min(99, item.quantity + 1) }
            : item,
        )
      : [...current, { ...newItem }];

    saveCart(userId, updated);
    set({ items: updated });

    return true;
  },

  increaseQuantity: (mealId) => {
    const userId = getCurrentUserId();
    if (!userId) return;

    const updated = get().items.map((item) =>
      item.mealId === mealId
        ? { ...item, quantity: item.quantity + 1 }
        : item,
    );

    saveCart(userId, updated);
    set({ items: updated });
  },

  decreaseQuantity: (mealId) => {
    const userId = getCurrentUserId();
    if (!userId) return;

    const updated = get().items
      .map((item) =>
        item.mealId === mealId
          ? { ...item, quantity: item.quantity - 1 }
          : item,
      )
      .filter((item) => item.quantity > 0);

    saveCart(userId, updated);
    set({ items: updated });
  },

  removeItem: (mealId) => {
    const userId = getCurrentUserId();
    if (!userId) return;

    const updated = get().items.filter(
      (item) => item.mealId !== mealId,
    );

    saveCart(userId, updated);
    set({ items: updated });
  },

  clear: () => {
    const userId = getCurrentUserId();

    if (userId) {
      localStorage.removeItem(getCartKey(userId));
    }

    set({ items: [] });
  },

  clearIfUnchanged: (userId, expected) => {
    if (getCurrentUserId() !== userId) return false;
    const current = readCart(userId, true);
    const signature = (items: CartLine[]) => JSON.stringify(items.map(({ mealId, quantity, note }) => ({ mealId, quantity, note })).sort((a, b) => a.mealId.localeCompare(b.mealId)));
    if (signature(current) !== signature(expected)) {
      set({ items: current });
      return false;
    }
    localStorage.removeItem(getCartKey(userId));
    set({ items: [] });
    return true;
  },

  // Clear in-memory items on logout without deleting that user's saved cart.
  reset: () => {
    set({ items: [] });
  },
}));
