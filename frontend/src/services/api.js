import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('eatloop_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('eatloop_token');
      localStorage.removeItem('eatloop_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
  forgotPassword: (email) => API.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => API.put(`/auth/reset-password/${token}`, { password }),
  updatePassword: (data) => API.put('/auth/update-password', data),
};

// Restaurants
export const restaurantAPI = {
  getAll: (params) => API.get('/restaurants', { params }),
  getById: (id) => API.get(`/restaurants/${id}`),
  getNearby: (params) => API.get('/restaurants/nearby', { params }),
  create: (data) => API.post('/restaurants', data),
  update: (id, data) => API.put(`/restaurants/${id}`, data),
  getAnalytics: () => API.get('/restaurants/owner/analytics'),
  toggleStatus: () => API.put('/restaurants/owner/toggle-status'),
};

// Menu
export const menuAPI = {
  getByRestaurant: (id) => API.get(`/menu/restaurant/${id}`),
  search: (q) => API.get('/menu/search', { params: { q } }),
  create: (data) => API.post('/menu', data),
  update: (id, data) => API.put(`/menu/${id}`, data),
  delete: (id) => API.delete(`/menu/${id}`),
};

// Orders
export const orderAPI = {
  place: (data) => API.post('/orders', data),
  getMyOrders: (params) => API.get('/orders/my', { params }),
  getById: (id) => API.get(`/orders/${id}`),
  updateStatus: (id, data) => API.put(`/orders/${id}/status`, data),
  cancel: (id, reason) => API.put(`/orders/${id}/cancel`, { reason }),
  rate: (id, data) => API.put(`/orders/${id}/rate`, data),
  getRestaurantOrders: (params) => API.get('/orders/restaurant', { params }),
};

// Users
export const userAPI = {
  updateProfile: (data) => API.put('/users/profile', data),
  toggleWishlist: (itemId) => API.put(`/users/wishlist/${itemId}`),
};

// AI
export const aiAPI = {
  getRecommendations: () => API.get('/ai/recommendations'),
  analyzeSentiment: (text) => API.post('/ai/sentiment', { text }),
  getDemandForecast: () => API.get('/ai/demand-forecast'),
  getNutrition: (itemIds) => API.post('/ai/nutrition', { itemIds }),
  predictDelivery: (data) => API.post('/ai/predict-delivery', data),
  detectFraud: (data) => API.post('/ai/fraud-detect', data),
};

// Payments
export const paymentAPI = {
  createIntent: (data) => API.post('/payments/create-intent', data),
  verify: (data) => API.post('/payments/verify', data),
};

// Reviews
export const reviewAPI = {
  create: (data) => API.post('/reviews', data),
  getByRestaurant: (id) => API.get(`/reviews/restaurant/${id}`),
};

// Coupons
export const couponAPI = {
  validate: (data) => API.post('/coupons/validate', data),
  getAll: () => API.get('/coupons'),
};

// Delivery
export const deliveryAPI = {
  register: (data) => API.post('/delivery/register', data),
  updateLocation: (data) => API.put('/delivery/location', data),
  toggleOnline: () => API.put('/delivery/toggle-online'),
  getProfile: () => API.get('/delivery/profile'),
};

// Admin
export const adminAPI = {
  getDashboard: () => API.get('/admin/dashboard'),
  getRestaurants: () => API.get('/admin/restaurants'),
  updateRestaurantStatus: (id, status) => API.put(`/admin/restaurants/${id}/status`, { status }),
  getUsers: () => API.get('/admin/users'),
  toggleUser: (id) => API.put(`/admin/users/${id}/toggle`),
  getDeliveryPartners: () => API.get('/admin/delivery-partners'),
  updatePartnerStatus: (id, status) => API.put(`/admin/delivery-partners/${id}/status`, { status }),
  getRevenue: () => API.get('/admin/revenue'),
};

// Notifications
export const notifAPI = {
  getAll: () => API.get('/notifications'),
  markRead: (id) => API.put(`/notifications/${id}/read`),
  markAllRead: () => API.put('/notifications/mark-all-read'),
};

export default API;
