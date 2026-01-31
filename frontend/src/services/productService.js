import api from './api';

export const productService = {
  /**
   * List all products for the current shop
   */
  list: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = `/products/${queryParams ? `?${queryParams}` : ''}`;
    const result = await api(endpoint);
    return result.products;
  },

  /**
   * Get a single product by ID
   */
  get: (id) => api(`/products/${id}`),

  /**
   * Create a new product
   */
  create: (productData) => api('/products/', {
    method: 'POST',
    body: JSON.stringify(productData),
  }),

  /**
   * Update an existing product
   */
  update: (id, productData) => api(`/products/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(productData),
  }),

  /**
   * Delete a product
   */
  delete: (id) => api(`/products/${id}`, {
    method: 'DELETE',
  }),
};
