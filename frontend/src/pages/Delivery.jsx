import { 
  Truck,
  MapPin,
  Clock,
  Package,
  User,
  Navigation,
  CheckCircle
} from 'lucide-react'
import DashboardLayout from '../components/layout/DashboardLayout'
import { cn } from '../lib/utils'

const deliveryBatches = [
  {
    id: 'BATCH-001',
    status: 'in_progress',
    orders: 4,
    driver: 'Ravi Kumar',
    area: 'Koramangala, Indiranagar',
    estimatedTime: '45 min',
    startedAt: '10:30 AM',
    route: [
      { id: 'ORD-001', address: '12, MG Road', status: 'delivered' },
      { id: 'ORD-002', address: '45, Koramangala', status: 'current' },
      { id: 'ORD-003', address: '78, Indiranagar', status: 'pending' },
      { id: 'ORD-004', address: '23, HSR Layout', status: 'pending' },
    ]
  },
  {
    id: 'BATCH-002',
    status: 'planned',
    orders: 3,
    driver: 'Unassigned',
    area: 'Whitefield, Marathahalli',
    estimatedTime: '35 min',
    startedAt: null,
    route: [
      { id: 'ORD-005', address: '56, Whitefield', status: 'pending' },
      { id: 'ORD-006', address: '89, Marathahalli', status: 'pending' },
      { id: 'ORD-007', address: '12, ITPL Road', status: 'pending' },
    ]
  },
]

const statusConfig = {
  in_progress: { label: 'In Progress', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  planned: { label: 'Planned', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  completed: { label: 'Completed', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
}

const routeStatusConfig = {
  delivered: { color: 'bg-green-500', icon: CheckCircle },
  current: { color: 'bg-blue-500', icon: Navigation },
  pending: { color: 'bg-zinc-600', icon: MapPin },
}

export default function Delivery() {
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
              <p className="text-2xl font-bold text-white tabular-nums">2</p>
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
              <p className="text-2xl font-bold text-white tabular-nums">7</p>
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
              <p className="text-2xl font-bold text-white tabular-nums">12</p>
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
              <p className="text-2xl font-bold text-white tabular-nums">28 min</p>
              <p className="text-sm text-zinc-400">Avg. Delivery Time</p>
            </div>
          </div>
        </div>
      </div>

      {/* Delivery batches */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {deliveryBatches.map((batch) => (
          <div key={batch.id} className="glass rounded-2xl p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-white">{batch.id}</h3>
                  <span className={cn(
                    'px-2.5 py-1 text-xs font-medium rounded-full border',
                    statusConfig[batch.status]?.color
                  )}>
                    {statusConfig[batch.status]?.label}
                  </span>
                </div>
                <p className="text-sm text-zinc-400">
                  <MapPin className="inline w-4 h-4 mr-1" aria-hidden="true" />
                  {batch.area}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-zinc-400">Est. Time</p>
                <p className="text-lg font-semibold text-white">{batch.estimatedTime}</p>
              </div>
            </div>

            {/* Driver */}
            <div className="flex items-center gap-3 mb-6 p-3 bg-white/5 rounded-xl">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
                <User className="w-5 h-5 text-white" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">{batch.driver}</p>
                <p className="text-xs text-zinc-500">
                  {batch.startedAt ? `Started at ${batch.startedAt}` : 'Not started yet'}
                </p>
              </div>
            </div>

            {/* Route */}
            <div className="space-y-3">
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                Route ({batch.orders} stops)
              </p>
              {batch.route.map((stop, index) => {
                const StopIcon = routeStatusConfig[stop.status]?.icon || MapPin
                return (
                  <div 
                    key={stop.id}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-xl transition-colors',
                      stop.status === 'current' ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-white/5'
                    )}
                  >
                    <div className={cn(
                      'flex items-center justify-center w-8 h-8 rounded-full',
                      routeStatusConfig[stop.status]?.color
                    )}>
                      <StopIcon className="w-4 h-4 text-white" aria-hidden="true" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{stop.id}</p>
                      <p className="text-xs text-zinc-500">{stop.address}</p>
                    </div>
                    <span className="text-xs text-zinc-500 capitalize">{stop.status}</span>
                  </div>
                )
              })}
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              {batch.status === 'planned' ? (
                <button className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 rounded-xl transition-all">
                  Assign Driver
                </button>
              ) : (
                <button className="flex-1 px-4 py-2.5 text-sm font-medium text-purple-400 hover:text-white bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded-xl transition-colors">
                  Track Live
                </button>
              )}
              <button className="px-4 py-2.5 text-sm font-medium text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors">
                Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  )
}
