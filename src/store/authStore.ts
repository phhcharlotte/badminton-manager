// src/store/authStore.ts
import { create } from "zustand";
import { User } from "../types";
import { setAccessToken } from "@/apis/tokenStore";
import {
  loginApi,
  logoutApi,
  refreshApi,
  registerApi,
  createManagerApi,
  listUsersApi,
  setUserStatusApi,
  deleteUserApi,
} from "@/apis/auth.api";

interface AuthStore {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean; // dang khoi phuc phien luc F5
  users: User[]; // danh sach lay tu server (chi admin dung)

  initAuth: () => Promise<void>; // goi 1 lan khi app khoi dong
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; message: string }>;
  registerCustomer: (payload: {
    fullName: string;
    email: string;
    password: string;
    phone?: string;
  }) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;

  fetchUsers: (role?: string) => Promise<void>;
  addManager: (payload: {
    fullName: string;
    email: string;
    password: string;
    phone?: string;
  }) => Promise<{ success: boolean; message: string }>;
  toggleUserStatus: (id: string, isActive: boolean) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  currentUser: null,
  isAuthenticated: false,
  isLoading: true,
  users: [],

  initAuth: async () => {
    try {
      const { user, accessToken } = await refreshApi();
      setAccessToken(accessToken);
      set({ currentUser: user, isAuthenticated: true });
    } catch {
      setAccessToken(null);
      set({ currentUser: null, isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    try {
      const { user, accessToken } = await loginApi(email, password);
      setAccessToken(accessToken);
      set({ currentUser: user, isAuthenticated: true });
      return { success: true, message: "Đăng nhập thành công!" };
    } catch (err: any) {
      return {
        success: false,
        message:
          err?.response?.data?.message ||
          "Tên đăng nhập hoặc mật khẩu không đúng!",
      };
    }
  },

  registerCustomer: async (payload) => {
    try {
      const { user, accessToken } = await registerApi(payload);
      setAccessToken(accessToken);
      set({ currentUser: user, isAuthenticated: true });
      return { success: true, message: "Đăng ký thành công!" };
    } catch (err: any) {
      return {
        success: false,
        message: err?.response?.data?.message || "Đăng ký thất bại!",
      };
    }
  },

  logout: async () => {
    try {
      await logoutApi();
    } finally {
      setAccessToken(null);
      set({ currentUser: null, isAuthenticated: false });
    }
  },

  fetchUsers: async (role) => {
    const users = await listUsersApi(role);
    set({ users });
  },

  addManager: async (payload) => {
    try {
      const manager = await createManagerApi(payload);
      set({ users: [manager, ...get().users] });
      return { success: true, message: "Tạo tài khoản quản lý thành công!" };
    } catch (err: any) {
      return {
        success: false,
        message: err?.response?.data?.message || "Tên đăng nhập đã tồn tại!",
      };
    }
  },

  toggleUserStatus: async (id, isActive) => {
    const updated = await setUserStatusApi(id, !isActive);
    set({ users: get().users.map((u) => (u._id === id ? updated : u)) });
  },

  deleteUser: async (id) => {
    await deleteUserApi(id);
    set({ users: get().users.filter((u) => u._id !== id) });
  },
}));
