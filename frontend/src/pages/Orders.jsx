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
  Minus
} from 'lucide-react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import DashboardLayout from '../components/layout/DashboardLayout'
import { cn } from '../lib/utils'
import { Badge, Button, Input, Modal, ModalFooter, LoadingSpinner, EmptyState } from '../components/ui'
import { orderService } from '../services/orderService'
import { customerService } from '../services/customerService'
import { productService } from '../services/productService'
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

  // Create Order Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [customers, setCustomers] = useState([])
  const [products, setProducts] = useState([])
  const [productSearch, setProductSearch] = useState('')

  const fetchOrders = async () => {
    if (!shop?.id) return
    try {
      setLoading(true)
      const filters = { shop_id: shop.id }
      if (statusFilter !== 'all') {
        filters.status = statusFilter
      }
      const fetchedOrders = await orderService.list(filters)
      setOrders(fetchedOrders)
    } catch (err) {
      console.error('Failed to fetch orders:', err)
      setError('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [shop?.id, statusFilter])

  const loadResources = async () => {
    if (!shop?.id) return
    try {
      const [featCustomers, featProducts] = await Promise.all([
        customerService.list({ shop_id: shop.id }),
        productService.list({ shop_id: shop.id })
      ])
      setCustomers(featCustomers)
      setProducts(featProducts)
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
        <Button
          variant="primary"
          onClick={() => {
            loadResources()
            setIsCreateOpen(true)
          }}
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          New Order
        </Button>
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
          {filteredOrders.map(order => {
            const StatusIcon = statusConfig[order.status]?.icon || Package
            return (
              <div
                key={order.id}
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
                  <div key={idx} className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
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
                <label htmlFor="customer_id" className="block text-sm font-medium text-zinc-400 mb-2">
                  Customer <span className="text-red-400">*</span>
                </label>
                <select
                  id="customer_id"
                  name="customer_id"
                  {...orderFormik.getFieldProps('customer_id')}
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                >
                  <option value="">Select customer…</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {orderFormik.touched.customer_id && orderFormik.errors.customer_id && (
                  <p className="mt-1 text-xs text-red-400">{orderFormik.errors.customer_id}</p>
                )}
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
                {filteredProducts.map(product => (
                  <button
                    key={product.id}
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
                  {orderFormik.values.items.map(item => (
                    <div key={item.product_id} className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
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
              <label htmlFor="delivery_address" className="block text-sm font-medium text-zinc-400 mb-2">
                Delivery Address <span className="text-red-400">*</span>
              </label>
              <textarea
                id="delivery_address"
                name="delivery_address"
                {...orderFormik.getFieldProps('delivery_address')}
                rows="2"
                placeholder="Enter delivery address…"
                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-zinc-500 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors resize-none"
              />
              {orderFormik.touched.delivery_address && orderFormik.errors.delivery_address && (
                <p className="mt-1 text-xs text-red-400">{orderFormik.errors.delivery_address}</p>
              )}
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-zinc-400 mb-2">
                Notes (Optional)
              </label>
              <textarea
                id="notes"
                name="notes"
                {...orderFormik.getFieldProps('notes')}
                rows="2"
                placeholder="Add any special instructions…"
                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-zinc-500 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors resize-none"
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
    </DashboardLayout>
  )
}
