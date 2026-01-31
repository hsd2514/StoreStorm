import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { 
  Store, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  MapPin, 
  Tag, 
  Loader2, 
  AlertCircle,
  ChevronRight,
  ChevronLeft
} from 'lucide-react'
import { useShop } from '../context/ShopContext'
import { useFormik } from 'formik'
import * as Yup from 'yup'

export default function Register() {
  const navigate = useNavigate()
  const { login } = useShop()
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1) // 1: Personal, 2: Shop

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      name: '',
      shop_name: '',
      phone: '',
      address: '',
      category: 'grocery'
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Your name is required'),
      email: Yup.string().email('Invalid email address').required('Required'),
      password: Yup.string().min(8, 'Password must be at least 8 characters').required('Required'),
      shop_name: Yup.string().required('Shop name is required'),
      phone: Yup.string().matches(/^[0-9+ ]+$/, 'Invalid phone number').required('Required'),
      address: Yup.string().required('Address is required'),
    }),
    onSubmit: async (values) => {
      setServerError('')
      setLoading(true)

      try {
        const response = await fetch('http://localhost:8000/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values)
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.detail || 'Registration failed')
        }

        // The backend register returns data similar to login
        login(data.user, data.shop, data.session?.id)
        navigate('/dashboard')
      } catch (err) {
        setServerError(err.message)
      } finally {
        setLoading(false)
      }
    }
  })

  const nextStep = () => {
    // Basic validation before step change
    if (step === 1) {
      if (formik.errors.name || formik.errors.email || formik.errors.password || !formik.values.email) {
        formik.setFieldTouched('name', true)
        formik.setFieldTouched('email', true)
        formik.setFieldTouched('password', true)
        return
      }
    }
    setStep(step + 1)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] px-4 py-12 font-sans">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 mb-4 shadow-lg shadow-purple-500/20">
            <Store className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome to StoreStorm</h1>
          <p className="text-zinc-500">Launch your digital storefront in minutes</p>
        </div>

        {/* Progress bar */}
        <div className="max-w-xs mx-auto mb-8 flex items-center gap-2">
          <div className={cn("h-1.5 flex-1 rounded-full transition-all duration-500", step >= 1 ? "bg-purple-500" : "bg-white/10")} />
          <div className={cn("h-1.5 flex-1 rounded-full transition-all duration-500", step >= 2 ? "bg-purple-500" : "bg-white/10")} />
        </div>

        {/* Register Form */}
        <div className="glass rounded-3xl p-8 md:p-10 border border-white/5 shadow-2xl">
          <form onSubmit={formik.handleSubmit} className="space-y-8">
            
            {step === 1 ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center gap-4 mb-2">
                   <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 font-bold">1</div>
                   <h3 className="text-xl font-bold text-white">Personal Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Your Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                      <input
                        type="text"
                        name="name"
                        {...formik.getFieldProps('name')}
                        className={cn(
                          "w-full pl-12 pr-4 py-3.5 bg-white/5 border rounded-2xl text-white placeholder-zinc-600 focus:outline-none transition-all",
                          formik.touched.name && formik.errors.name ? "border-red-400/50" : "border-white/10 focus:border-purple-500"
                        )}
                        placeholder="John Doe"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                      <input
                        type="email"
                        name="email"
                        {...formik.getFieldProps('email')}
                        className={cn(
                          "w-full pl-12 pr-4 py-3.5 bg-white/5 border rounded-2xl text-white placeholder-zinc-600 focus:outline-none transition-all",
                          formik.touched.email && formik.errors.email ? "border-red-400/50" : "border-white/10 focus:border-purple-500"
                        )}
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                    <input
                      type="password"
                      name="password"
                      {...formik.getFieldProps('password')}
                      className={cn(
                        "w-full pl-12 pr-4 py-3.5 bg-white/5 border rounded-2xl text-white placeholder-zinc-600 focus:outline-none transition-all",
                        formik.touched.password && formik.errors.password ? "border-red-400/50" : "border-white/10 focus:border-purple-500"
                      )}
                      placeholder="•••••••• (Min 8 characters)"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={nextStep}
                  className="w-full py-4 px-6 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold border border-white/10 transition-all flex items-center justify-center gap-2"
                >
                  Continue to Shop Details
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center gap-4 mb-2">
                   <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 font-bold">2</div>
                   <h3 className="text-xl font-bold text-white">Shop Details</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Shop Name</label>
                    <div className="relative">
                      <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                      <input
                        type="text"
                        name="shop_name"
                        {...formik.getFieldProps('shop_name')}
                        className={cn(
                          "w-full pl-12 pr-4 py-3.5 bg-white/5 border rounded-2xl text-white placeholder-zinc-600 focus:outline-none transition-all",
                          formik.touched.shop_name && formik.errors.shop_name ? "border-red-400/50" : "border-white/10 focus:border-purple-500"
                        )}
                        placeholder="Kumar General Store"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                      <input
                        type="tel"
                        name="phone"
                        {...formik.getFieldProps('phone')}
                        className={cn(
                          "w-full pl-12 pr-4 py-3.5 bg-white/5 border rounded-2xl text-white placeholder-zinc-600 focus:outline-none transition-all",
                          formik.touched.phone && formik.errors.phone ? "border-red-400/50" : "border-white/10 focus:border-purple-500"
                        )}
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Shop Category</label>
                  <div className="relative">
                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                    <select
                      name="category"
                      {...formik.getFieldProps('category')}
                      className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-purple-500 transition-all appearance-none cursor-pointer"
                    >
                      <option value="grocery" className="bg-[#1a1a1f]">Grocery</option>
                      <option value="pharmacy" className="bg-[#1a1a1f]">Pharmacy</option>
                      <option value="food" className="bg-[#1a1a1f]">Food & Beverages</option>
                      <option value="electronics" className="bg-[#1a1a1f]">Electronics</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Store Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-4 w-5 h-5 text-zinc-500" />
                    <textarea
                      name="address"
                      {...formik.getFieldProps('address')}
                      className={cn(
                        "w-full pl-12 pr-4 py-3.5 bg-white/5 border rounded-2xl text-white placeholder-zinc-600 focus:outline-none transition-all resize-none",
                        formik.touched.address && formik.errors.address ? "border-red-400/50" : "border-white/10 focus:border-purple-500"
                      )}
                      placeholder="Street, Landmark, City"
                      rows="3"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="p-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl border border-white/10 transition-all"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !formik.isValid}
                    className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-2xl font-bold shadow-xl shadow-purple-500/25 hover:shadow-purple-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Finishing Setup...
                      </span>
                    ) : 'Complete Registration'}
                  </button>
                </div>
              </div>
            )}

            {serverError && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 animate-in shake duration-500">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                <p className="text-red-400 text-sm font-medium">{serverError}</p>
              </div>
            )}
          </form>

          {/* Login Link */}
          <div className="mt-8 text-center pt-8 border-t border-white/5">
            <p className="text-zinc-500 text-sm">
              Already have a shop?{' '}
              <Link to="/login" className="text-purple-400 hover:text-purple-300 font-bold transition-all ml-1">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}
