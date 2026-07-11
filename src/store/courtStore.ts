import { create } from "zustand";
import { Court, CourtType } from "@/types/Courts/index";
import {
  listCourtsApi,
  createCourtApi,
  updateCourtApi,
  deleteCourtApi,
  CourtFormPayload,
} from "@/apis/court.api";

interface CourtStore {
  courts: Court[];
  isLoading: boolean;
  error: string | null;

  fetchCourts: (params?: {
    type?: CourtType;
    search?: string;
    isActive?: boolean;
  }) => Promise<void>;
  addCourt: (
    payload: CourtFormPayload,
  ) => Promise<{ success: boolean; message: string }>;
  editCourt: (
    id: string,
    payload: Partial<CourtFormPayload>,
  ) => Promise<{ success: boolean; message: string }>;
  removeCourt: (id: string) => Promise<{ success: boolean; message: string }>;
}

export const useCourtStore = create<CourtStore>((set, get) => ({
  courts: [],
  isLoading: false,
  error: null,

  fetchCourts: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const { courts } = await listCourtsApi(params);
      set({ courts, isLoading: false });
    } catch (err: any) {
      set({
        isLoading: false,
        error: err?.response?.data?.message || "Không tải được danh sách sân",
      });
    }
  },

  addCourt: async (payload) => {
    try {
      const court = await createCourtApi(payload);
      set({ courts: [court, ...get().courts] });
      return { success: true, message: "Tạo sân thành công!" };
    } catch (err: any) {
      return {
        success: false,
        message: err?.response?.data?.message || "Tạo sân thất bại!",
      };
    }
  },

  editCourt: async (id, payload) => {
    try {
      const updated = await updateCourtApi(id, payload);
      set({ courts: get().courts.map((c) => (c._id === id ? updated : c)) });
      return { success: true, message: "Cập nhật sân thành công!" };
    } catch (err: any) {
      return {
        success: false,
        message: err?.response?.data?.message || "Cập nhật thất bại!",
      };
    }
  },

  removeCourt: async (id) => {
    try {
      await deleteCourtApi(id);
      set({ courts: get().courts.filter((c) => c._id !== id) });
      return { success: true, message: "Đã xoá sân!" };
    } catch (err: any) {
      return {
        success: false,
        message: err?.response?.data?.message || "Xoá thất bại!",
      };
    }
  },
}));
