const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const businessAPI = {
  getConfig: () => request('/business/config/full'),
  listProfiles: () => request('/business'),
  createProfile: (data) => request('/business', { method: 'POST', body: JSON.stringify(data) }),
  getProfile: (id) => request(`/business/${id}`)
};

export const inventoryAPI = {
  getItems: (businessId) => request(`/inventory/${businessId}/items`),
  getLowStock: (businessId) => request(`/inventory/${businessId}/items/low`),
  createItem: (businessId, data) =>
    request(`/inventory/${businessId}/items`, { method: 'POST', body: JSON.stringify(data) }),
  updateItem: (id, data) =>
    request(`/inventory/items/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteItem: (id) => request(`/inventory/items/${id}`, { method: 'DELETE' }),
  reorderLowStock: (businessId) =>
    request(`/inventory/${businessId}/reorder`, { method: 'POST' }),
  getReorders: (businessId) => request(`/inventory/${businessId}/reorders`)
};

export const staffAPI = {
  getEmployees: (businessId) => request(`/staff/${businessId}/employees`),
  createEmployee: (businessId, data) =>
    request(`/staff/${businessId}/employees`, { method: 'POST', body: JSON.stringify(data) }),
  updateEmployee: (id, data) =>
    request(`/staff/employees/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getShifts: (businessId, params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/staff/${businessId}/shifts${qs ? '?' + qs : ''}`);
  },
  createShift: (businessId, data) =>
    request(`/staff/${businessId}/shifts`, { method: 'POST', body: JSON.stringify(data) }),
  updateShift: (id, data) =>
    request(`/staff/shifts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getAppointments: (businessId) => request(`/staff/${businessId}/appointments`)
};

export const suppliersAPI = {
  getSuppliers: (businessId) => request(`/suppliers/${businessId}`),
  createSupplier: (businessId, data) =>
    request(`/suppliers/${businessId}`, { method: 'POST', body: JSON.stringify(data) }),
  compareSuppliers: (businessId) =>
    request(`/suppliers/${businessId}/compare`, { method: 'PUT' }),
  getOrders: (businessId) => request(`/suppliers/${businessId}/orders`),
  updateOrderStatus: (id, status) =>
    request(`/suppliers/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) })
};

export const chatAPI = {
  send: (data) => request('/chat', { method: 'POST', body: JSON.stringify(data) }),
  getHistory: (businessId) => request(`/chat/${businessId}/history`)
};
