import axios from 'axios';

const API = axios.create({
baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080/api'});

// Dashboard
export const getDashboardKpis = () => API.get('/dashboard/kpis');
export const getMonthlyTrend  = () => API.get('/dashboard/monthly-trend');

// Restaurants
export const getRestaurants    = ()       => API.get('/restaurants');
export const getRestaurantById = (id)     => API.get(`/restaurants/${id}`);
export const createRestaurant  = (data)   => API.post('/restaurants', data);
export const updateRestaurant  = (id, d)  => API.put(`/restaurants/${id}`, d);
export const deleteRestaurant  = (id)     => API.delete(`/restaurants/${id}`);

// Suppliers
export const getSuppliers    = ()      => API.get('/suppliers');
export const createSupplier  = (data)  => API.post('/suppliers', data);
export const updateSupplier  = (id, d) => API.put(`/suppliers/${id}`, d);
export const deleteSupplier  = (id)    => API.delete(`/suppliers/${id}`);

// Cylinders
export const getCylinders    = ()      => API.get('/cylinders');
export const createCylinder  = (data)  => API.post('/cylinders', data);
export const updateCylinder  = (id, d) => API.put(`/cylinders/${id}`, d);
export const deleteCylinder  = (id)    => API.delete(`/cylinders/${id}`);

// Inventory
export const getInventory      = ()      => API.get('/inventory');
export const getCriticalInventory = ()   => API.get('/inventory/critical');
export const getInventorySummary  = ()   => API.get('/inventory/summary');
export const createInventory   = (data)  => API.post('/inventory', data);
export const updateInventory   = (id, d) => API.put(`/inventory/${id}`, d);
export const adjustInventory   = (id, d) => API.patch(`/inventory/${id}/adjust`, d);
export const deleteInventory   = (id)    => API.delete(`/inventory/${id}`);

// Orders
export const getOrders         = ()      => API.get('/orders');
export const getPendingOrders  = ()      => API.get('/orders/pending');
export const createOrder       = (data)  => API.post('/orders', data);
export const updateOrderStatus = (id, s) => API.patch(`/orders/${id}/status`, { status: s });
export const deleteOrder       = (id)    => API.delete(`/orders/${id}`);

// Gas Usage
export const getGasUsage    = ()      => API.get('/gas-usage');
export const createGasUsage = (data)  => API.post('/gas-usage', data);
export const deleteGasUsage = (id)    => API.delete(`/gas-usage/${id}`);

export default API;
