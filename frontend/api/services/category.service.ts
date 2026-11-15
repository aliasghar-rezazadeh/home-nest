import api from "../config/api";
import type { Category, PaginatedResponse } from "../types/category";

export const categoryService = {
  getAll: async (): Promise<PaginatedResponse<Category>> => {
    const response = await api.get<PaginatedResponse<Category>>(
      "/categories/"
    );

    return response.data;
  },
};
