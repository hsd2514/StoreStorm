import { 
  FileText,
  Download,
  IndianRupee,
  PieChart,
  TrendingUp,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Sparkles
} from 'lucide-react'
import DashboardLayout from '../components/layout/DashboardLayout'
import { cn } from '../lib/utils'

const gstSummary = {
  totalSales: 245800,
  totalGST: 12340,
  breakdown: [
    { rate: '0%', amount: 45000, tax: 0, items: 12 },
    { rate: '5%', amount: 120000, tax: 6000, items: 45 },
    { rate: '12%', amount: 50000, tax: 6000, items: 18 },
    { rate: '18%', amount: 25000, tax: 4500, items: 8 },
    { rate: '28%', amount: 5800, tax: 1624, items: 3 },
  ]
}

const recentReports = [
  { period: 'January 2026', status: 'pending', sales: 245800, gst: 12340 },
  { period: 'December 2025', status: 'filed', sales: 312500, gst: 15680 },
  { period: 'November 2025', status: 'filed', sales: 289400, gst: 14520 },
]

export default function GST() {
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
        <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 rounded-xl shadow-lg shadow-purple-500/25 transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]">
          <Download className="w-4 h-4" aria-hidden="true" />
          Generate Report
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-green-500/10">
              <IndianRupee className="w-6 h-6 text-green-400" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm text-zinc-400">Total Sales (MTD)</p>
              <p className="text-2xl font-bold text-white flex items-center gap-1">
                <IndianRupee className="w-5 h-5" aria-hidden="true" />
                <span className="tabular-nums">{gstSummary.totalSales.toLocaleString()}</span>
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
                <span className="tabular-nums">{gstSummary.totalGST.toLocaleString()}</span>
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
              <p className="text-sm text-zinc-400">Next Filing Due</p>
              <p className="text-2xl font-bold text-white">Feb 20</p>
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
            <span className="text-sm text-zinc-500">January 2026</span>
          </div>

          <div className="space-y-4">
            {gstSummary.breakdown.map((slab) => {
              const percentage = (slab.amount / gstSummary.totalSales) * 100
              return (
                <div key={slab.rate} className="p-4 bg-white/5 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 text-sm font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-lg">
                        {slab.rate}
                      </span>
                      <span className="text-sm text-zinc-400">{slab.items} items</span>
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
            })}
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

          <button className="w-full px-4 py-3 text-sm font-medium text-purple-400 hover:text-white bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded-xl transition-colors">
            Ask GST Question
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
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Total Sales</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">GST Amount</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {recentReports.map((report) => (
                <tr key={report.period} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-4 text-sm font-medium text-white">{report.period}</td>
                  <td className="px-4 py-4">
                    <span className={cn(
                      'px-2.5 py-1 text-xs font-medium rounded-full border',
                      report.status === 'filed' 
                        ? 'bg-green-500/10 text-green-400 border-green-500/20'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    )}>
                      {report.status === 'filed' ? 'Filed' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-white flex items-center gap-1">
                    <IndianRupee className="w-3 h-3" aria-hidden="true" />
                    <span className="tabular-nums">{report.sales.toLocaleString()}</span>
                  </td>
                  <td className="px-4 py-4 text-sm text-zinc-400 tabular-nums">
                    ₹{report.gst.toLocaleString()}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button className="px-3 py-1.5 text-xs font-medium text-purple-400 hover:text-white hover:bg-purple-500/10 rounded-lg transition-colors">
                      <Download className="w-4 h-4 inline mr-1" aria-hidden="true" />
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  )
}
