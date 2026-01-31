import { useState } from 'react'
import { 
  Store, 
  MapPin, 
  Phone, 
  Tag, 
  Save, 
  Loader2, 
  CheckCircle2,
  AlertCircle,
  User,
  Globe,
  Bell,
  Lock
} from 'lucide-react'
import DashboardLayout from '../components/layout/DashboardLayout'
import { useShop } from '../context/ShopContext'
import { shopService } from '../services/shopService'
import { cn } from '../lib/utils'

export default function Settings() {
  const { shop, setShop } = useShop()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)
  
  const [formData, setFormData] = useState({
    name: shop?.name || '',
    category: shop?.category || 'grocery',
    phone: shop?.phone || '',
    address: shop?.address || '',
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setSuccess(false)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const updatedShop = await shopService.update(shop.id, formData)
      setShop(updatedShop)
      setSuccess(true)
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error('Failed to update settings:', err)
      setError('Failed to save settings. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'profile', name: 'Shop Profile', icon: Store },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Lock },
    { id: 'integrations', name: 'Integrations', icon: Globe },
  ]
  const [activeTab, setActiveTab] = useState('profile')

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="mt-1 text-zinc-400">Manage your shop profile and application preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Settings Sidebar */}
        <div className="w-full lg:w-64 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                activeTab === tab.id
                  ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                  : "text-zinc-500 hover:text-white hover:bg-white/5 border border-transparent"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.name}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 max-w-2xl">
          <div className="glass rounded-3xl p-8">
            {activeTab === 'profile' ? (
              <form onSubmit={handleSave} className="space-y-6">
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white text-3xl font-bold">
                    {formData.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Shop Details</h3>
                    <p className="text-sm text-zinc-500">Update your store information visible to customers</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Shop Name</label>
                    <div className="relative">
                      <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-purple-500 outline-none transition-all"
                        placeholder="Kumar General Store"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Category</label>
                    <div className="relative">
                      <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-purple-500 outline-none transition-all appearance-none cursor-pointer"
                      >
                        <option value="grocery" className="bg-[#1a1a1f]">Grocery</option>
                        <option value="pharmacy" className="bg-[#1a1a1f]">Pharmacy</option>
                        <option value="food" className="bg-[#1a1a1f]">Food & Beverages</option>
                        <option value="electronics" className="bg-[#1a1a1f]">Electronics</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-purple-500 outline-none transition-all"
                        placeholder="+91 98765 43210"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Shop ID</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300/20" />
                      <input
                        type="text"
                        readOnly
                        value={shop?.id}
                        className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/5 rounded-xl text-zinc-500 outline-none cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Shop Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-4 w-4 h-4 text-zinc-500" />
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      rows="3"
                      className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-purple-500 outline-none transition-all resize-none"
                      placeholder="Street, Landmark, City"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6">
                  <div className="flex items-center gap-2">
                    {success && (
                      <span className="flex items-center gap-1.5 text-green-400 text-sm font-medium animate-in fade-in slide-in-from-left-2 duration-300">
                        <CheckCircle2 className="w-4 h-4" />
                        Settings saved!
                      </span>
                    )}
                    {error && (
                      <span className="flex items-center gap-1.5 text-red-400 text-sm font-medium">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                      </span>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-xl font-bold shadow-xl shadow-purple-500/25 transition-all hover:-translate-y-0.5 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="py-20 text-center">
                <Globe className="w-16 h-16 text-zinc-800 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">{tabs.find(t => t.id === activeTab)?.name}</h3>
                <p className="text-zinc-500 italic">This section is coming soon as part of the next update.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
