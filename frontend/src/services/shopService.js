import api from './api';

export const shopService = {
  /**
   * Get current shop details
   */
  get: (id) => api(`/shops/${id}`),

  /**
   * Update shop settings
   */
  update: (id, shopData) => api(`/shops/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(shopData),
  }),

  /**
   * List shops for owner
   */
  listByOwner: (ownerId) => api(`/shops/?owner_id=${ownerId}`),
};
