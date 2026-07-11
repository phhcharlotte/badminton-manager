// src/types/index.ts

export type UserRole = "admin" | "manager" | "customer";

export interface User {
  _id: string;
  fullName: string;
  email: string;
  role: UserRole;
  phone?: string;
  isActive: boolean;
  createdAt: string;
}

export interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (
    username: string,
    password: string,
  ) => { success: boolean; message: string };
  logout: () => void;
}

export interface UserStore {
  users: User[];
  addUser: (user: Omit<User, "id" | "createdAt">) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  toggleUserStatus: (id: string) => void;
}
