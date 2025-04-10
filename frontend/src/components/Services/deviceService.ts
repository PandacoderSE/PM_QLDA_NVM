import { ApiResponse } from "../../model/ApiResponse";
import { Device } from "../../model/Device";
import { Page } from "../../model/Page";
import api from "./api";

export interface DeviceListRequest {
  page: number;
  pageSize: number;
  accountingCode?: string;
  location?: string;
  manufacturer?: string;
  notes?: string;
  purchaseDate?: string;
  purpose?: string;
  serialNumber?: string;
  categoryId?: number;
  expirationDate?: string;
}

export interface DeviceRequest {
  accountingCode: string;
  manufacture: string;
  notes: string;
  purchaseDate?: string;
  purpose: string;
  serialNumber: string;
  specification: string;
  categoryId: number | undefined;
  expirationDate?: string;
}

const getDevices = async (
  params: DeviceListRequest | undefined
): Promise<Page<Device>> => {
  try {
    const response = await api.get<ApiResponse<Page<Device>>>(
      "api/v1/devices/list",
      params
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching device:", error);
    throw error;
  }
};

const getDeviceById = async (id: string): Promise<Device> => {
  try {
    const response = await api.get<ApiResponse<Device>>(`api/v1/devices/${id}`);
    return response.data.data;
  } catch (error: any) {
    throw Error(error.response.data.message);
  }
};

const createDevice = async (data: DeviceRequest): Promise<Device> => {
  try {
    const response = await api.post<ApiResponse<Device>>(
      "api/v1/devices/create",
      data
    );
    return response.data.data;
  } catch (error: any) {
    throw Error(error.response.data.message);
  }
};

const updateDevice = async (
  id: string,
  data: DeviceRequest
): Promise<Device> => {
  try {
    const response = await api.put<ApiResponse<Device>>(
      "api/v1/devices/update/" + id,
      data
    );
    return response.data.data;
  } catch (error: any) {
    throw Error(error.response.data.message);
  }
};

const deleteDevice = async (ids: number[]): Promise<void> => {
  try {
    await api.del<void>("api/v1/devices/delete", ids);
  } catch (error) {
    console.error("Error delete device:", error);
    throw error;
  }
};


export default {
  getDevices,
  getDeviceById,
  createDevice,
  updateDevice,
  deleteDevice,
};
