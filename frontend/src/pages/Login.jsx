import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { LogIn, Store, Mail, Lock, Loader2, AlertCircle } from 'lucide-react'
import { useShop } from '../context/ShopContext'
import { useFormik } from 'formik'
import * as Yup from 'yup'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useShop()
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  const formik = useFormik({
    initialValues: {
      email: '',
      password: ''
    },
    validationSchema: Yup.object({
      email: Yup.string().email('Invalid email address').required('Required'),
      password: Yup.string().min(8, 'Must be at least 8 characters').required('Required')
    }),
    onSubmit: async (values) => {
      setServerError('')
      setLoading(true)

      try {
        const response = await fetch('http://localhost:8000/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values)
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.detail || 'Login failed')
        }

        login(data.user, data.shop, data.session.id)
        navigate('/dashboard')
      } catch (err) {
        setServerError(err.message)
      } finally {
        setLoading(false)
      }
    }
  })

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] px-4 font-sans">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 mb-4 shadow-lg shadow-purple-500/20">
            <Store className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">StoreStorm</h1>
          <p className="text-zinc-500">Sign in to your account</p>
        </div>

        {/* Login Form */}
        <div className="glass rounded-3xl p-8 border border-white/5 shadow-2xl">
          <form onSubmit={formik.handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">
                Email
              </label>
              <div className="relative">
                <Mail className={cn(
                  "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors",
                  formik.touched.email && formik.errors.email ? "text-red-400" : "text-zinc-500"
                )} />
                <input
                  type="email"
                  name="email"
                  {...formik.getFieldProps('email')}
                  className={cn(
                    "w-full pl-12 pr-4 py-3.5 bg-white/5 border rounded-2xl text-white placeholder-zinc-600 focus:outline-none focus:ring-2 transition-all",
                    formik.touched.email && formik.errors.email 
                      ? "border-red-400/50 focus:ring-red-400/20 bg-red-400/5" 
                      : "border-white/10 focus:border-purple-500 focus:ring-purple-500/20"
                  )}
                  placeholder="you@example.com"
                />
              </div>
              {formik.touched.email && formik.errors.email && (
                <p className="text-xs text-red-400 ml-1 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                  <AlertCircle className="w-3 h-3" />
                  {formik.errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">
                Password
              </label>
              <div className="relative">
                <Lock className={cn(
                  "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors",
                  formik.touched.password && formik.errors.password ? "text-red-400" : "text-zinc-500"
                )} />
                <input
                  type="password"
                  name="password"
                  {...formik.getFieldProps('password')}
                  className={cn(
                    "w-full pl-12 pr-4 py-3.5 bg-white/5 border rounded-2xl text-white placeholder-zinc-600 focus:outline-none focus:ring-2 transition-all",
                    formik.touched.password && formik.errors.password 
                      ? "border-red-400/50 focus:ring-red-400/20 bg-red-400/5" 
                      : "border-white/10 focus:border-purple-500 focus:ring-purple-500/20"
                  )}
                  placeholder="••••••••"
                />
              </div>
              {formik.touched.password && formik.errors.password && (
                <p className="text-xs text-red-400 ml-1 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                  <AlertCircle className="w-3 h-3" />
                  {formik.errors.password}
                </p>
              )}
            </div>

            {/* Server Error Message */}
            {serverError && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                <p className="text-red-400 text-sm font-medium">{serverError}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !formik.isValid}
              className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-2xl font-bold shadow-xl shadow-purple-500/25 hover:shadow-purple-500/40 hover:-translate-y-0.5 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Authenticating...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2 text-lg">
                  <LogIn className="w-5 h-5" />
                  Sign In
                </span>
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-8 text-center pt-6 border-t border-white/5">
            <p className="text-zinc-500 text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-purple-400 hover:text-purple-300 font-bold transition-all ml-1">
                Create one now
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
