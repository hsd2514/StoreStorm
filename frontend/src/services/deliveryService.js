import api from './api';

export const deliveryService = {
  /**
   * List all delivery batches for the current shop
   */
  list: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = `/deliveries/${queryParams ? `?${queryParams}` : ''}`;
    const result = await api(endpoint);
    return result.deliveries;
  },

  /**
   * Get a single delivery batch
   */
  get: (id) => api(`/deliveries/${id}`),

  /**
   * Create a new delivery batch
   */
  create: (deliveryData) => api('/deliveries/', {
    method: 'POST',
    body: JSON.stringify(deliveryData),
  }),

  /**
   * Update delivery batch info
   */
  update: (id, deliveryData) => api(`/deliveries/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(deliveryData),
  }),

  /**
   * Start a delivery batch
   */
  start: (id) => api(`/deliveries/${id}/start`, {
    method: 'PATCH',
  }),

  /**
   * Complete a delivery batch
   */
  complete: (id) => api(`/deliveries/${id}/complete`, {
    method: 'PATCH',
  }),

  /**
   * Create a new delivery route with crate-based batching
   */
  createRoute: (routeData) => api('/deliveries/create-route', {
    method: 'POST',
    body: JSON.stringify(routeData),
  }),

  /**
   * Update delivery status with actor validation
   */
  updateStatus: (id, newStatus, actor = 'shop_owner') => api(`/deliveries/${id}/status?new_status=${newStatus}&actor=${actor}`, {
    method: 'PATCH',
  }),

  /**
   * Update individual stop status
   */
  updateStopStatus: (id, stopSequence) => api(`/deliveries/${id}/stops/${stopSequence}`, {
    method: 'PATCH',
  }),

  /**
   * Delete a delivery batch
   */
  delete: (id) => api(`/deliveries/${id}`, {
    method: 'DELETE',
  }),
};
