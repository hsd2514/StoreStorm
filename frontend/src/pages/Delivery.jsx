import { useState, useEffect } from 'react'
import { 
  Truck,
  MapPin,
  Clock,
  Package,
  User,
  Navigation,
  CheckCircle,
  Loader2,
  AlertCircle
} from 'lucide-react'
import DashboardLayout from '../components/layout/DashboardLayout'
import { cn } from '../lib/utils'
import { deliveryService } from '../services/deliveryService'
import { useShop } from '../context/ShopContext'

const statusConfig = {
  planned: { label: 'Planned', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  in_progress: { label: 'In Progress', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  completed: { label: 'Completed', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
}

const routeStatusConfig = {
  delivered: { color: 'bg-green-500', icon: CheckCircle },
  current: { color: 'bg-blue-500', icon: Navigation },
  pending: { color: 'bg-zinc-600', icon: MapPin },
}

export default function Delivery() {
  const { shop } = useShop()
  const [batches, setBatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (shop?.id) {
      fetchBatches()
    }
  }, [shop?.id])

  const fetchBatches = async () => {
    try {
      setLoading(true)
      const data = await deliveryService.list({ shop_id: shop.id })
      setBatches(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleStartBatch = async (id) => {
    try {
      await deliveryService.start(id)
      fetchBatches()
    } catch (err) {
      alert('Failed to start batch: ' + err.message)
    }
  }

  const handleCompleteBatch = async (id) => {
    try {
      await deliveryService.complete(id)
      fetchBatches()
    } catch (err) {
      alert('Failed to complete batch: ' + err.message)
    }
  }

  // Calculate stats from batches
  const activeCount = batches.filter(b => b.status === 'in_progress').length
  const transitOrders = batches
    .filter(b => b.status === 'in_progress')
    .reduce((sum, b) => sum + (b.order_ids?.length || 0), 0)
  const completedToday = batches.filter(b => b.status === 'completed').length
  return (
    <DashboardLayout>
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Delivery Batching</h1>
        <p className="mt-1 text-zinc-400">
          Optimize routes and manage delivery batches
        </p>
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
              <p className="text-sm text-zinc-400">Active Batches</p>
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
              <p className="text-sm text-zinc-400">Completed Batches</p>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-500/10">
              <Clock className="w-6 h-6 text-cyan-400" aria-hidden="true" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white tabular-nums">28 min</p>
              <p className="text-sm text-zinc-400">Avg. Delivery Time</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-purple-500 animate-spin mb-4" />
          <p className="text-zinc-400">Loading delivery batches...</p>
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
          <p className="text-white font-medium">No delivery batches yet</p>
          <p className="text-zinc-400 text-sm mt-1 text-center max-w-xs">
            Start grouping orders into batches to see them here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {batches.map((batch) => (
            <div key={batch.id} className="glass rounded-2xl p-6">
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
                </div>
                <div className="text-right">
                  <p className="text-sm text-zinc-400">Est. Time</p>
                  <p className="text-lg font-semibold text-white">{batch.estimated_time || 0} min</p>
                </div>
              </div>

              {/* Delivery Person / Info */}
              <div className="flex items-center gap-3 mb-6 p-3 bg-white/5 rounded-xl">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
                  <User className="w-5 h-5 text-white" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    {batch.delivery_person_id || 'Unassigned'}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {batch.started_at 
                      ? `Started at ${new Date(batch.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` 
                      : 'Not started yet'}
                  </p>
                </div>
              </div>

              {/* Optimized Route */}
              <div className="space-y-3">
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  Route ({batch.order_ids?.length || 0} stops)
                </p>
                {batch.optimized_route?.map((stop, index) => {
                  const status = stop.status || 'pending'
                  const StopIcon = routeStatusConfig[status]?.icon || MapPin
                  return (
                    <div 
                      key={stop.order_id || index}
                      className={cn(
                        'flex items-center gap-3 p-3 rounded-xl transition-colors',
                        status === 'current' ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-white/5'
                      )}
                    >
                      <div className={cn(
                        'flex items-center justify-center w-8 h-8 rounded-full',
                        routeStatusConfig[status]?.color
                      )}>
                        <StopIcon className="w-4 h-4 text-white" aria-hidden="true" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">{stop.order_id}</p>
                        <p className="text-xs text-zinc-500">{stop.address || 'Loading address...'}</p>
                      </div>
                      <span className="text-xs text-zinc-500 capitalize">{status}</span>
                    </div>
                  )
                })}
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                {batch.status === 'planned' && (
                  <button 
                    onClick={() => handleStartBatch(batch.id)}
                    className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 rounded-xl transition-all"
                  >
                    Start Batch
                  </button>
                )}
                {batch.status === 'in_progress' && (
                  <button 
                    onClick={() => handleCompleteBatch(batch.id)}
                    className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-green-600 hover:bg-green-500 rounded-xl transition-all"
                  >
                    Complete Delivery
                  </button>
                )}
                <button className="px-4 py-2.5 text-sm font-medium text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors">
                  Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}
