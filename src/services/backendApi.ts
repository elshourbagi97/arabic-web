// API Service for Backend Communication
// This file contains all API calls to the Laravel backend

import api from "@/lib/axios";

// Helper function to get auth token
function getAuthToken(): string | null {
  return localStorage.getItem("auth_token");
}

// Helper function to set auth token
function setAuthToken(token: string): void {
  localStorage.setItem("auth_token", token);
}

// Helper function to remove auth token
function removeAuthToken(): void {
  localStorage.removeItem("auth_token");
}

// Helper function for API requests
async function apiRequest(
  endpoint: string,
  method: string = "GET",
  body?: any,
): Promise<any> {
  const token = getAuthToken();

  try {
    const resp = await api.request({
      url: endpoint,
      method: method as any,
      data: body ?? undefined,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    return resp.data;
  } catch (err: any) {
    if (err.response?.status === 401) {
      removeAuthToken();
      window.location.href = "/login";
    }
    throw new Error(err.response?.data?.message || "API request failed");
  }
}

// ==================== AUTHENTICATION ====================

export const AuthService = {
  async login(email: string, password: string) {
    const resp = await api.post(`/auth/login`, { email, password });
    setAuthToken(resp.data?.token ?? resp.token ?? "");
    return resp.data?.user ?? resp.user ?? resp;
  },

  async register(
    name: string,
    email: string,
    password: string,
    passwordConfirmation: string,
  ) {
    const resp = await api.post(`/auth/register`, {
      name,
      email,
      password,
      password_confirmation: passwordConfirmation,
    });
    setAuthToken(resp.data?.token ?? resp.token ?? "");
    return resp.data?.user ?? resp.user ?? resp;
  },

  async logout() {
    await apiRequest("/auth/logout", "POST");
    removeAuthToken();
  },

  async getProfile() {
    return apiRequest("/auth/profile");
  },
};

// ==================== TABLES ====================

export const TableService = {
  async getAllTables() {
    return apiRequest("/tables");
  },

  async createTable(label: string, columnHeaders: string[]) {
    return apiRequest("/tables", "POST", {
      label,
      column_headers: columnHeaders,
    });
  },

  async getTable(tableId: string) {
    return apiRequest(`/tables/${tableId}`);
  },

  async updateTable(tableId: string, data: any) {
    return apiRequest(`/tables/${tableId}`, "PUT", data);
  },

  async deleteTable(tableId: string) {
    return apiRequest(`/tables/${tableId}`, "DELETE");
  },

  async addRow(tableId: string, rowData: string[]) {
    return apiRequest(`/tables/${tableId}/rows`, "POST", { row_data: rowData });
  },

  async updateRow(rowId: string, rowData: string[]) {
    return apiRequest(`/rows/${rowId}`, "PUT", { row_data: rowData });
  },

  async deleteRow(rowId: string) {
    return apiRequest(`/rows/${rowId}`, "DELETE");
  },
};

// ==================== IMAGES ====================

export const ImageService = {
  async getAllImages() {
    return apiRequest("/images");
  },

  async uploadImage(file: File, description?: string) {
    const formData = new FormData();
    formData.append("file", file);
    if (description) {
      formData.append("description", description);
    }

    const token = getAuthToken();

    try {
      const resp = await api.post("/images", formData, {
        headers: token
          ? { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
          : { "Content-Type": "multipart/form-data" },
      });
      return resp.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || "Image upload failed");
    }
  },

  async deleteImage(imageId: string) {
    return apiRequest(`/images/${imageId}`, "DELETE");
  },
};

// ==================== PDF EXPORT ====================

export const PdfService = {
  async exportTablePdf(tableId: string, tableName: string) {
    const token = getAuthToken();
    if (!token) {
      throw new Error("Not authenticated");
    }

    try {
      const resp = await api.get(`/tables/${tableId}/export-pdf`, {
        responseType: "blob",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/pdf" },
      });

      const blob = resp.data as Blob;
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${tableName}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};

// ==================== ADMIN ====================

export const AdminService = {
  async getAllUsers() {
    return apiRequest("/admin/users");
  },

  async getUserDetails(userId: string) {
    return apiRequest(`/admin/users/${userId}`);
  },

  async deleteUser(userId: string) {
    return apiRequest(`/admin/users/${userId}`, "DELETE");
  },
};

export default {
  AuthService,
  TableService,
  ImageService,
  PdfService,
  AdminService,
};
