import api from './api';

export const gstReportService = {
  /**
   * List all GST reports for the current shop
   */
  list: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = `/gst-reports/${queryParams ? `?${queryParams}` : ''}`;
    const result = await api(endpoint);
    return result.reports;
  },

  /**
   * Get a single GST report
   */
  get: (id) => api(`/gst-reports/${id}`),

  /**
   * Generate/Create a new GST report
   */
  create: (reportData) => api('/gst-reports/', {
    method: 'POST',
    body: JSON.stringify(reportData),
  }),

  /**
   * Mark a GST report as filed
   */
  file: (id) => api(`/gst-reports/${id}/file`, {
    method: 'PATCH',
  }),

  /**
   * Delete a GST report
   */
  delete: (id) => api(`/gst-reports/${id}`, {
    method: 'DELETE',
  }),
};
