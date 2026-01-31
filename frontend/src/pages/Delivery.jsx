import { useState, useEffect, useMemo } from 'react'
import {
  Truck,
  MapPin,
  Clock,
  Package,
  User,
  Navigation,
  CheckCircle,
  Loader2,
  AlertCircle,
  Plus,
  X,
  Map as MapIcon,
  Search,
  CheckSquare,
  Square
} from 'lucide-react'
import DashboardLayout from '../components/layout/DashboardLayout'
import MapView from '../components/delivery/MapView'
import Modal from '../components/Modal'
import { cn } from '../lib/utils'
import { deliveryService } from '../services/deliveryService'
import { orderService } from '../services/orderService'
import { useShop } from '../context/ShopContext'

const statusConfig = {
  planned: { label: 'Planned', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  pending: { label: 'Pending', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  READY_FOR_PICKUP: { label: 'Ready', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  PICKED_UP: { label: 'Picked Up', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  IN_TRANSIT: { label: 'In Transit', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
  in_transit: { label: 'In Transit', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
  DELIVERED: { label: 'Delivered', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
  completed: { label: 'Completed', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
}

const routeStatusConfig = {
  delivered: { color: 'bg-green-500', icon: CheckCircle },
  current: { color: 'bg-blue-500', icon: Navigation },
  pending: { color: 'bg-zinc-600', icon: MapPin },
}

// Helper to parse batch data from DB (handles both old and new schema)
const parseBatch = (raw) => {
  // Parse route_info if it's a JSON string
  let routeInfo = null
  try {
    routeInfo = typeof raw.route_info === 'string' ? JSON.parse(raw.route_info) : raw.route_info
  } catch (e) { routeInfo = null }

  // Build route_stops from route_info or use existing
  let route_stops = raw.route_stops
  if (!route_stops && routeInfo?.stops) {
    route_stops = routeInfo.stops.map(s => ({
      order_id: `order-${s.seq}`,
      customer_name: s.name,
      address: s.addr,
      latitude: s.lat,
      longitude: s.lon,
      status: s.status,
      sequence: s.seq
    }))
  }

  // Build route_geometry from route_info
  let route_geometry = raw.route_geometry
  if (!route_geometry && routeInfo?.geometry) {
    route_geometry = {
      type: 'LineString',
      coordinates: routeInfo.geometry
    }
  }

  // Build delivery_partner from driver fields or existing
  let delivery_partner = raw.delivery_partner
  if (!delivery_partner && raw.driver_name) {
    delivery_partner = {
      name: raw.driver_name,
      phone: raw.driver_phone || '',
      vehicle: 'bike'
    }
  }

  return {
    ...raw,
    route_stops: route_stops || [],
    route_geometry,
    delivery_partner,
    total_distance: routeInfo?.total_km || raw.total_distance || 0,
    estimated_time: routeInfo?.est_mins || raw.estimated_time || 0,
    area: raw.area || ''
  }
}

export default function Delivery() {
  const { shop } = useShop()
  const [batches, setBatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedRoute, setSelectedRoute] = useState(null)
  
  // Create route modal state
  const [availableOrders, setAvailableOrders] = useState([])
  const [selectedOrders, setSelectedOrders] = useState([])
  const [orderSearchQuery, setOrderSearchQuery] = useState('')
  const [crateCapacity, setCrateCapacity] = useState(10)
  const [partnerName, setPartnerName] = useState('')
  const [partnerPhone, setPartnerPhone] = useState('')
  const [partnerVehicle, setPartnerVehicle] = useState('bike')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (shop?.id) {
      fetchBatches()
    }
  }, [shop?.id])

  const fetchBatches = async () => {
    try {
      setLoading(true)
      const data = await deliveryService.list({ shop_id: shop.id })
      // Parse each batch to handle JSON fields
      const parsed = data.map(parseBatch)
      setBatches(parsed)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const openCreateModal = async () => {
    try {
      // Fetch confirmed orders that aren't in a delivery batch yet
      const orders = await orderService.list({ 
        shop_id: shop.id, 
        status: 'confirmed',
        limit: 50
      })
      
      // Filter out orders already in batches
      const assignedOrderIds = batches.flatMap(b => b.order_ids || [])
      const available = orders.filter(o => !assignedOrderIds.includes(o.id))
      
      setAvailableOrders(available)
      setSelectedOrders([])
      setOrderSearchQuery('')  // Reset search
      setIsCreateModalOpen(true)
    } catch (err) {
      alert('Failed to load available orders: ' + err.message)
    }
  }

  const handleCreateRoute = async () => {
    if (selectedOrders.length === 0) {
      alert('Please select at least one order')
      return
    }

    try {
      setCreating(true)
      
      const deliveryPartner = partnerName ? {
        name: partnerName,
        phone: partnerPhone,
        vehicle: partnerVehicle
      } : null

      await deliveryService.createRoute({
        shop_id: shop.id,
        order_ids: selectedOrders,
        crate_capacity: crateCapacity,
        delivery_partner: deliveryPartner
      })

      setIsCreateModalOpen(false)
      fetchBatches()
    } catch (err) {
      alert('Failed to create route: ' + err.message)
    } finally {
      setCreating(false)
    }
  }

  const handleToggleOrder = (orderId) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    )
  }

  const handleStatusTransition = async (batchId, newStatus, actor = 'shop_owner') => {
    try {
      await deliveryService.updateStatus(batchId, newStatus, actor)
      fetchBatches()
    } catch (err) {
      alert('Failed to update status: ' + err.message)
    }
  }

  // Calculate stats from batches
  const activeCount = batches.filter(b => ['READY_FOR_PICKUP', 'PICKED_UP', 'IN_TRANSIT'].includes(b.status)).length
  const transitOrders = batches
    .filter(b => b.status === 'IN_TRANSIT')
    .reduce((sum, b) => sum + (b.order_ids?.length || 0), 0)
  const completedToday = batches.filter(b => b.status === 'DELIVERED').length

  return (
    <DashboardLayout>
      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Delivery Management</h1>
          <p className="mt-1 text-zinc-400">
            Crate-based route optimization and delivery tracking
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 rounded-2xl shadow-lg shadow-purple-500/25 transition-all"
        >
          <Plus className="w-5 h-5" />
          Create Route
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/10">
              <Truck className="w-6 h-6 text-blue-400" aria-hidden="true" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white tabular-nums">{activeCount}</p>
              <p className="text-sm text-zinc-400">Active Routes</p>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-purple-500/10">
              <Package className="w-6 h-6 text-purple-400" aria-hidden="true" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white tabular-nums">{transitOrders}</p>
              <p className="text-sm text-zinc-400">Orders in Transit</p>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-green-500/10">
              <CheckCircle className="w-6 h-6 text-green-400" aria-hidden="true" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white tabular-nums">{completedToday}</p>
              <p className="text-sm text-zinc-400">Delivered Today</p>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-500/10">
              <Clock className="w-6 h-6 text-cyan-400" aria-hidden="true" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white tabular-nums">
                {batches.reduce((sum, b) => sum + (b.estimated_time || 0), 0)} min
              </p>
              <p className="text-sm text-zinc-400">Total Est. Time</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-purple-500 animate-spin mb-4" />
          <p className="text-zinc-400">Loading delivery routes...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 glass rounded-2xl border border-red-500/20">
          <AlertCircle className="w-10 h-10 text-red-400 mb-4" />
          <p className="text-white font-medium">Failed to load deliveries</p>
          <p className="text-zinc-400 text-sm mt-1">{error}</p>
          <button
            onClick={fetchBatches}
            className="mt-6 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : batches.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 glass rounded-2xl border border-white/10">
          <Truck className="w-12 h-12 text-zinc-600 mb-4" />
          <p className="text-white font-medium">No delivery routes yet</p>
          <p className="text-zinc-400 text-sm mt-1 text-center max-w-xs">
            Create your first route by selecting confirmed orders.
          </p>
          <button
            onClick={openCreateModal}
            className="mt-6 px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition-colors"
          >
            Create First Route
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {batches.map((batch) => (
            <div key={batch.$id} className="glass rounded-2xl p-6 hover:bg-white/[0.03] transition-colors">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-white">{batch.batch_number}</h3>
                    <span className={cn(
                      'px-2.5 py-1 text-xs font-medium rounded-full border',
                      statusConfig[batch.status]?.color
                    )}>
                      {statusConfig[batch.status]?.label}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500">
                    {batch.capacity_used || batch.order_ids?.length || 0} orders • {batch.total_distance || 0} km
                  </p>
                </div>
                <button
                  onClick={() => setSelectedRoute(batch)}
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors text-zinc-400 hover:text-white"
                >
                  <MapIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Delivery Person / Info */}
              {batch.delivery_partner && (
                <div className="flex items-center gap-3 mb-6 p-3 bg-white/5 rounded-xl">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
                    <User className="w-5 h-5 text-white" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {batch.delivery_partner.name}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {batch.delivery_partner.phone} • {batch.delivery_partner.vehicle}
                    </p>
                  </div>
                </div>
              )}

              {/* Crates Info */}
              {batch.crates && batch.crates.length > 0 && (
                <div className="mb-6 p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                  <p className="text-xs text-amber-400 font-bold uppercase tracking-wider mb-2">Crates</p>
                  <div className="flex gap-2">
                    {batch.crates.map((crate, idx) => (
                      <div key={crate.id} className="px-3 py-1.5 bg-white/10 rounded-lg">
                        <p className="text-xs text-white font-bold">#{idx + 1}</p>
                        <p className="text-[10px] text-zinc-500">{crate.assigned_order_ids.length}/{crate.capacity}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Route Stops Preview */}
              <div className="space-y-2 mb-6">
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  Route ({batch.route_stops?.length || 0} stops)
                </p>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {batch.route_stops?.slice(0, 4).map((stop) => {
                    const StopIcon = routeStatusConfig[stop.status]?.icon || MapPin
                    return (
                      <div
                        key={stop.order_id}
                        className={cn(
                          'flex items-center gap-2 p-2 rounded-lg text-xs',
                          stop.status === 'current' ? 'bg-blue-500/10' : 'bg-white/5'
                        )}
                      >
                        <div className={cn(
                          'w-6 h-6 rounded-full flex items-center justify-center',
                          routeStatusConfig[stop.status]?.color
                        )}>
                          <StopIcon className="w-3 h-3 text-white" />
                        </div>
                        <span className="flex-1 text-white font-medium truncate">{stop.customer_name}</span>
                        <span className="text-zinc-500">#{stop.sequence}</span>
                      </div>
                    )
                  })}
                  {(batch.route_stops?.length || 0) > 4 && (
                    <p className="text-xs text-zinc-600 text-center">+{batch.route_stops.length - 4} more</p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {batch.status === 'planned' && (
                  <button
                    onClick={() => handleStatusTransition(batch.id, 'READY_FOR_PICKUP', 'shop_owner')}
                    className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all"
                  >
                    Mark Ready
                  </button>
                )}
                {batch.status === 'READY_FOR_PICKUP' && (
                  <button
                    onClick={() => handleStatusTransition(batch.id, 'PICKED_UP', 'delivery_partner')}
                    className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-purple-600 hover:bg-purple-500 rounded-xl transition-all"
                  >
                    Confirm Pickup
                  </button>
                )}
                {batch.status === 'IN_TRANSIT' && (
                  <button
                    onClick={() => handleStatusTransition(batch.id, 'DELIVERED', 'delivery_partner')}
                    className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-green-600 hover:bg-green-500 rounded-xl transition-all"
                  >
                    Mark Delivered
                  </button>
                )}
                <button
                  onClick={() => setSelectedRoute(batch)}
                  className="px-4 py-2.5 text-sm font-medium text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors"
                >
                  View Map
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Route Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Delivery Route"
        subtitle="Crate-based batching"
        size="md"
      >
        <div className="p-6 space-y-5">
              {/* Order Selection */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-bold text-zinc-400 uppercase tracking-wider">
                    Select Orders ({selectedOrders.length}/{availableOrders.length})
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedOrders(availableOrders.map(o => o.id))}
                      className="px-3 py-1 text-xs font-medium bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 rounded-lg transition-all flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:outline-none"
                    >
                      <CheckSquare className="w-3.5 h-3.5" />
                      All
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedOrders([])}
                      className="px-3 py-1 text-xs font-medium bg-zinc-800 text-zinc-400 hover:bg-zinc-700 rounded-lg transition-all flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:outline-none"
                    >
                      <Square className="w-3.5 h-3.5" />
                      None
                    </button>
                  </div>
                </div>

                {/* Search */}
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    placeholder="Search by order number, address, or customer…"
                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-zinc-600 focus:border-purple-500 focus-visible:ring-2 focus-visible:ring-purple-500/50 focus-visible:outline-none transition-all"
                  />
                </div>

                {/* Order List */}
                <div className="space-y-2 max-h-[320px] overflow-y-auto glass p-3 rounded-xl">
                  {(() => {
                    const filtered = availableOrders.filter(order => {
                      if (!orderSearchQuery) return true
                      const q = orderSearchQuery.toLowerCase()
                      return (
                        order.order_number?.toLowerCase().includes(q) ||
                        order.delivery_address?.toLowerCase().includes(q) ||
                        order.customer_id?.toLowerCase().includes(q)
                      )
                    })

                    if (filtered.length === 0) {
                      return (
                        <p className="text-zinc-500 text-sm text-center py-8">
                          {orderSearchQuery ? 'No orders match your search' : 'No confirmed orders available'}
                        </p>
                      )
                    }

                    return filtered.map((order) => (
                      <label
                        key={order.id}
                        className={cn(
                          'flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all',
                          selectedOrders.includes(order.id) 
                            ? 'bg-purple-500/20 border border-purple-500/40' 
                            : 'bg-white/5 border border-transparent hover:bg-white/10 hover:border-white/10'
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={selectedOrders.includes(order.id)}
                          onChange={() => handleToggleOrder(order.id)}
                          className="mt-0.5 w-4 h-4 rounded border-white/20 focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:outline-none"
                          aria-label={`Select order ${order.order_number}`}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="text-sm font-bold text-white">{order.order_number}</p>
                            <span className="text-xs text-zinc-500 whitespace-nowrap">{order.items?.length || 0} items</span>
                          </div>
                          <p className="text-xs text-zinc-400 truncate mb-1">{order.delivery_address || 'No address'}</p>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-zinc-500">₹{order.total_amount?.toFixed(2) || '0.00'}</span>
                            <span className="text-zinc-600">•</span>
                            <span className="text-zinc-500">{order.customer_id?.slice(0, 8) || 'Guest'}</span>
                          </div>
                        </div>
                      </label>
                    ))
                  })()}
                </div>
              </div>

              {/* Crate Capacity */}
              <div>
                <label className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3 block">
                  Crate Capacity: {crateCapacity} orders/crate
                </label>
                <input
                  type="range"
                  min="5"
                  max="20"
                  value={crateCapacity}
                  onChange={(e) => setCrateCapacity(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-zinc-600 mt-1">
                  <span>5</span>
                  <span>20</span>
                </div>
              </div>

              {/* Delivery Partner (Optional) */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-zinc-400 uppercase tracking-wider block">
                  Delivery Partner (Optional)
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Name"
                    value={partnerName}
                    onChange={(e) => setPartnerName(e.target.value)}
                    autoComplete="name"
                    className="col-span-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-zinc-600 outline-none focus:border-purple-500 focus-visible:ring-2 focus-visible:ring-purple-500/50 transition-all"
                  />
                  <select
                    value={partnerVehicle}
                    onChange={(e) => setPartnerVehicle(e.target.value)}
                    className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-purple-500 focus-visible:ring-2 focus-visible:ring-purple-500/50 transition-all"
                  >
                    <option value="bike">Bike</option>
                    <option value="car">Car</option>
                    <option value="van">Van</option>
                  </select>
                </div>
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={partnerPhone}
                  onChange={(e) => setPartnerPhone(e.target.value)}
                  autoComplete="tel"
                  inputMode="tel"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-zinc-600 outline-none focus:border-purple-500 focus-visible:ring-2 focus-visible:ring-purple-500/50 transition-all"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  disabled={creating}
                  className="flex-1 py-3 px-4 text-sm font-semibold text-zinc-300 bg-white/5 hover:bg-white/10 rounded-xl transition-all disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:outline-none"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateRoute}
                  disabled={creating || selectedOrders.length === 0}
                  className="flex-1 py-3 px-4 text-sm font-bold bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:outline-none"
                >
                  {creating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating…
                    </>
                  ) : (
                    'Create Route'
                  )}
                </button>
              </div>
        </div>
      </Modal>

      {/* Route Detail Modal with Map */}
      {selectedRoute && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass w-full max-w-6xl h-[90vh] rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col">
            <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div>
                <h3 className="text-xl font-black text-white">{selectedRoute.batch_number}</h3>
                <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">
                  {selectedRoute.route_stops?.length || 0} stops • {selectedRoute.total_distance || 0} km
                </p>
              </div>
              <button
                onClick={() => setSelectedRoute(null)}
                className="p-3 hover:bg-white/10 rounded-2xl text-zinc-400 hover:text-white transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 p-8">
              <MapView
                stops={selectedRoute.route_stops || []}
                routeGeometry={selectedRoute.route_geometry}
              />
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
