/* ============================================================
   API Helper - All fetch calls go through here
   ============================================================ */

const API_BASE = 'http://localhost:5000/api';

function getToken() {
  return localStorage.getItem('token');
}

function getUser() {
  const u = localStorage.getItem('user');
  return u ? JSON.parse(u) : null;
}

function saveAuth(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

function clearAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

async function apiRequest(method, endpoint, data = null) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const options = { method, headers };
  if (data) options.body = JSON.stringify(data);

  const response = await fetch(`${API_BASE}${endpoint}`, options);
  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.message || 'Request failed');
  }
  return json;
}

const API = {
  // Auth
  login: (data) => apiRequest('POST', '/auth/login', data),
  register: (data) => apiRequest('POST', '/auth/register', data),
  getMe: () => apiRequest('GET', '/auth/me'),
  updateProfile: (data) => apiRequest('PUT', '/auth/profile', data),
  changePassword: (data) => apiRequest('PUT', '/auth/change-password', data),

  // Couriers
  getCouriers: () => apiRequest('GET', '/couriers'),
  createCourier: (data) => apiRequest('POST', '/couriers', data),
  getCourier: (id) => apiRequest('GET', `/couriers/${id}`),
  cancelCourier: (id) => apiRequest('DELETE', `/couriers/${id}`),

  // Tracking (public)
  trackCourier: (trackingNumber) => apiRequest('GET', `/tracking/${trackingNumber}`),

  // Shipments
  getShipments: () => apiRequest('GET', '/shipments'),
  updateShipmentStatus: (id, data) => apiRequest('PUT', `/shipments/${id}/status`, data),

  // Delivery Agents
  getDeliveryAgents: () => apiRequest('GET', '/delivery-agents'),
  createDeliveryAgent: (data) => apiRequest('POST', '/delivery-agents/create', data),
  updateDeliveryAgent: (id, data) => apiRequest('PUT', `/delivery-agents/${id}`, data),

  // Admin
  getAdminDashboard: () => apiRequest('GET', '/admin/dashboard'),
  getAdminCustomers: () => apiRequest('GET', '/admin/customers'),
  getAdminCouriers: (params = '') => apiRequest('GET', `/admin/couriers${params}`),
  assignAgent: (courierId, agentId) => apiRequest('PUT', `/admin/couriers/${courierId}/assign`, { agentId }),
  getReports: () => apiRequest('GET', '/admin/reports'),
  toggleUserStatus: (id) => apiRequest('PUT', `/admin/users/${id}/toggle`),
};
