export const routes = {
  home: "/",
  meals: "/meals",
  cart: "/cart",
  checkout: "/checkout",
  orders: "/orders",
  ownerHome: "/owner",
  ownerMenuNew: "/owner/menu/new",
  ownerMenuEdit: (id: string) => `/owner/menu/${id}/edit`,
} as const;
