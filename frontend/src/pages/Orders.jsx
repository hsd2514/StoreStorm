import { useState, useEffect } from 'react'
import {
  Search,
  Filter,
  Plus,
  Package,
  Clock,
  CheckCircle,
  Truck,
  IndianRupee,
  MoreVertical,
  MessageSquare,
  ChevronDown,
  X,
  MapPin,
  Phone,
  User,
  Calendar,
  AlertCircle,
  Trash2,
  ShoppingCart,
  ChevronRight,
  Minus,
  Wand2,
  Sparkles
} from 'lucide-react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import DashboardLayout from '../components/layout/DashboardLayout'
import { cn } from '../lib/utils'
import { Badge, Button, Input, Select, TextArea, Modal, ModalFooter, LoadingSpinner, EmptyState, Card } from '../components/ui'
import { orderService } from '../services/orderService'
import { customerService } from '../services/customerService'
import { productService } from '../services/productService'
import { aiService } from '../services/aiService'
import { useShop } from '../context/ShopContext'

const statusConfig = {
  pending: { label: 'Pending', color: 'warning', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'success', icon: CheckCircle },
  preparing: { label: 'Preparing', color: 'info', icon: Package },
  out_for_delivery: { label: 'Out for Delivery', color: 'purple', icon: Truck },
  delivered: { label: 'Delivered', color: 'emerald', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'danger', icon: X }
}

export default function Orders() {
  const { shop } = useShop()
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [error, setError] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)
  
  // Pagination State
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [totalOrders, setTotalOrders] = useState(0)

  // Create Order Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [customers, setCustomers] = useState([])
  const [products, setProducts] = useState([])
  const [productSearch, setProductSearch] = useState('')
  
  // AI Order Parser State
  const [isAIModalOpen, setIsAIModalOpen] = useState(false)
  const [aiText, setAiText] = useState('')
  const [isParsing, setIsParsing] = useState(false)

  const fetchOrders = async () => {
    if (!shop?.id) return
    try {
      setLoading(true)
      const filters = { 
        shop_id: shop.id,
        skip: (page - 1) * limit,
        limit: limit
      }
      if (statusFilter !== 'all') {
        filters.status = statusFilter
      }
      const fetchedOrders = await orderService.list(filters) || []
      setOrders(fetchedOrders)
      setTotalOrders(fetchedOrders.length)
    } catch (err) {
      console.error('Failed to fetch orders:', err)
      setError('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [shop?.id, statusFilter, page])

  const loadResources = async () => {
    if (!shop?.id) return
    try {
      const [featCustomers, featProducts] = await Promise.all([
        customerService.list({ shop_id: shop.id }),
        productService.list({ shop_id: shop.id })
      ])
      setCustomers(featCustomers || [])
      setProducts(featProducts || [])
    } catch (err) {
      console.error('Failed to load resources:', err)
    }
  }

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await orderService.updateStatus(orderId, newStatus)
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus })
      }
    } catch (err) {
      console.error('Failed to update status:', err)
    }
  }

  // Create Order Formik
  const orderFormik = useFormik({
    initialValues: {
      customer_id: '',
      items: [],
      delivery_address: '',
      notes: '',
      source: 'storefront'
    },
    validationSchema: Yup.object({
      customer_id: Yup.string().required('Customer is required'),
      items: Yup.array().min(1, 'Add at least one item').required('Required'),
      delivery_address: Yup.string().required('Delivery address is required'),
    }),
    onSubmit: async (values) => {
      try {
        setLoading(true)
        const subtotal = values.items.reduce((acc, item) => acc + item.total, 0)
        const gst_amount = values.items.reduce((acc, item) => {
          const p = products.find(prod => prod.id === item.product_id)
          return acc + (item.total * (p?.gst_rate || 0) / 100)
        }, 0)

        const orderData = {
          ...values,
          shop_id: shop.id,
          order_number: `ORD-${Date.now().toString().slice(-6)}`,
          total_amount: subtotal + gst_amount,
          gst_amount: gst_amount,
          status: 'pending',
          source: values.source
        }

        await orderService.create(orderData)
        setIsCreateOpen(false)
        orderFormik.resetForm()
        fetchOrders()
      } catch (err) {
        console.error('Order creation failed:', err)
        setError('Failed to create order')
      } finally {
        setLoading(false)
      }
    }
  })

  const handleAIParse = async () => {
    if (!aiText.trim()) return
    
    try {
      setIsParsing(true)
      const result = await aiService.parseOrder(aiText, shop.id)
      
      if (result.success && result.parsed_order) {
        const { items: parsedItems, customer_name, delivery_address, notes } = result.parsed_order
        
        // Map parsed items to available products
        const orderItems = []
        for (const item of parsedItems) {
          const product = products.find(p => 
            p.name.toLowerCase() === item.product_name.toLowerCase() ||
            p.name.toLowerCase().includes(item.product_name.toLowerCase())
          )
          
          if (product) {
            orderItems.push({
              product_id: product.id,
              product_name: product.name,
              price: product.price,
              unit: product.unit,
              quantity: item.quantity,
              total: product.price * item.quantity
            })
          }
        }
        
        // Update Formik
        orderFormik.setValues({
          ...orderFormik.values,
          items: orderItems,
          delivery_address: delivery_address || orderFormik.values.delivery_address,
          notes: notes || orderFormik.values.notes
        })
        
        // Try to find customer
        if (customer_name) {
          const customer = customers.find(c => 
            c.name.toLowerCase().includes(customer_name.toLowerCase())
          )
          if (customer) {
            orderFormik.setFieldValue('customer_id', customer.id)
          }
        }
        
        setIsAIModalOpen(false)
        setAiText('')
        setIsCreateOpen(true) // Open the manual order modal to review
      }
    } catch (err) {
      console.error('AI Parse Error:', err)
      alert('Failed to parse order: ' + err.message)
    } finally {
      setIsParsing(false)
    }
  }

  const addItemToOrder = (product) => {
    const existingIndex = orderFormik.values.items.findIndex(i => i.product_id === product.id)
    if (existingIndex > -1) {
      const newItems = [...orderFormik.values.items]
      newItems[existingIndex].quantity += 1
      newItems[existingIndex].total = newItems[existingIndex].quantity * newItems[existingIndex].price
      orderFormik.setFieldValue('items', newItems)
    } else {
      const newItem = {
        product_id: product.id,
        product_name: product.name,
        quantity: 1,
        unit: product.unit,
        price: product.price,
        total: product.price
      }
      orderFormik.setFieldValue('items', [...orderFormik.values.items, newItem])
    }
  }

  const removeItemFromOrder = (productId) => {
    const newItems = orderFormik.values.items.filter(i => i.product_id !== productId)
    orderFormik.setFieldValue('items', newItems)
  }

  const updateItemQuantity = (productId, delta) => {
    const newItems = orderFormik.values.items.map(item => {
      if (item.product_id === productId) {
        const newQty = Math.max(1, item.quantity + delta)
        return {
          ...item,
          quantity: newQty,
          total: newQty * item.price
        }
      }
      return item
    })
    orderFormik.setFieldValue('items', newItems)
  }

  const calculateGrandTotal = () => {
    const subtotal = orderFormik.values.items.reduce((acc, item) => acc + item.total, 0)
    const gst = orderFormik.values.items.reduce((acc, item) => {
      const p = products.find(prod => prod.id === item.product_id)
      return acc + (item.total * (p?.gst_rate || 0) / 100)
    }, 0)
    return { subtotal, gst, total: subtotal + gst }
  }

  const filteredOrders = orders.filter(order =>
    order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer_id?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  )

  if (loading && !shop) {
    return (
      <DashboardLayout>
        <LoadingSpinner />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Orders</h1>
          <p className="mt-1 text-zinc-400">Manage customer orders and fulfillment</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            className="hidden md:flex items-center gap-2 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border-purple-500/20"
            onClick={() => setIsAIModalOpen(true)}
          >
            <Wand2 className="w-4 h-4" />
            AI Parser
          </Button>
          <Button 
            className="flex items-center gap-2"
            onClick={() => {
              loadResources()
              setIsCreateOpen(true)
            }}
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            New Order
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Input
          placeholder="Search orders…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
          wrapperClassName="flex-1"
        />
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-zinc-500" aria-hidden="true" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 bg-black/40 border border-white/10 hover:border-white/20 rounded-xl text-white outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
          >
            <option value="all">All Orders</option>
            {Object.entries(statusConfig).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <LoadingSpinner />
      ) : filteredOrders.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No orders found"
          description={searchTerm ? "Try a different search term" : "Create your first order to get started"}
          action={
            !searchTerm && (
              <Button onClick={() => {
                loadResources()
                setIsCreateOpen(true)
              }}>
                Create Order
              </Button>
            )
          }
        />
      ) : (
        <div className="grid gap-4">
          {filteredOrders.map((order, idx) => {
            const StatusIcon = statusConfig[order.status]?.icon || Package
            return (
              <div
                key={order.id || order.$id || `order-${order.order_number}-${idx}`}
                onClick={() => setSelectedOrder(order)}
                className="glass p-6 rounded-2xl hover:bg-white/[0.03] transition-all cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-purple-500/10">
                    <StatusIcon className="w-6 h-6 text-purple-400" aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-lg font-bold text-white">{order.order_number}</p>
                      <Badge variant={statusConfig[order.status]?.color || 'default'}>
                        {statusConfig[order.status]?.label || order.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-zinc-400">
                      {order.items?.length || 0} items • {order.customer_id}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-white flex items-center gap-1 justify-end">
                      <IndianRupee className="w-4 h-4" aria-hidden="true" />
                      <span className="tabular-nums">{order.total_amount.toLocaleString()}</span>
                    </p>
                    <p className="text-xs text-zinc-500">
                      {new Date(order.created_at).toLocaleString()}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-zinc-600" aria-hidden="true" />
                </div>
              </div>
            )
          })}

          {/* Pagination Controls */}
          <div className="flex items-center justify-between mt-6 bg-white/5 p-4 rounded-2xl border border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Page</span>
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 font-bold text-sm">
                {page}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="border border-white/5 hover:border-white/20"
                onClick={() => {
                  setPage(p => Math.max(1, p - 1))
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant="neutral"
                size="sm"
                className="bg-purple-500 text-white hover:bg-purple-400 border-none shadow-lg shadow-purple-500/20"
                onClick={() => {
                  setPage(p => p + 1)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                disabled={orders.length < limit}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <Modal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title={selectedOrder.order_number}
          size="xl"
        >
          <div className="space-y-6">
            {/* Status Selector */}
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Order Status</label>
              <select
                value={selectedOrder.status}
                onChange={(e) => handleStatusUpdate(selectedOrder.id, e.target.value)}
                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
              >
                {Object.entries(statusConfig).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>

            {/* Items */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Order Items</h4>
              <div className="space-y-2">
                {selectedOrder.items?.map((item, idx) => (
                  <div key={`${selectedOrder.id}-item-${item.product_id || idx}`} className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
                    <div>
                      <p className="font-medium text-white">{item.product_name}</p>
                      <p className="text-xs text-zinc-500">
                        {item.quantity} {item.unit} @ ₹{item.price}
                      </p>
                    </div>
                    <p className="font-bold text-white tabular-nums">₹{item.total.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">Customer</label>
                <p className="text-sm text-white">{selectedOrder.customer_id}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">Delivery Address</label>
                <p className="text-sm text-white">{selectedOrder.delivery_address || 'N/A'}</p>
              </div>
            </div>

            {/* Total */}
            <div className="border-t border-white/10 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Subtotal</span>
                <span className="text-white tabular-nums">
                  ₹{(selectedOrder.total_amount - (selectedOrder.gst_amount || 0)).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">GST</span>
                <span className="text-emerald-400 tabular-nums">
                  ₹{(selectedOrder.gst_amount || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-white/10">
                <span className="text-white">Total</span>
                <span className="text-white tabular-nums">₹{selectedOrder.total_amount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Create Order Modal */}
      {isCreateOpen && (
        <Modal
          isOpen={isCreateOpen}
          onClose={() => {
            setIsCreateOpen(false)
            orderFormik.resetForm()
            setProductSearch('')
          }}
          title="Create New Order"
          size="2xl"
        >
          <form onSubmit={orderFormik.handleSubmit} className="space-y-6">
            {/* Customer Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Select
                  label="Customer"
                  required
                  id="customer_id"
                  name="customer_id"
                  {...orderFormik.getFieldProps('customer_id')}
                  error={orderFormik.touched.customer_id && orderFormik.errors.customer_id}
                >
                  <option value="">Select customer…</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Order Source</label>
                <div className="flex gap-2">
                  {['storefront', 'whatsapp', 'voice'].map(source => (
                    <button
                      key={source}
                      type="button"
                      onClick={() => orderFormik.setFieldValue('source', source)}
                      className={cn(
                        'flex-1 py-3 px-4 rounded-xl text-xs font-medium uppercase transition-all',
                        orderFormik.values.source === source
                          ? 'bg-purple-500 text-white shadow-lg'
                          : 'bg-white/5 text-zinc-400 hover:bg-white/10'
                      )}
                    >
                      {source}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Product Selection */}
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Add Products</label>
              <Input
                placeholder="Search products…"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
              />
              <div className="mt-3 max-h-48 overflow-y-auto space-y-2 pr-2">
                {filteredProducts.map((product, idx) => (
                  <button
                    key={product.id || `prod-${idx}`}
                    type="button"
                    onClick={() => addItemToOrder(product)}
                    className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all group"
                  >
                    <div className="text-left">
                      <p className="text-sm font-medium text-white group-hover:text-purple-400 transition-colors">{product.name}</p>
                      <p className="text-xs text-zinc-500">₹{product.price}/{product.unit}</p>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500 transition-all">
                      <Plus className="w-4 h-4 text-purple-400 group-hover:text-white" aria-hidden="true" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Cart Items */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Order Items</h4>
              {orderFormik.values.items.length === 0 ? (
                <div className="p-8 text-center text-zinc-500 bg-white/5 rounded-xl">
                  Add products to start building the order
                </div>
              ) : (
                <div className="space-y-2">
                  {orderFormik.values.items.map((item, idx) => (
                    <div key={item.product_id || `cart-${idx}`} className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">{item.product_name}</p>
                        <p className="text-xs text-zinc-500">₹{item.price}/{item.unit}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateItemQuantity(item.product_id, -1)}
                          className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-all"
                        >
                          <Minus className="w-4 h-4" aria-hidden="true" />
                        </button>
                        <span className="w-12 text-center font-medium text-white tabular-nums">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateItemQuantity(item.product_id, 1)}
                          className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-all"
                        >
                          <Plus className="w-4 h-4" aria-hidden="true" />
                        </button>
                      </div>
                      <p className="w-24 text-right font-bold text-white tabular-nums">₹{item.total.toLocaleString()}</p>
                      <button
                        type="button"
                        onClick={() => removeItemFromOrder(item.product_id)}
                        className="p-2 text-zinc-600 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {orderFormik.touched.items && orderFormik.errors.items && (
                <p className="mt-2 text-xs text-red-400">{orderFormik.errors.items}</p>
              )}
            </div>

            {/* Delivery Address */}
            <div>
              <TextArea
                label="Delivery Address"
                required
                id="delivery_address"
                name="delivery_address"
                {...orderFormik.getFieldProps('delivery_address')}
                rows={2}
                placeholder="Enter delivery address…"
                error={orderFormik.touched.delivery_address && orderFormik.errors.delivery_address}
              />
            </div>

            {/* Notes */}
            <div>
              <TextArea
                label="Notes (Optional)"
                id="notes"
                name="notes"
                {...orderFormik.getFieldProps('notes')}
                rows={2}
                placeholder="Add any special instructions…"
              />
            </div>

            {/* Total Summary */}
            {orderFormik.values.items.length > 0 && (
              <div className="p-6 bg-purple-500/10 border border-purple-500/20 rounded-xl space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Subtotal</span>
                  <span className="text-white tabular-nums">₹{calculateGrandTotal().subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">GST</span>
                  <span className="text-emerald-400 tabular-nums">₹{calculateGrandTotal().gst.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xl font-bold pt-2 border-t border-purple-500/20">
                  <span className="text-white">Total</span>
                  <span className="text-white tabular-nums">₹{calculateGrandTotal().total.toLocaleString()}</span>
                </div>
              </div>
            )}

            <ModalFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setIsCreateOpen(false)
                  orderFormik.resetForm()
                  setProductSearch('')
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={loading}
                disabled={loading || orderFormik.values.items.length === 0}
              >
                <CheckCircle className="w-4 h-4" aria-hidden="true" />
                Create Order
              </Button>
            </ModalFooter>
          </form>
        </Modal>
      )}
      {/* AI Parser Modal */}
      <Modal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        title="AI Order Parser"
        subtitle="Paste WhatsApp or Voice text to create an order"
      >
        <div className="p-6 space-y-4">
          <TextArea
            label="Order Details"
            required
            id="ai-parse-text"
            className="h-40"
            autoFocus
            placeholder={`Example order:
"I want to order 2kg of Basmati Rice, 1L of Sunflower Oil, and 500g of Tur Dal. 
Deliver to Flat 402, Sunshine Apartments, Indiranagar. 
My phone is 9876543210. Delivery tomorrow morning."

Or just paste a WhatsApp message!`}
            value={aiText}
            onChange={(e) => setAiText(e.target.value)}
          />
        </div>
          
          <div className="bg-purple-500/5 rounded-2xl p-4 border border-purple-500/10">
            <div className="flex items-center gap-3 text-purple-400 mb-2">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Magic Assistant</span>
            </div>
            <p className="text-sm text-zinc-400">
              Paste the customer's message above. I'll find the products, calculate totals, and fill the form for you.
            </p>
          </div>
        
        <ModalFooter>
          <Button variant="ghost" onClick={() => setIsAIModalOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleAIParse}
            disabled={!aiText.trim() || isParsing}
            className="min-w-[120px]"
          >
            {isParsing ? <LoadingSpinner size="sm" className="mr-2" /> : <Wand2 className="w-4 h-4 mr-2" />}
            {isParsing ? 'Magically Parsing...' : 'Parse Order'}
          </Button>
        </ModalFooter>
      </Modal>

    </DashboardLayout>
  )
}
