import { ApiResponse } from "../../model/ApiResponse";
import { Category } from "../../model/Category";
import api from "./api";

const getAllCategory = async (): Promise<Category[]> => {
  try {
    const response = await api.get<ApiResponse<Category[]>>("api/v1/categories/all", null);
    return response.data.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export default getAllCategory;
