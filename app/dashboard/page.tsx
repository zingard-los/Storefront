'use client'

import { useEffect, useState } from 'react'
import { useAdminGuard } from '@/lib/use-admin'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  FiShoppingCart, 
  FiTrendingUp, 
  FiBox, 
  FiDollarSign, 
  FiLogOut,
  FiRefreshCw,
  FiMenu,
  FiX,
  FiChevronRight
} from 'react-icons/fi'

// Theme Configuration
const theme = {
  Orange: "#F2842F",
  White: "#FFF9F2",
  Darkblue: "#091540",
} as const;

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  total_price: number | string;
  status: string;
  created_at: string;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  accentColor?: string;
  subtitle?: string;
}

export default function Dashboard() {
  const { loading: authLoading, isAdmin } = useAdminGuard()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalStock: 0,
  })
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  // Close mobile drawer when route changes or screen resizes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMobileMenuOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    setError(null)
    try {
      // Parallelize Supabase requests for faster load times
      const [productsRes, ordersRes] = await Promise.all([
        supabase.from('products').select('stock'),
        supabase.from('orders').select('*').order('created_at', { ascending: false })
      ])

      if (productsRes.error) throw productsRes.error
      if (ordersRes.error) throw ordersRes.error

      const products = productsRes.data || []
      const orders = ordersRes.data || []

      const totalStock = products.reduce((sum, product) => sum + (Number(product.stock) || 0), 0)
      const totalRevenue = orders.reduce((sum, order) => sum + (Number(order.total_price) || 0), 0)

      setStats({
        totalProducts: products.length,
        totalOrders: orders.length,
        totalRevenue,
        totalStock,
      })

      setRecentOrders(orders.slice(0, 5))
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err)
      setError('Failed to load dashboard metrics. Please check your database connection.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      window.location.href = '/login'
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: FiTrendingUp },
    { name: 'Products', href: '/products', icon: FiBox },
    { name: 'Orders', href: '/orders', icon: FiShoppingCart },
  ]

  if (authLoading || !isAdmin) {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
      Checking access...
    </div>
  )
}

  return (
    <div className="min-h-screen bg-[#091540] text-[#FFF9F2] font-sans antialiased selection:bg-[#F2842F] selection:text-white">
      
      {/* Dynamic Header */}
      <header className="bg-[#0f1d4f]/90 backdrop-blur-md border-b border-[#1e3073]/80 px-4 sm:px-6 py-3.5 sticky top-0 z-30 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          
          {/* Mobile Menu Button & Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-[#FFF9F2]/80 hover:text-[#FFF9F2] hover:bg-[#1e3073]/50 focus:outline-none transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>

            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#F2842F] to-[#ff9e54] flex items-center justify-center font-bold text-lg text-[#FFF9F2] shadow-md shadow-[#F2842F]/20 group-hover:scale-105 transition-transform">
                S
              </div>
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-[#FFF9F2]">
                Shop<span className="text-[#F2842F]">Admin</span>
              </span>
            </Link>
          </div>

          {/* Action Header Items */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3.5 py-2 bg-[#F2842F] hover:bg-[#d96f1d] active:scale-95 text-[#FFF9F2] text-sm font-medium rounded-xl transition-all duration-200 shadow-md shadow-[#F2842F]/15"
            >
              <FiLogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          {/* Dark Backdrop */}
          <div 
            className="fixed inset-0 bg-[#091540]/80 backdrop-blur-sm transition-opacity" 
            onClick={() => setMobileMenuOpen(false)} 
          />

          {/* Slide-out Sidebar */}
          <aside className="relative w-72 max-w-[80vw] bg-[#0d1a45] border-r border-[#1e3073] p-6 shadow-2xl flex flex-col justify-between z-50 transform transition-transform duration-300">
            <div>
              <div className="mb-6 pb-4 border-b border-[#1e3073]/60 flex justify-between items-center">
                <span className="text-xs font-semibold text-[#FFF9F2]/50 uppercase tracking-wider">Navigation</span>
                <button onClick={() => setMobileMenuOpen(false)} className="text-[#FFF9F2]/60 hover:text-white">
                  <FiX size={20} />
                </button>
              </div>

              <nav className="space-y-1.5">
                {navItems.map((item) => {
                  const isActive = pathname === item.href
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-[#F2842F] text-[#FFF9F2] shadow-md shadow-[#F2842F]/20'
                          : 'text-[#FFF9F2]/70 hover:text-[#FFF9F2] hover:bg-[#15255e]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={20} />
                        <span>{item.name}</span>
                      </div>
                      <FiChevronRight size={16} className={`transition-transform ${isActive ? 'opacity-100' : 'opacity-30'}`} />
                    </Link>
                  )
                })}
              </nav>
            </div>

            <div className="pt-6 border-t border-[#1e3073]/60 text-xs text-[#FFF9F2]/40 text-center">
              ShopAdmin v2.0 • Live
            </div>
          </aside>
        </div>
      )}

      {/* Main Body Layout */}
      <div className="flex max-w-7xl mx-auto min-h-[calc(100vh-65px)]">
        
        {/* Desktop Sidebar */}
        <aside className="w-64 bg-[#0d1a45]/60 border-r border-[#1e3073]/80 p-6 hidden md:flex flex-col justify-between shrink-0">
          <nav className="space-y-2">
            <p className="text-[11px] font-semibold text-[#FFF9F2]/40 uppercase tracking-widest px-4 mb-2">Main Menu</p>
            {navItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-[#F2842F] text-[#FFF9F2] shadow-md shadow-[#F2842F]/20'
                      : 'text-[#FFF9F2]/70 hover:text-[#FFF9F2] hover:bg-[#15255e]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={19} />
                    <span>{item.name}</span>
                  </div>
                </Link>
              )
            })}
          </nav>

          <div className="p-4 rounded-xl bg-[#11225a]/60 border border-[#1e3073]/60 text-xs text-[#FFF9F2]/60 space-y-1">
            <p className="font-semibold text-[#FFF9F2]">System Status</p>
            <p className="flex items-center gap-2 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Supabase Connected
            </p>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
          
          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-rose-950/70 border border-rose-700/60 rounded-2xl text-rose-200 flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center shadow-lg">
              <span className="text-sm">{error}</span>
              <button 
                onClick={fetchDashboardData}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-800/60 hover:bg-rose-700 text-[#FFF9F2] text-xs font-semibold rounded-lg transition-colors shrink-0"
              >
                <FiRefreshCw size={14} /> Retry Connection
              </button>
            </div>
          )}

          {/* Loading Skeleton View */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-28 gap-4">
              <div className="relative flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-[#1e3073] border-t-[#F2842F] rounded-full animate-spin"></div>
              </div>
              <p className="text-[#FFF9F2]/70 text-sm font-medium animate-pulse">Syncing store data...</p>
            </div>
          ) : (
            <>
              {/* Dashboard Title & Actions */}
              <div className="mb-8 flex flex-row justify-between items-center gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#FFF9F2] tracking-tight">
                    Dashboard
                  </h2>
                  <p className="text-[#FFF9F2]/60 text-xs sm:text-sm mt-0.5">Real-time metrics & sales performance</p>
                </div>
                
                <button 
                  onClick={fetchDashboardData}
                  className="flex items-center gap-2 px-3 py-2 bg-[#0d1a45] hover:bg-[#15255e] text-[#FFF9F2]/80 hover:text-[#F2842F] border border-[#1e3073] rounded-xl transition-all duration-200 text-xs font-semibold shadow-sm"
                  title="Refresh Data"
                >
                  <FiRefreshCw size={15} className={`${loading ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
              </div>

              {/* Stats Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
                <StatCard
                  title="Total Products"
                  value={stats.totalProducts}
                  icon={<FiBox size={22} />}
                  subtitle="Active in catalog"
                />
                <StatCard
                  title="Total Orders"
                  value={stats.totalOrders}
                  icon={<FiShoppingCart size={22} />}
                  subtitle="Lifetime orders"
                />
                <StatCard
                  title="Total Revenue"
                  value={`$${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  icon={<FiDollarSign size={22} />}
                  accentColor="border-[#F2842F]/60"
                  subtitle="Gross sales volume"
                />
                <StatCard
                  title="Total Stock"
                  value={stats.totalStock.toLocaleString()}
                  icon={<FiTrendingUp size={22} />}
                  subtitle="Units in inventory"
                />
              </div>

              {/* Recent Orders Section */}
              <div className="bg-gradient-to-b from-[#0d1a45] to-[#0b173e] rounded-2xl border border-[#1e3073]/80 p-5 sm:p-6 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-[#FFF9F2]">Recent Orders</h3>
                    <p className="text-xs text-[#FFF9F2]/50">Latest transactions from your store</p>
                  </div>
                  <Link 
                    href="/orders" 
                    className="flex items-center gap-1 text-xs font-bold text-[#F2842F] hover:text-[#ff9e54] transition-colors uppercase tracking-wider bg-[#F2842F]/10 hover:bg-[#F2842F]/20 px-3 py-1.5 rounded-lg border border-[#F2842F]/20"
                  >
                    <span>View All</span>
                    <FiChevronRight size={14} />
                  </Link>
                </div>

                {/* Table Container with Horizontal Scroll fallback */}
                <div className="overflow-x-auto -mx-5 sm:mx-0">
                  <div className="inline-block min-w-full align-middle px-5 sm:px-0">
                    <table className="min-w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-[#1e3073]/80 text-[#FFF9F2]/50 text-[11px] font-bold uppercase tracking-wider">
                          <th className="py-3 px-3 sm:px-4">Order ID</th>
                          <th className="py-3 px-3 sm:px-4">Customer</th>
                          <th className="py-3 px-3 sm:px-4 hidden sm:table-cell">Email</th>
                          <th className="py-3 px-3 sm:px-4">Amount</th>
                          <th className="py-3 px-3 sm:px-4">Status</th>
                          <th className="py-3 px-3 sm:px-4 text-right sm:text-left">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1e3073]/40 text-xs sm:text-sm">
                        {recentOrders.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-12 text-center text-[#FFF9F2]/40 font-medium">
                              No recent orders found.
                            </td>
                          </tr>
                        ) : (
                          recentOrders.map((order) => {
                            const orderId = order.id ? String(order.id) : '';
                            const displayId = orderId ? `#${orderId.slice(0, 8)}` : 'N/A';
                            const amount = Number(order.total_price) || 0;

                            return (
                              <tr 
                                key={order.id || Math.random()} 
                                className="hover:bg-[#13235b]/60 transition-colors group"
                              >
                                <td className="py-3.5 px-3 sm:px-4 font-mono text-xs text-[#FFF9F2]/80 group-hover:text-[#F2842F] transition-colors">
                                  {displayId}
                                </td>
                                <td className="py-3.5 px-3 sm:px-4 font-medium text-[#FFF9F2]">
                                  {order.customer_name || 'Guest'}
                                </td>
                                <td className="py-3.5 px-3 sm:px-4 text-[#FFF9F2]/60 hidden sm:table-cell max-w-[160px] truncate">
                                  {order.customer_email || 'N/A'}
                                </td>
                                <td className="py-3.5 px-3 sm:px-4 font-semibold text-[#FFF9F2]">
                                  ${amount.toFixed(2)}
                                </td>
                                <td className="py-3.5 px-3 sm:px-4">
                                  <StatusBadge status={order.status} />
                                </td>
                                <td className="py-3.5 px-3 sm:px-4 text-[#FFF9F2]/50 text-xs text-right sm:text-left whitespace-nowrap">
                                  {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}

// Sub-Component: Enhanced Stat Card
function StatCard({ title, value, icon, accentColor, subtitle }: StatCardProps) {
  return (
    <div className={`bg-gradient-to-br from-[#0d1a45] to-[#11225a] rounded-2xl p-5 border ${accentColor || 'border-[#1e3073]/80'} shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between relative overflow-hidden group`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[#FFF9F2]/50 text-[11px] font-bold uppercase tracking-wider">{title}</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#FFF9F2] mt-1 tracking-tight">{value}</p>
        </div>
        <div className="w-11 h-11 rounded-xl bg-[#F2842F]/10 border border-[#F2842F]/20 text-[#F2842F] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
          {icon}
        </div>
      </div>
      {subtitle && (
        <div className="mt-3 pt-2.5 border-t border-[#1e3073]/40 flex items-center justify-between text-[11px] text-[#FFF9F2]/40">
          <span>{subtitle}</span>
        </div>
      )}
    </div>
  )
}

// Sub-Component: Dynamic Status Badge
function StatusBadge({ status }: { status?: string }) {
  const getBadgeConfig = (statusStr?: string) => {
    switch (statusStr?.toLowerCase()) {
      case 'pending':
        return {
          bg: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
          dot: 'bg-amber-400'
        }
      case 'processing':
        return {
          bg: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
          dot: 'bg-blue-400'
        }
      case 'shipped':
        return {
          bg: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
          dot: 'bg-purple-400'
        }
      case 'delivered':
        return {
          bg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
          dot: 'bg-emerald-400'
        }
      case 'cancelled':
      case 'canceled':
        return {
          bg: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
          dot: 'bg-rose-400'
        }
      default:
        return {
          bg: 'bg-slate-500/10 text-slate-300 border-slate-500/30',
          dot: 'bg-slate-400'
        }
    }
  }

  const config = getBadgeConfig(status)

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
      <span className="capitalize">{status || 'Unknown'}</span>
    </span>
  )
}