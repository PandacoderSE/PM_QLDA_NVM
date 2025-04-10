import axios, { AxiosResponse } from "axios";
import { getToken } from "./localStorageService"; // Đảm bảo đường dẫn đúng

const API_BASE_URL = "http://localhost:8080/";

const get = <T>(
  endpoint: string,
  params?: Record<string, any> | null
): Promise<AxiosResponse<T>> => {
  return axios.get<T>(API_BASE_URL + endpoint, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
    params: params,
  });
};

const post = <T>(endpoint: string, data: any): Promise<AxiosResponse<T>> => {
  return axios.post<T>(`${API_BASE_URL}${endpoint}`, data, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
  });
};

const put = <T>(endpoint: string, data: any): Promise<AxiosResponse<T>> => {
  return axios.put<T>(`${API_BASE_URL}${endpoint}`, data, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
  });
};

const del = <T>(
  endpoint: string,
  data?: Record<string, any>
): Promise<AxiosResponse<T>> => {
  return axios.delete<T>(`${API_BASE_URL}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
    data,
  });
};

const downloadQRCode = (deviceIds: number[]): Promise<AxiosResponse<Blob>> => {
  return axios.post(`${API_BASE_URL}api/v1/devices/download`, deviceIds, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
    responseType: "blob",
  });
};

const exportToExcel = (): Promise<AxiosResponse<Blob>> => {
  return axios.get(`${API_BASE_URL}api/v1/excels/export`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
    responseType: "blob",
  });
};

const importFromExcel = (file: File): Promise<AxiosResponse<void>> => {
  const formData = new FormData();
  formData.append("file", file);
  return axios.post(`${API_BASE_URL}api/v1/excels/import`, formData, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "multipart/form-data",
    },
  });
};

const exportSelectedDevicesToExcel = (
  deviceIds: number[]
): Promise<AxiosResponse<Blob>> => {
  return axios.post(`${API_BASE_URL}api/v1/excels/exportSelected`, deviceIds, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
    responseType: "blob",
  });
};

export default {
  get,
  post,
  put,
  del,
  downloadQRCode,
  exportToExcel,
  importFromExcel,
  exportSelectedDevicesToExcel,
};
