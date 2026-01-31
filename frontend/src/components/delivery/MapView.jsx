import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Home, MapPin } from 'lucide-react'

// Fix default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Custom shop icon
const shopIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

// Create numbered marker icons
const createNumberedIcon = (number, status = 'pending') => {
  const colors = {
    pending: '#71717a', // zinc-500
    current: '#3b82f6', // blue-500
    delivered: '#10b981', // green-500
  }
  
  const color = colors[status] || colors.pending
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <span style="
          color: white;
          font-weight: bold;
          font-size: 14px;
          transform: rotate(45deg);
        ">${number}</span>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  })
}

export default function MapView({ shopCoords = [12.9716, 77.5946], stops = [], routeGeometry = null }) {
  // Calculate bounds to fit all markers
  const calculateBounds = () => {
    const allPoints = [shopCoords]
    stops.forEach(stop => {
      allPoints.push([stop.latitude, stop.longitude])
    })
    return allPoints
  }

  const bounds = calculateBounds()

  // Convert route geometry to Leaflet format if available
  const routePath = routeGeometry?.coordinates 
    ? routeGeometry.coordinates.map(coord => [coord[1], coord[0]]) // Swap lon/lat to lat/lon
    : null

  return (
    <div className="h-full w-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
      <MapContainer 
        bounds={bounds.length > 1 ? bounds : undefined}
        center={shopCoords}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Shop Marker */}
        <Marker position={shopCoords} icon={shopIcon}>
          <Popup>
            <div className="text-sm">
              <p className="font-bold text-purple-600">Your Shop</p>
              <p className="text-zinc-600 text-xs">Delivery Start Point</p>
            </div>
          </Popup>
        </Marker>
        
        {/* Delivery Stop Markers */}
        {stops.map((stop, idx) => (
          <Marker 
            key={stop.order_id} 
            position={[stop.latitude, stop.longitude]}
            icon={createNumberedIcon(stop.sequence || idx + 1, stop.status)}
          >
            <Popup>
              <div className="text-sm space-y-1">
                <p className="font-bold text-zinc-800">Stop #{stop.sequence || idx + 1}</p>
                <p className="text-zinc-700">{stop.customer_name}</p>
                <p className="text-zinc-500 text-xs">{stop.address}</p>
                <span className={`
                  inline-block px-2 py-0.5 text-[10px] font-bold rounded-full mt-1
                  ${stop.status === 'delivered' ? 'bg-green-100 text-green-700' :
                    stop.status === 'current' ? 'bg-blue-100 text-blue-700' :
                    'bg-zinc-100 text-zinc-600'}
                `}>
                  {stop.status?.toUpperCase() || 'PENDING'}
                </span>
              </div>
            </Popup>
          </Marker>
        ))}
        
        {/* Route Polyline */}
        {routePath && (
          <Polyline 
            positions={routePath} 
            pathOptions={{ 
              color: '#a855f7', 
              weight: 4,
              opacity: 0.7,
              dashArray: '10, 10'
            }} 
          />
        )}
      </MapContainer>
    </div>
  )
}
