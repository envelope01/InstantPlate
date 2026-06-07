import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Automatically attach JWT token to all requests if it exists
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// ==========================================
// AUTHENTICATION
// ==========================================
export const signup = async (email, password, role = 'OWNER') => {
  const response = await API.post('/auth/signup', { email, password, role });
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
  }
  return response.data;
};

export const login = async (email, password) => {
  const response = await API.post('/auth/login', { email, password });
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
  }
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('token');
};

export const getMe = async () => {
  const response = await API.get('/auth/me');
  return response.data;
};

// ==========================================
// RESTAURANT MANAGEMENT
// ==========================================
export const getRestaurant = async (slugOrId) => {
  const response = await API.get(`/restaurants/${slugOrId}`);
  return response.data;
};

export const getMyRestaurant = async () => {
  const response = await API.get('/restaurants/my-restaurant');
  return response.data;
};

export const updateRestaurant = async (id, data) => {
  const response = await API.patch(`/restaurants/${id}`, data);
  return response.data;
};

export const addTable = async (id, tableName) => {
  const response = await API.post(`/restaurants/${id}/tables`, { tableName });
  return response.data;
};

export const removeTable = async (id, tableName) => {
  const response = await API.delete(`/restaurants/${id}/tables`, { data: { tableName } });
  return response.data;
};

// ==========================================
// MENU MANAGEMENT (SECTIONS & ITEMS)
// ==========================================
export const createSection = async (data) => {
  const response = await API.post('/menu/sections', data);
  return response.data;
};

export const updateSection = async (id, data) => {
  const response = await API.patch(`/menu/sections/${id}`, data);
  return response.data;
};

export const deleteSection = async (id) => {
  const response = await API.delete(`/menu/sections/${id}`);
  return response.data;
};

export const createMenuItem = async (data) => {
  const response = await API.post('/menu/items', data);
  return response.data;
};

export const updateMenuItem = async (id, data) => {
  const response = await API.patch(`/menu/items/${id}`, data);
  return response.data;
};

export const deleteMenuItem = async (id) => {
  const response = await API.delete(`/menu/items/${id}`);
  return response.data;
};

// ==========================================
// ORDERS
// ==========================================
export const createOrder = async (data) => {
  const response = await API.post('/orders', data);
  return response.data;
};

export const getRestaurantOrders = async (restaurantId) => {
  const response = await API.get(`/orders?restaurantId=${restaurantId}`);
  return response.data;
};

export const getOrder = async (id) => {
  const response = await API.get(`/orders/${id}`);
  return response.data;
};

export const updateOrderStatus = async (id, status) => {
  const response = await API.patch(`/orders/${id}/status`, { status });
  return response.data;
};

// ==========================================
// CALL SERVICE / SERVICE REQUESTS
// ==========================================
export const createServiceRequest = async (data) => {
  const response = await API.post('/requests', data);
  return response.data;
};

export const getRestaurantRequests = async (restaurantId) => {
  const response = await API.get(`/requests?restaurantId=${restaurantId}`);
  return response.data;
};

export const resolveServiceRequest = async (id) => {
  const response = await API.patch(`/requests/${id}/resolve`);
  return response.data;
};

// ==========================================
// FEEDBACK & METRICS
// ==========================================
export const createFeedback = async (data) => {
  const response = await API.post('/feedbacks', data);
  return response.data;
};

export const getRestaurantFeedbacks = async (restaurantId) => {
  const response = await API.get(`/feedbacks?restaurantId=${restaurantId}`);
  return response.data;
};

export const getMetrics = async (restaurantId) => {
  const response = await API.get(`/feedbacks/metrics?restaurantId=${restaurantId}`);
  return response.data;
};

export default API;
