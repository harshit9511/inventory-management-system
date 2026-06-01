import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.detail || error.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

// Products API
export const productsAPI = {
  getAll: (params = {}) => api.get('/api/products/', { params }),
  getById: (id) => api.get(`/api/products/${id}`),
  create: (data) => api.post('/api/products/', data),
  update: (id, data) => api.put(`/api/products/${id}`, data),
  delete: (id) => api.delete(`/api/products/${id}`),
  updateStock: (id, quantity) => api.patch(`/api/products/${id}/stock`, null, { params: { quantity } }),
};

// Customers API
export const customersAPI = {
  getAll: (params = {}) => api.get('/api/customers/', { params }),
  getById: (id) => api.get(`/api/customers/${id}`),
  create: (data) => api.post('/api/customers/', data),
  update: (id, data) => api.put(`/api/customers/${id}`, data),
  delete: (id) => api.delete(`/api/customers/${id}`),
};

// Orders API
export const ordersAPI = {
  getAll: (params = {}) => api.get('/api/orders/', { params }),
  getById: (id) => api.get(`/api/orders/${id}`),
  create: (data) => api.post('/api/orders/', data),
  update: (id, data) => api.put(`/api/orders/${id}`, data),
  delete: (id) => api.delete(`/api/orders/${id}`),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get('/api/dashboard/stats'),
};

export default api;
