import { useState } from 'react'
import {
  Truck,
  MapPin,
  Clock,
  Phone,
  Navigation,
  CheckCircle,
  Loader2,
  LogIn,
  Play,
  Map as MapIcon
} from 'lucide-react'
import { cn } from '../lib/utils'
import api from '../services/api'
import MapView from '../components/delivery/MapView'

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  in_transit: { label: 'In Transit', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
  completed: { label: 'Completed', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
}

export default function DeliveryPartner() {
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [deliveries, setDeliveries] = useState([])
  const [loggedIn, setLoggedIn] = useState(false)
  const [driverName, setDriverName] = useState('')
  const [selectedRoute, setSelectedRoute] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await api('/deliveries/?limit=100')
      const allDeliveries = response.deliveries || []
      
      const myDeliveries = allDeliveries.filter(d => 
        d.driver_phone === phone || 
        d.delivery_partner?.phone === phone
      )

      if (myDeliveries.length === 0) {
        setError('No deliveries found for this phone number')
        setLoading(false)
        return
      }

      const name = myDeliveries[0].driver_name || myDeliveries[0].delivery_partner?.name || 'Driver'
      
      setDriverName(name)
      setDeliveries(myDeliveries)
      setLoggedIn(true)
    } catch (err) {
      setError('Failed to fetch deliveries')
    } finally {
      setLoading(false)
    }
  }

  // Take delivery action
  const handleTakeDelivery = async (delivery) => {
    setActionLoading(delivery.$id)
    try {
      await api(`/deliveries/${delivery.$id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'in_transit' })
      })
      // Update local state
      setDeliveries(prev => prev.map(d => 
        d.$id === delivery.$id ? { ...d, status: 'in_transit' } : d
      ))
    } catch (err) {
      console.error('Failed to take delivery:', err)
    } finally {
      setActionLoading(null)
    }
  }

  // Mark delivery as completed
  const handleCompleteDelivery = async (delivery) => {
    setActionLoading(delivery.$id)
    try {
      await api(`/deliveries/${delivery.$id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'completed' })
      })
      setDeliveries(prev => prev.map(d => 
        d.$id === delivery.$id ? { ...d, status: 'completed' } : d
      ))
    } catch (err) {
      console.error('Failed to complete delivery:', err)
    } finally {
      setActionLoading(null)
    }
  }

  // Mark individual stop as delivered
  const handleDeliverStop = async (stopSeq) => {
    if (!selectedRoute) return
    
    const routeInfo = parseRouteInfo(selectedRoute)
    if (!routeInfo?.stops) return

    // Update the stop status locally
    const updatedStops = routeInfo.stops.map((s, idx) => {
      if (s.seq === stopSeq) {
        return { ...s, status: 'delivered' }
      }
      // Move next pending to current
      if (s.status === 'pending' && idx > 0 && routeInfo.stops[idx - 1].seq === stopSeq) {
        return { ...s, status: 'current' }
      }
      return s
    })

    // Update local state
    const updatedRoute = {
      ...selectedRoute,
      route_info: JSON.stringify({ ...routeInfo, stops: updatedStops })
    }
    setSelectedRoute(updatedRoute)
    setDeliveries(prev => prev.map(d => 
      d.$id === selectedRoute.$id ? updatedRoute : d
    ))
  }

  const parseRouteInfo = (delivery) => {
    let routeInfo = delivery.route_info
    if (typeof routeInfo === 'string') {
      try { routeInfo = JSON.parse(routeInfo) } catch { routeInfo = null }
    }
    return routeInfo
  }

  const getRouteData = (delivery) => {
    const routeInfo = parseRouteInfo(delivery)
    
    const stops = routeInfo?.stops?.map(s => ({
      order_id: `order-${s.seq}`,
      customer_name: s.name,
      address: s.addr,
      latitude: s.lat,
      longitude: s.lon,
      status: s.status,
      sequence: s.seq
    })) || []

    const geometry = routeInfo?.geometry ? {
      type: 'LineString',
      coordinates: routeInfo.geometry
    } : null

    return { stops, geometry }
  }

  // Route detail view with map
  if (selectedRoute) {
    const routeData = getRouteData(selectedRoute)
    const allDelivered = routeData.stops.every(s => s.status === 'delivered')
    
    return (
      <div className="min-h-screen bg-zinc-950">
        {/* Header */}
        <div className="bg-zinc-900 border-b border-zinc-800 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-white">{selectedRoute.batch_number}</h1>
              <p className="text-sm text-zinc-500">{selectedRoute.area}</p>
            </div>
            <button
              onClick={() => setSelectedRoute(null)}
              className="px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700"
            >
              Back
            </button>
          </div>
        </div>

        {/* Map */}
        <div className="h-[50vh]">
          <MapView 
            shopCoords={[18.5204, 73.8567]}
            stops={routeData.stops} 
            routeGeometry={routeData.geometry}
          />
        </div>

        {/* Stops List with Deliver buttons */}
        <div className="p-4 space-y-3">
          <h2 className="text-white font-semibold">Delivery Stops</h2>
          {routeData.stops.map((stop) => {
            const isPickup = stop.sequence === 0 || stop.customer_name?.includes('PICKUP') || stop.customer_name?.includes('SHOP')
            return (
              <div key={`stop-${stop.sequence}`} className="flex items-center gap-3 p-3 bg-zinc-900 rounded-xl">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm",
                  isPickup ? 'bg-purple-500' : 
                  stop.status === 'current' ? 'bg-blue-500' : 
                  stop.status === 'delivered' ? 'bg-green-500' : 'bg-zinc-700'
                )}>
                  {isPickup ? '🏪' : (stop.status === 'delivered' ? '✓' : stop.sequence)}
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">{stop.customer_name}</p>
                  <p className="text-zinc-500 text-sm">{stop.address}</p>
                </div>
                {stop.status === 'current' && !isPickup && (
                  <button
                    onClick={() => handleDeliverStop(stop.sequence)}
                    className="px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-500 flex items-center gap-1"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Deliver
                  </button>
                )}
                {stop.status === 'delivered' && (
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                    {isPickup ? 'Picked Up' : 'Done'}
                  </span>
                )}
              </div>
            )
          })}

          {/* Complete Route button */}
          {allDelivered && (
            <button
              onClick={() => handleCompleteDelivery(selectedRoute)}
              className="w-full mt-4 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-500 flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              Complete Route
            </button>
          )}
        </div>
      </div>
    )
  }

  // Login screen
  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Truck className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Delivery Partner</h1>
            <p className="text-zinc-500 mt-2">Enter your phone to see your routes</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-2">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !phone}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  View My Routes
                </>
              )}
            </button>
          </form>

          <p className="text-center text-zinc-600 text-sm mt-6">
            Demo: Use phone <span className="text-purple-400">+91 98765 43210</span>
          </p>
        </div>
      </div>
    )
  }

  // Main routes list
  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-semibold">{driverName}</p>
              <p className="text-zinc-500 text-sm">{phone}</p>
            </div>
          </div>
          <button
            onClick={() => { setLoggedIn(false); setDeliveries([]) }}
            className="text-zinc-400 hover:text-white text-sm"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="p-4 grid grid-cols-3 gap-3">
        <div className="bg-zinc-900 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-white">{deliveries.length}</p>
          <p className="text-xs text-zinc-500">Routes</p>
        </div>
        <div className="bg-zinc-900 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-cyan-400">
            {deliveries.filter(d => d.status === 'in_transit').length}
          </p>
          <p className="text-xs text-zinc-500">Active</p>
        </div>
        <div className="bg-zinc-900 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-green-400">
            {deliveries.filter(d => d.status === 'completed').length}
          </p>
          <p className="text-xs text-zinc-500">Done</p>
        </div>
      </div>

      {/* Routes */}
      <div className="p-4 space-y-4">
        <h2 className="text-white font-semibold">My Routes</h2>
        
        {deliveries.map((delivery) => {
          const routeInfo = parseRouteInfo(delivery)
          const stopCount = routeInfo?.stops?.length || 0
          const isPending = delivery.status === 'pending'
          const isActive = delivery.status === 'in_transit'
          const isCompleted = delivery.status === 'completed'
          
          return (
            <div key={delivery.$id} className="bg-zinc-900 rounded-xl p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-white font-semibold">{delivery.batch_number}</h3>
                  <p className="text-zinc-500 text-sm">{delivery.area}</p>
                </div>
                <span className={cn(
                  'px-2 py-1 text-xs rounded-full border',
                  statusConfig[delivery.status]?.color || 'bg-zinc-500/10 text-zinc-400'
                )}>
                  {statusConfig[delivery.status]?.label || delivery.status}
                </span>
              </div>

              <div className="flex items-center gap-4 text-sm text-zinc-400 mb-4">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {stopCount} stops
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {routeInfo?.est_mins || delivery.estimated_time || 0} min
                </div>
                <div className="flex items-center gap-1">
                  <Navigation className="w-4 h-4" />
                  {routeInfo?.total_km || 0} km
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                {isPending && (
                  <button
                    onClick={() => handleTakeDelivery(delivery)}
                    disabled={actionLoading === delivery.$id}
                    className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-medium rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {actionLoading === delivery.$id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                    Take Delivery
                  </button>
                )}

                {isActive && (
                  <button
                    onClick={() => setSelectedRoute(delivery)}
                    className="w-full py-2.5 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-500 flex items-center justify-center gap-2"
                  >
                    <MapIcon className="w-4 h-4" />
                    View Route & Deliver
                  </button>
                )}

                {isCompleted && (
                  <div className="w-full py-2.5 bg-green-600/20 text-green-400 font-medium rounded-lg flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Completed
                  </div>
                )}

                {!isCompleted && (
                  <button
                    onClick={() => setSelectedRoute(delivery)}
                    className="w-full py-2 bg-zinc-800 text-zinc-300 font-medium rounded-lg hover:bg-zinc-700 flex items-center justify-center gap-2"
                  >
                    <MapIcon className="w-4 h-4" />
                    View Map
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
