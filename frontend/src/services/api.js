import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const BASE_URL = import.meta.env.VITE_BASE_URL || '';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Helper to get full image URL
export const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${BASE_URL}${path}`;
};

// Auth APIs
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data)
};


// Courses APIs
export const coursesAPI = {
  getCourses: (params) => api.get('/courses', { params }),
  getCourse: (id) => api.get(`/courses/${id}`),
  getCategories: () => api.get('/courses/categories'),
  getMyCourses: () => api.get('/courses/my')
};

// Quotations APIs
export const quotationsAPI = {
  create: (data) => api.post('/quotations', data),
  getMyQuotations: (params) => api.get('/quotations/my', { params }),
  getQuotation: (id) => api.get(`/quotations/${id}`),
  downloadPDF: (id) => api.get(`/quotations/${id}/pdf`)
};

// Settings APIs (public)
export const settingsAPI = {
  getStoreSettings: () => api.get('/settings/store')
};


// Admin APIs
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),

  // Courses
  getCourses: (params) => api.get('/admin/courses', { params }),
  createCourse: (formData) => api.post('/admin/courses', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateCourse: (id, formData) => api.put(`/admin/courses/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteCourse: (id) => api.delete(`/admin/courses/${id}`),
  getCategories: () => api.get('/courses/categories'),

  // Quotations
  getQuotations: (params) => api.get('/admin/quotations', { params }),
  getQuotation: (id) => api.get(`/admin/quotations/${id}`),
  updateQuotationStatus: (id, data) => api.patch(`/admin/quotations/${id}/status`, data),
  editQuotation: (id, data) => api.put(`/admin/quotations/${id}/edit`, data),
  generatePDF: (id) => api.post(`/admin/quotations/${id}/generate-pdf`),
  getPDF: (id) => api.get(`/admin/quotations/${id}/pdf`),
  sendQuotation: (id, data) => api.post(`/admin/quotations/${id}/send`, data),

  // Quote Settings
  getQuoteSettings: () => api.get('/admin/settings/quote'),
  updateQuoteSettings: (data) => api.put('/admin/settings/quote', data),

  // Store Settings
  getStoreSettings: () => api.get('/admin/settings/store'),
  updateStoreSettings: (formData) => api.put('/admin/settings/store', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  uploadLogo: (formData) => api.post('/admin/settings/store/logo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteLogo: () => api.delete('/admin/settings/store/logo')
};

export default api;
