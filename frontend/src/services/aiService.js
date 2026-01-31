import api from './api'

export const aiService = {
  async getInventoryInsights(shopId) {
    return api('/ai/insights/inventory', {
      method: 'POST',
      body: JSON.stringify({ shop_id: shopId })
    })
  },

  async parseOrder(text, shopId) {
    return api('/ai/parse/order', {
      method: 'POST',
      body: JSON.stringify({ text, shop_id: shopId })
    })
  },

  async categorizeGST(productName, category = null) {
    return api('/ai/categorize/gst', {
      method: 'POST',
      body: JSON.stringify({ product_name: productName, category })
    })
  },

  async optimizeRoute(shopId, orderIds) {
    return api('/ai/optimize/route', {
      method: 'POST',
      body: JSON.stringify({ shop_id: shopId, order_ids: orderIds })
    })
  }
}
