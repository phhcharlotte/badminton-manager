import { create } from "zustand";
import { User } from "@/types";
import { setAccessToken } from "@/apis/tokenStore";
import {
  loginApi,
  logoutApi,
  refreshApi,
  registerApi,
  createManagerApi,
  listUsersApi,
  setUserStatusApi,
  updateProfileApi,
  changePasswordApi,
  deleteUserApi,
} from "@/apis/auth.api";
import { connectSocket, disconnectSocket } from "@/lib/socket";

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
  updateProfile: (payload: {
    fullName?: string;
    phone?: string;
  }) => Promise<{ success: boolean; message: string }>;
  changePassword: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<{ success: boolean; message: string }>;
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
      connectSocket();
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
      connectSocket();
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
      connectSocket();
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
      disconnectSocket();
    }
  },

  fetchUsers: async (role) => {
    const users = await listUsersApi(role ? { role } : undefined);
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
        message: err?.response?.data?.message || "Tạo tài khoản thất bại!",
      };
    }
  },

  toggleUserStatus: async (id, currentStatus) => {
    const updated = await setUserStatusApi(id, !currentStatus);
    set({ users: get().users.map((u) => (u._id === id ? updated : u)) });
  },

  updateProfile: async (payload) => {
    try {
      const updated = await updateProfileApi(payload);
      set({ currentUser: updated });
      return { success: true, message: "Cập nhật hồ sơ thành công!" };
    } catch (err: any) {
      return {
        success: false,
        message: err?.response?.data?.message || "Cập nhật thất bại!",
      };
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    try {
      await changePasswordApi(currentPassword, newPassword);
      // BE thu hoi toan bo token sau khi doi mat khau -> bat dang xuat luon o FE
      setAccessToken(null);
      set({ currentUser: null, isAuthenticated: false });
      return {
        success: true,
        message: "Đổi mật khẩu thành công! Vui lòng đăng nhập lại.",
      };
    } catch (err: any) {
      return {
        success: false,
        message: err?.response?.data?.message || "Đổi mật khẩu thất bại!",
      };
    }
  },

  deleteUser: async (id) => {
    await deleteUserApi(id);
    set({ users: get().users.filter((u) => u._id !== id) });
  },
}));
