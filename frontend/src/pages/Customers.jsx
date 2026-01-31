import { useState, useEffect } from 'react'
import { 
  Search, 
  Plus, 
  Users, 
  Phone, 
  MapPin, 
  MoreVertical, 
  Filter, 
  Loader2, 
  Trash2, 
  Edit2,
  IndianRupee,
  ShoppingBag,
  Clock,
  ChevronRight,
  Globe
} from 'lucide-react'
import DashboardLayout from '../components/layout/DashboardLayout'
import { cn } from '../lib/utils'
import { customerService } from '../services/customerService'
import { useShop } from '../context/ShopContext'

export default function Customers() {
  const { shop } = useShop()
  const [loading, setLoading] = useState(true)
  const [customers, setCustomers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState(null)

  // Pagination State
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    preferred_language: 'en'
  })

  useEffect(() => {
    if (shop?.id) {
      fetchCustomers()
    }
  }, [shop?.id, page])

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const data = await customerService.list({ 
        shop_id: shop.id,
        skip: (page - 1) * limit,
        limit: limit
      })
      setCustomers(data || [])
    } catch (err) {
      console.error('Failed to fetch customers:', err)
      setError('Failed to load customers')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!shop?.id) return
    
    try {
      setLoading(true)
      const data = {
        ...formData,
        shop_id: shop.id
      }

      if (editingCustomer) {
        await customerService.update(editingCustomer.id, data)
      } else {
        await customerService.create(data)
      }
      
      setIsModalOpen(false)
      fetchCustomers()
    } catch (err) {
      console.error('Failed to save customer:', err)
      setError('Failed to save customer')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this customer?')) return
    try {
      await customerService.delete(id)
      setCustomers(customers.filter(c => c.id !== id))
    } catch (err) {
      console.error('Failed to delete customer:', err)
      setError('Failed to delete customer')
    }
  }

  const openModal = (customer = null) => {
    if (customer) {
      setEditingCustomer(customer)
      setFormData({
        name: customer.name,
        phone: customer.phone,
        address: customer.address,
        preferred_language: customer.preferred_language || 'en'
      })
    } else {
      setEditingCustomer(null)
      setFormData({
        name: '',
        phone: '',
        address: '',
        preferred_language: 'en'
      })
    }
    setIsModalOpen(true)
  }

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  )

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Customers</h1>
          <p className="mt-1 text-zinc-400">Manage your customer base and their orders</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 rounded-xl shadow-lg shadow-purple-500/25 transition-all duration-200 hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" />
          Add Customer
        </button>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="search"
              placeholder="Search by name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:border-purple-500 outline-none transition-colors"
            />
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-zinc-400 bg-white/5 border border-white/10 rounded-xl hover:text-white transition-colors">
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 glass rounded-3xl border-dashed border-white/10">
            <Users className="w-12 h-12 text-zinc-600 mb-4" />
            <p className="text-zinc-500 text-lg font-medium">No customers found</p>
            <p className="text-zinc-600 text-sm mt-1">Start by adding your first customer</p>
          </div>
        ) : (
          <>
            {filteredCustomers.map((customer, idx) => (
              <div key={customer.id || customer.$id || `cust-${idx}`} className="glass rounded-3xl p-6 hover:bg-white/[0.03] transition-all duration-300 group">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center text-purple-400 font-bold text-xl border border-purple-500/20">
                      {customer.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-white font-semibold flex items-center gap-2">
                        {customer.name}
                      </h3>
                      <p className="text-zinc-500 text-sm flex items-center gap-1.5 mt-0.5">
                        <Phone className="w-3 h-3" />
                        {customer.phone}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openModal(customer)} className="p-2 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(customer.id)} className="p-2 hover:bg-red-500/10 rounded-lg text-zinc-400 hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-500 flex items-center gap-1.5">
                      <ShoppingBag className="w-4 h-4" />
                      Total Orders
                    </span>
                    <span className="text-white font-medium tabular-nums">{customer.total_orders || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-500 flex items-center gap-1.5">
                      <IndianRupee className="w-4 h-4" />
                      Total Spent
                    </span>
                    <span className="text-green-400 font-medium tabular-nums">
                      ₹{(customer.total_spent || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-500 flex items-center gap-1.5">
                      <Globe className="w-4 h-4" />
                      Language
                    </span>
                    <span className="text-zinc-300 uppercase">{customer.preferred_language || 'en'}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <p className="text-xs text-zinc-500 flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span className="line-clamp-2">{customer.address}</span>
                  </p>
                </div>

                <button className="w-full mt-6 py-2.5 text-sm font-medium text-white bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all flex items-center justify-center gap-2 group/btn">
                  View History
                  <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                </button>
              </div>
            ))}
            
            {/* Pagination Controls */}
            <div className="col-span-full flex items-center justify-between mt-8 bg-white/5 p-4 rounded-3xl border border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Page</span>
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 font-bold text-sm">
                  {page}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setPage(p => Math.max(1, p - 1))
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  disabled={page === 1}
                  className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white disabled:opacity-30 transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => {
                    setPage(p => p + 1)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  disabled={customers.length < limit}
                  className="px-6 py-2 text-sm font-bold text-white bg-purple-600 rounded-xl hover:bg-purple-500 disabled:opacity-30 transition-all shadow-lg shadow-purple-500/20"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/5">
              <h3 className="text-xl font-bold text-white">
                {editingCustomer ? 'Edit Customer' : 'New Customer'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors"
              >
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-8 space-y-5">
              <div className="grid grid-cols-1 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Customer Name</label>
                  <input 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Full name"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-purple-500 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Phone Number</label>
                  <input 
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="+91 XXXXX XXXXX"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-purple-500 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Preferred Language</label>
                  <select 
                    value={formData.preferred_language}
                    onChange={(e) => setFormData({...formData, preferred_language: e.target.value})}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-purple-500 outline-none transition-colors"
                  >
                    <option value="en" className="bg-[#1a1a1f]">English</option>
                    <option value="hi" className="bg-[#1a1a1f]">Hindi</option>
                    <option value="kn" className="bg-[#1a1a1f]">Kannada</option>
                    <option value="te" className="bg-[#1a1a1f]">Telugu</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Delivery Address</label>
                  <textarea 
                    required
                    rows="3"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder="Residential address"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-purple-500 outline-none transition-colors resize-none"
                  />
                </div>
              </div>

              <div className="pt-6 flex items-center justify-end gap-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="px-8 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-purple-500 hover:shadow-lg hover:shadow-purple-500/25 rounded-xl transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingCustomer ? 'Update Customer' : 'Add Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
