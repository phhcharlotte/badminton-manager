import { create } from "zustand";
import { CourtCategory } from "@/types/Courts";
import {
  listCourtCategoriesApi,
  createCourtCategoryApi,
  updateCourtCategoryApi,
  deleteCourtCategoryApi,
  CourtCategoryFormPayload,
} from "@/apis/courtCategory.api";

interface CourtCategoryStore {
  categories: CourtCategory[];
  isLoading: boolean;
  error: string | null;

  fetchCategories: () => Promise<void>;
  addCategory: (
    payload: CourtCategoryFormPayload,
  ) => Promise<{ success: boolean; message: string }>;
  editCategory: (
    id: string,
    payload: Partial<CourtCategoryFormPayload>,
  ) => Promise<{ success: boolean; message: string }>;
  removeCategory: (
    id: string,
  ) => Promise<{ success: boolean; message: string }>;
}

export const useCourtCategoryStore = create<CourtCategoryStore>((set, get) => ({
  categories: [],
  isLoading: false,
  error: null,

  fetchCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      const categories = await listCourtCategoriesApi();
      set({ categories, isLoading: false });
    } catch (err: any) {
      set({
        isLoading: false,
        error:
          err?.response?.data?.message || "Không tải được danh sách loại sân",
      });
    }
  },

  addCategory: async (payload) => {
    try {
      const category = await createCourtCategoryApi(payload);
      set({ categories: [...get().categories, category] });
      return { success: true, message: "Tạo loại sân thành công!" };
    } catch (err: any) {
      return {
        success: false,
        message: err?.response?.data?.message || "Tạo loại sân thất bại!",
      };
    }
  },

  editCategory: async (id, payload) => {
    try {
      const updated = await updateCourtCategoryApi(id, payload);
      set({
        categories: get().categories.map((c) => (c._id === id ? updated : c)),
      });
      return { success: true, message: "Cập nhật loại sân thành công!" };
    } catch (err: any) {
      return {
        success: false,
        message: err?.response?.data?.message || "Cập nhật thất bại!",
      };
    }
  },

  removeCategory: async (id) => {
    try {
      await deleteCourtCategoryApi(id);
      set({ categories: get().categories.filter((c) => c._id !== id) });
      return { success: true, message: "Đã xoá loại sân!" };
    } catch (err: any) {
      return {
        success: false,
        message: err?.response?.data?.message || "Xoá thất bại!",
      };
    }
  },
}));
