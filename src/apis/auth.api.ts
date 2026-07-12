import { apiClient } from "./axiosClient";
import { User } from "@/types";

export const loginApi = async (email: string, password: string) => {
  const { data } = await apiClient.post("/auth/login", { email, password });
  return data.data as { user: User; accessToken: string };
};

export const registerApi = async (payload: {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
}) => {
  const { data } = await apiClient.post("/auth/register", payload);
  return data.data as { user: User; accessToken: string };
};

export const logoutApi = async () => {
  await apiClient.post("/auth/logout");
};

export const refreshApi = async () => {
  const { data } = await apiClient.post("/auth/refresh-token");
  return data.data as { user: User; accessToken: string };
};

export const createManagerApi = async (payload: {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
}) => {
  const { data } = await apiClient.post("/admin/managers", payload);
  return data.data.user as User;
};

export const listUsersApi = async (params?: {
  role?: string;
  page?: number;
  limit?: number;
}) => {
  const { data } = await apiClient.get("/admin/users", {
    params: { limit: 100, ...params }, // lay toi da 100 user 1 lan, du dung cho hau het truong hop
  });
  return data.data.users as User[];
};

export const setUserStatusApi = async (id: string, isActive: boolean) => {
  const { data } = await apiClient.patch(`/admin/users/${id}/status`, {
    isActive,
  });
  return data.data.user as User;
};

export const deleteUserApi = async (id: string) => {
  await apiClient.delete(`/admin/users/${id}`);
};

export const updateProfileApi = async (payload: {
  fullName?: string;
  phone?: string;
}) => {
  const { data } = await apiClient.patch("/auth/me", payload);
  return data.data.user as User;
};

// src/api/auth.api.ts
export const changePasswordApi = async (
  currentPassword: string,
  newPassword: string,
) => {
  const { data } = await apiClient.patch("/auth/change-password", {
    currentPassword,
    newPassword,
  });
  return data;
};
