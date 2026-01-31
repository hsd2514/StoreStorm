import { Search, Bell, Command } from 'lucide-react'

export default function TopBar() {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 glass border-b border-white/5">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <button 
          className="flex items-center w-full gap-3 px-4 py-2.5 text-sm text-zinc-500 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-colors"
          aria-label="Open search"
        >
          <Search className="w-4 h-4" aria-hidden="true" />
          <span>Search orders, products…</span>
          <kbd className="ml-auto flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-white/5 border border-white/10 rounded-md">
            <Command className="w-3 h-3" aria-hidden="true" />
            K
          </kbd>
        </button>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button 
          className="relative p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
          aria-label="View notifications"
        >
          <Bell className="w-5 h-5" aria-hidden="true" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-purple-500 rounded-full ring-2 ring-[#0a0a0f]" />
        </button>

        {/* Quick action */}
        <button className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]">
          + New Order
        </button>
      </div>
    </header>
  )
}
