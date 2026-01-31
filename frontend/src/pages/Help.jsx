import { 
  HelpCircle, 
  Book, 
  MessageSquare, 
  Mail, 
  ExternalLink,
  ChevronRight,
  PlayCircle,
  ShieldCheck,
  Zap,
  Search
} from 'lucide-react'
import DashboardLayout from '../components/layout/DashboardLayout'
import { cn } from '../lib/utils'

export default function Help() {
  const categories = [
    { title: 'Getting Started', icon: PlayCircle, count: 12, color: 'text-purple-400 bg-purple-500/10' },
    { title: 'Inventory Help', icon: Book, count: 8, color: 'text-blue-400 bg-blue-500/10' },
    { title: 'Orders & Shipping', icon: Zap, count: 15, color: 'text-amber-400 bg-amber-500/10' },
    { title: 'Security & Privacy', icon: ShieldCheck, count: 5, color: 'text-emerald-400 bg-emerald-500/10' },
  ]

  const faqs = [
    { q: 'How do I connect my WhatsApp?', a: 'Go to Settings > Automations and scan the QR code using your WhatsApp Linked Devices option.' },
    { q: 'Can I import products from Excel?', a: 'Yes! Navigate to Inventory and click the "Import" button next to "New Product" to upload your CSV/XLSX file.' },
    { q: 'What are the GST rates supported?', a: 'StoreStorm supports all standard Indian GST rates: 0%, 5%, 12%, 18%, and 28%. You can set these per product.' },
  ]

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-12 pb-20">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-purple-500/10 border border-purple-500/20 text-purple-400 mb-2">
            <HelpCircle className="w-10 h-10" />
          </div>
          <h1 className="text-5xl font-black text-white italic tracking-tighter">How can we help?</h1>
          <p className="text-zinc-500 text-lg uppercase tracking-widest font-bold">Search the knowledge base or reach out to us</p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-2xl mx-auto">
           <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
           <input 
             type="text" 
             placeholder="Search for articles, guides..."
             className="w-full pl-16 pr-6 py-6 glass bg-white/[0.03] border border-white/10 rounded-[2.5rem] text-white text-lg outline-none focus:border-purple-500 transition-all placeholder:text-zinc-600 shadow-2xl"
           />
        </div>

        {/* Categories */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
           {categories.map((c, i) => (
             <button key={i} className="glass group p-8 rounded-[2rem] border border-white/5 hover:bg-white/[0.04] transition-all text-left">
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border group-hover:scale-110 transition-transform", c.color, "border-current/10")}>
                   <c.icon className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-black text-white mb-1 uppercase tracking-tight">{c.title}</h3>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{c.count} Articles</p>
             </button>
           ))}
        </div>

        {/* FAQ Section */}
        <div className="space-y-8">
           <h2 className="text-2xl font-black text-white uppercase tracking-widest flex items-center gap-4">
              <span className="w-10 h-1 bg-purple-500 rounded-full" />
              Frequently Asked Questions
           </h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {faqs.map((f, i) => (
                <div key={i} className="glass p-8 rounded-3xl border border-white/5 bg-white/[0.01]">
                   <h4 className="text-lg font-bold text-white mb-4 italic leading-tight">"{f.q}"</h4>
                   <p className="text-zinc-400 text-sm leading-relaxed font-medium">{f.a}</p>
                </div>
              ))}
           </div>
        </div>

        {/* Contact Support */}
        <div className="glass p-12 rounded-[3rem] border border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-cyan-500/5 text-center space-y-8">
           <div className="space-y-2">
              <h2 className="text-3xl font-black text-white italic">Still need a hand?</h2>
              <p className="text-zinc-500 font-bold uppercase tracking-widest">Our support squad is available 24/7</p>
           </div>
           <div className="flex flex-wrap items-center justify-center gap-6">
              <button className="flex items-center gap-3 px-8 py-4 bg-white text-zinc-900 rounded-2xl font-black uppercase tracking-widest hover:bg-purple-50 transition-all">
                 <MessageSquare className="w-5 h-5 text-purple-600" />
                 Live Chat
              </button>
              <button className="flex items-center gap-3 px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                 <Mail className="w-5 h-5 text-purple-400" />
                 Email Support
              </button>
           </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
