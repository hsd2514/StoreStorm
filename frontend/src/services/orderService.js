import api from './api';

export const orderService = {
  /**
   * List all orders for the current shop
   */
  list: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = `/orders/${queryParams ? `?${queryParams}` : ''}`;
    const result = await api(endpoint);
    return result?.orders || [];
  },

  /**
   * Get a single order by ID
   */
  get: (id) => api(`/orders/${id}`),

  /**
   * Create a new order
   */
  create: (orderData) => api('/orders/', {
    method: 'POST',
    body: JSON.stringify(orderData),
  }),

  /**
   * Update order status
   */
  updateStatus: (id, status) => api(`/orders/${id}/status?status=${status}`, {
    method: 'PATCH',
  }),

  /**
   * Batch update or general update
   */
  update: (id, orderData) => api(`/orders/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(orderData),
  }),
};
