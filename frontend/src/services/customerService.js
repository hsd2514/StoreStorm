import api from './api';

export const customerService = {
  /**
   * List all customers for the current shop
   */
  list: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = `/customers/${queryParams ? `?${queryParams}` : ''}`;
    const result = await api(endpoint);
    return result.customers;
  },

  /**
   * Get a single customer by ID
   */
  get: (id) => api(`/customers/${id}`),

  /**
   * Create a new customer
   */
  create: (customerData) => api('/customers/', {
    method: 'POST',
    body: JSON.stringify(customerData),
  }),

  /**
   * Update an existing customer
   */
  update: (id, customerData) => api(`/customers/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(customerData),
  }),

  /**
   * Delete a customer
   */
  delete: (id) => api(`/customers/${id}`, {
    method: 'DELETE',
  }),
};
