import axios from "axios";

// Create central axios instance
// In Vite development, `/api` is proxied to `http://localhost:3000` via server config
const API = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Auth endpoints
export const authAPI = {
  login: async (email, password) => {
    const { data } = await API.post("/auth/login", { email, password });
    return data;
  },
  logout: async () => {
    const { data } = await API.post("/auth/logout");
    return data;
  },
  getMe: async () => {
    const { data } = await API.get("/auth/me");
    return data;
  },
};

// Products endpoints
export const productsAPI = {
  getAll: async () => {
    const { data } = await API.get("/products");
    return data;
  },
  getBySlug: async (slug) => {
    const { data } = await API.get(`/products/${slug}`);
    return data;
  },
  create: async (productData) => {
    const { data } = await API.post("/products", productData);
    return data;
  },
  update: async (id, productData) => {
    const { data } = await API.put(`/products/${id}`, productData);
    return data;
  },
  delete: async (id) => {
    const { data } = await API.delete(`/products/${id}`);
    return data;
  },
};

// Categories endpoints
export const categoriesAPI = {
  getAll: async () => {
    const { data } = await API.get("/categories");
    return data;
  },
  create: async (categoryData) => {
    const { data } = await API.post("/categories", categoryData);
    return data;
  },
  update: async (id, categoryData) => {
    const { data } = await API.put(`/categories/${id}`, categoryData);
    return data;
  },
  delete: async (id) => {
    const { data } = await API.delete(`/categories/${id}`);
    return data;
  },
};

// Leads endpoints
export const leadsAPI = {
  submit: async (leadData) => {
    const { data } = await API.post("/leads", leadData);
    return data;
  },
  getAll: async () => {
    const { data } = await API.get("/leads/admin");
    return data;
  },
  updateStatus: async (id, status) => {
    const { data } = await API.put(`/leads/admin/${id}`, { status });
    return data;
  },
};

// Content settings endpoints
export const contentAPI = {
  get: async () => {
    const { data } = await API.get("/content");
    return data;
  },
  update: async (contentData) => {
    const { data } = await API.put("/content", contentData);
    return data;
  },
};

// File upload endpoints
export const uploadAPI = {
  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await API.post("/admin/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  },
};
