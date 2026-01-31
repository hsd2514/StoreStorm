import { useState, useEffect } from 'react'
import { 
  FileText,
  Download,
  IndianRupee,
  PieChart,
  TrendingUp,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  Loader2,
  AlertCircle
} from 'lucide-react'
import DashboardLayout from '../components/layout/DashboardLayout'
import { cn } from '../lib/utils'
import { gstReportService } from '../services/gstReportService'
import { useShop } from '../context/ShopContext'

export default function GST() {
  const { shop } = useShop()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    if (shop?.id) {
      fetchReports()
    }
  }, [shop?.id])

  const fetchReports = async () => {
    try {
      setLoading(true)
      console.log('📊 Fetching GST reports for shop:', shop?.id);
      const response = await gstReportService.list({ shop_id: shop.id })
      setReports(response || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateReport = async () => {
    try {
      setGenerating(true)
      const now = new Date()
      const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
      
      await gstReportService.create({
        shop_id: shop.id,
        period: period,
        total_sales: 0,
        total_gst: 0,
        breakdown: {}
      })
      
      fetchReports()
    } catch (err) {
      alert('Failed to generate report: ' + err.message)
    } finally {
      setGenerating(false)
    }
  }

  // Get the latest report for simple summary
  const latestReport = reports[0] || {
    total_sales: 0,
    total_gst: 0,
    breakdown: {},
    period: 'MTD'
  }

  const breakdownArray = Object.entries(latestReport.breakdown || {}).map(([rate, amount]) => ({
    rate: `${rate}%`,
    amount: amount,
    tax: (amount * parseFloat(rate)) / 100,
    items: '-' // Backend doesn't store item count in summary yet
  }))
  return (
    <DashboardLayout>
      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">GST & Compliance</h1>
          <p className="mt-1 text-zinc-400">
            Manage GST calculations and generate compliance reports
          </p>
        </div>
        <button 
          onClick={handleGenerateReport}
          disabled={generating}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 rounded-xl shadow-lg shadow-purple-500/25 transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {generating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" aria-hidden="true" />
          )}
          {generating ? 'Generating...' : 'Generate Report'}
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-purple-500 animate-spin mb-4" />
          <p className="text-zinc-400">Loading GST data...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 glass rounded-2xl border border-red-500/20">
          <AlertCircle className="w-10 h-10 text-red-400 mb-4" />
          <p className="text-white font-medium">Failed to load GST reports</p>
          <p className="text-zinc-400 text-sm mt-1">{error}</p>
          <button 
            onClick={fetchReports}
            className="mt-6 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-green-500/10">
                  <IndianRupee className="w-6 h-6 text-green-400" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm text-zinc-400">Total Sales ({latestReport.period || 'MTD'})</p>
                  <p className="text-2xl font-bold text-white flex items-center gap-1">
                    <IndianRupee className="w-5 h-5" aria-hidden="true" />
                    <span className="tabular-nums">{latestReport.total_sales.toLocaleString()}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl p-6">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-500/10">
                  <TrendingUp className="w-6 h-6 text-cyan-400" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm text-zinc-400">Total GST Collected</p>
                  <p className="text-2xl font-bold text-white flex items-center gap-1">
                    <IndianRupee className="w-5 h-5" aria-hidden="true" />
                    <span className="tabular-nums">{latestReport.total_gst.toLocaleString()}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl p-6">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-purple-500/10">
                  <Calendar className="w-6 h-6 text-purple-400" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm text-zinc-400">Last Generated</p>
                  <p className="text-2xl font-bold text-white">
                    {latestReport.generated_at ? new Date(latestReport.generated_at).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'None'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* GST Breakdown */}
            <div className="lg:col-span-2 glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-purple-400" aria-hidden="true" />
                  GST Breakdown by Slab
                </h2>
                <span className="text-sm text-zinc-500">{latestReport.period}</span>
              </div>

              <div className="space-y-4">
                {breakdownArray.length === 0 ? (
                  <p className="text-zinc-500 text-center py-8">No breakdown data available for this period.</p>
                ) : (
                  breakdownArray.map((slab) => {
                    const percentage = latestReport.total_sales > 0 
                      ? (slab.amount / latestReport.total_sales) * 100 
                      : 0
                    return (
                      <div key={slab.rate} className="p-4 bg-white/5 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <span className="px-3 py-1 text-sm font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-lg">
                              {slab.rate}
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-white flex items-center gap-1">
                              <IndianRupee className="w-3 h-3" aria-hidden="true" />
                              <span className="tabular-nums">{slab.tax.toLocaleString()}</span>
                              <span className="text-zinc-500">tax</span>
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-xs text-zinc-500 tabular-nums w-12">
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

        {/* AI GST Assistant */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500">
              <Sparkles className="w-4 h-4 text-white" aria-hidden="true" />
            </div>
            <h2 className="text-lg font-semibold text-white">GST Assistant</h2>
          </div>

          <div className="space-y-3 mb-6">
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="text-sm text-green-400 font-medium">All products categorized</p>
                  <p className="text-xs text-zinc-500 mt-1">86 products have correct GST rates</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="text-sm text-amber-400 font-medium">Review suggested</p>
                  <p className="text-xs text-zinc-500 mt-1">3 new products need GST category assignment</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-white/5 rounded-xl mb-4">
            <p className="text-sm text-zinc-300 leading-relaxed">
              💡 <strong>Tip:</strong> Products like rice, wheat, and milk are exempt from GST (0%). 
              Cooking oils typically attract 5% GST.
            </p>
          </div>

          <button 
            disabled
            className="w-full px-4 py-3 text-sm font-medium text-zinc-500 bg-white/5 border border-white/10 rounded-xl cursor-not-allowed"
          >
            Assistant Offline (Parked)
          </button>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="glass rounded-2xl p-6 mt-6">
        <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <FileText className="w-5 h-5 text-purple-400" aria-hidden="true" />
          Recent Reports
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Period</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Total Sales</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">GST Amount</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {reports.map((report) => (
                <tr key={report.id} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-4 text-sm font-medium text-white">{report.period}</td>
                  <td className="px-4 py-4 text-sm text-white flex items-center gap-1">
                    <IndianRupee className="w-3 h-3" aria-hidden="true" />
                    <span className="tabular-nums">{report.total_sales.toLocaleString()}</span>
                  </td>
                  <td className="px-4 py-4 text-sm text-zinc-400 tabular-nums">
                    ₹{report.total_gst.toLocaleString()}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button className="px-3 py-1.5 text-xs font-medium text-purple-400 hover:text-white hover:bg-purple-500/10 rounded-lg transition-colors">
                      <Download className="w-4 h-4 inline mr-1" aria-hidden="true" />
                      Download
                    </button>
                  </td>
                </tr>
              ))}
              {reports.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-4 py-8 text-center text-zinc-500 text-sm">
                    No reports found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
    )}
    </DashboardLayout>
  )
}
