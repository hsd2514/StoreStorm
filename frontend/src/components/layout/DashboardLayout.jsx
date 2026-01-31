import Sidebar from './Sidebar'
import TopBar from './TopBar'

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="ml-[280px]">
        <TopBar />
        <main className="p-6">
          {children}
        </main>
      </div>

      {/* Background gradient decoration */}
      <div 
        className="fixed top-0 right-0 w-[600px] h-[600px] opacity-30 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, rgba(139,92,246,0.15) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />
      <div 
        className="fixed bottom-0 left-[280px] w-[400px] h-[400px] opacity-20 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, rgba(6,182,212,0.15) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />
    </div>
  )
}
