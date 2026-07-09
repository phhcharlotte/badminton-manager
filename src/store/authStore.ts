// src/store/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';
import { INITIAL_USERS } from '../data/mockData';

interface AuthStore {
  currentUser: User | null;
  isAuthenticated: boolean;
  users: User[];
  login: (username: string, password: string) => { success: boolean; message: string };
  logout: () => void;
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => { success: boolean; message: string };
  updateUser: (id: string, updates: Partial<User>) => void;
  toggleUserStatus: (id: string) => void;
  deleteUser: (id: string) => void;
  getAllUsers: () => User[];
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      currentUser: null,
      isAuthenticated: false,
      users: INITIAL_USERS,

      login: (username, password) => {
        const { users } = get();
        const user = users.find(
          (u) => u.username === username && u.password === password && u.isActive
        );
        if (user) {
          set({ currentUser: user, isAuthenticated: true });
          return { success: true, message: 'Đăng nhập thành công!' };
        }
        return { success: false, message: 'Tên đăng nhập hoặc mật khẩu không đúng!' };
      },

      logout: () => set({ currentUser: null, isAuthenticated: false }),

      addUser: (userData) => {
        const { users } = get();
        const exists = users.find((u) => u.username === userData.username);
        if (exists) {
          return { success: false, message: 'Tên đăng nhập đã tồn tại!' };
        }
        const newUser: User = {
          ...userData,
          id: `u${Date.now()}`,
          createdAt: new Date().toISOString().split('T')[0],
        };
        set({ users: [...users, newUser] });
        return { success: true, message: 'Tạo tài khoản thành công!' };
      },

      updateUser: (id, updates) => {
        set((state) => ({
          users: state.users.map((u) => (u.id === id ? { ...u, ...updates } : u)),
        }));
      },

      toggleUserStatus: (id) => {
        set((state) => ({
          users: state.users.map((u) =>
            u.id === id ? { ...u, isActive: !u.isActive } : u
          ),
        }));
      },

      deleteUser: (id) => {
        set((state) => ({
          users: state.users.filter((u) => u.id !== id),
        }));
      },

      getAllUsers: () => get().users,
    }),
    { name: 'auth-store' }
  )
);
