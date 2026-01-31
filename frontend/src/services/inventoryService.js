import api from './api';

export const inventoryService = {
  /**
   * List all inventory items for the current shop
   */
  list: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = `/inventory/${queryParams ? `?${queryParams}` : ''}`;
    const result = await api(endpoint);
    return result.inventory;
  },

  /**
   * Get a single inventory item by ID
   */
  get: (id) => api(`/inventory/${id}`),

  /**
   * Create a new inventory item
   */
  create: (inventoryData) => api('/inventory/', {
    method: 'POST',
    body: JSON.stringify(inventoryData),
  }),

  /**
   * Update an existing inventory item
   */
  update: (id, inventoryData) => api(`/inventory/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(inventoryData),
  }),

  /**
   * Delete an inventory item
   */
  delete: (id) => api(`/inventory/${id}`, {
    method: 'DELETE',
  }),
};
