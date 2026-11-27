export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  address?: string;
  role?: string;
}

export type SessionUser = User;