'use client'

import { useEffect, useState, useMemo } from 'react'
import { useAdminGuard } from '@/lib/use-admin'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { 
  FiArrowLeft, 
  FiEye, 
  FiSearch, 
  FiRefreshCw, 
  FiShoppingBag, 
  FiAlertCircle, 
  FiClock, 
  FiCheckCircle,
  FiX,
  FiFilter,
  FiUser,
  FiMail,
  FiCalendar
} from 'react-icons/fi'
import OrderDetailsModal from '@/app/components/OrderDetailsModal'

export interface Order {
  id: string
  customer_name: string
  customer_email: string
  phone?: string
  address?: string
  city?: string
  notes?: string
  status: string
  total_price: number | string
  created_at: string
}

export interface OrderItem {
  id: string
  product_id: string
  quantity: number
  price: number
  products?: {
    name: string
    image_url?: string
  }
}

export default function OrdersPage() {
  const { loading: authLoading, isAdmin } = useAdminGuard()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // Modal State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [itemsLoading, setItemsLoading] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError(null)
      const { data, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      setOrders(data || [])
    } catch (err: unknown) {
      console.error('Error fetching orders:', err)
      const msg = err instanceof Error ? err.message : 'Failed to fetch orders.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const fetchOrderItems = async (orderId: string) => {
    try {
      setItemsLoading(true)
      const { data, error: fetchError } = await supabase
        .from('order_items')
        .select('*, products(name, image_url)')
        .eq('order_id', orderId)

      if (fetchError) throw fetchError
      setOrderItems(data || [])
    } catch (err: unknown) {
      console.error('Error fetching order items:', err)
    } finally {
      setItemsLoading(false)
    }
  }

  const handleViewDetails = async (order: Order) => {
    setSelectedOrder(order)
    await fetchOrderItems(order.id)
  }

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingId(orderId)
      const { error: updateError } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)

      if (updateError) throw updateError

      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
      
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null)
      }
    } catch (err: unknown) {
      console.error('Error updating status:', err)
      const msg = err instanceof Error ? err.message : 'Unknown error'
      alert(`Failed to update order status: ${msg}`)
    } finally {
      setUpdatingId(null)
    }
  }

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const query = searchQuery.toLowerCase().trim()
      const matchesSearch = 
        !query ||
        (order.id && order.id.toLowerCase().includes(query)) ||
        (order.customer_name && order.customer_name.toLowerCase().includes(query)) ||
        (order.customer_email && order.customer_email.toLowerCase().includes(query))

      const matchesStatus = filterStatus === 'all' || (order.status && order.status.toLowerCase() === filterStatus.toLowerCase())

      return matchesSearch && matchesStatus
    })
  }, [orders, searchQuery, filterStatus])

  // Summary Metrics
  const metrics = useMemo(() => {
    const totalCount = orders.length
    const pendingCount = orders.filter(o => o.status?.toLowerCase() === 'pending').length
    const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total_price) || 0), 0)
    return { totalCount, pendingCount, totalRevenue }
  }, [orders])

  const statuses = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled']

  if (authLoading || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#091540] flex items-center justify-center text-[#FFF9F2]">
        <div className="flex items-center gap-3 bg-[#0d1a45] border border-[#1e3073] px-6 py-4 rounded-2xl shadow-xl">
          <FiRefreshCw className="animate-spin text-[#F2842F]" size={20} />
          <span className="text-sm font-semibold">Checking access privileges...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#091540] text-[#FFF9F2] font-sans selection:bg-[#F2842F]/30 selection:text-[#FFF9F2]">
      {/* Sticky Header */}
      <header className="bg-[#0f1d4f]/90 backdrop-blur-md border-b border-[#1e3073] p-4 sm:p-6 sticky top-0 z-20 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <Link 
              href="/dashboard" 
              className="p-2 sm:p-2.5 text-[#FFF9F2]/70 hover:text-[#FFF9F2] hover:bg-[#15255e] rounded-xl transition border border-transparent hover:border-[#1e3073] shrink-0"
              title="Back to Dashboard"
            >
              <FiArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </Link>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-[#FFF9F2] truncate">
                Orders Management
              </h1>
              <p className="text-xs sm:text-sm text-[#FFF9F2]/60 hidden sm:block truncate">
                Track customer orders, fulfillment status, and order details
              </p>
            </div>
          </div>

          <button
            onClick={fetchOrders}
            disabled={loading}
            className="px-3 py-2 sm:px-4 sm:py-2.5 bg-[#0d1a45] hover:bg-[#15255e] text-[#FFF9F2]/90 hover:text-[#F2842F] border border-[#1e3073] rounded-xl transition shadow-sm flex items-center gap-2 text-xs sm:text-sm font-semibold shrink-0 disabled:opacity-50"
            title="Refresh Orders"
          >
            <FiRefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span className="hidden xs:inline">Refresh</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
        
        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-rose-950/60 border border-rose-700/50 rounded-2xl text-rose-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-md">
            <div className="flex items-center gap-3">
              <FiAlertCircle size={22} className="text-rose-400 shrink-0" />
              <span className="text-xs sm:text-sm">{error}</span>
            </div>
            <button 
              onClick={fetchOrders}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-800/60 hover:bg-rose-700 text-[#FFF9F2] text-xs font-semibold rounded-xl transition shrink-0"
            >
              <FiRefreshCw size={14} /> Retry
            </button>
          </div>
        )}

        {/* Quick Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5">
          <div className="bg-[#0d1a45]/80 backdrop-blur-sm rounded-2xl p-4 sm:p-5 border border-[#1e3073] shadow-sm hover:border-[#F2842F]/40 transition duration-200 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[#FFF9F2]/50 text-[10px] sm:text-xs font-bold uppercase tracking-wider">Total Orders</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-[#FFF9F2]">{metrics.totalCount}</p>
            </div>
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#F2842F]/10 border border-[#F2842F]/20 text-[#F2842F] flex items-center justify-center shrink-0">
              <FiShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>

          <div className="bg-[#0d1a45]/80 backdrop-blur-sm rounded-2xl p-4 sm:p-5 border border-[#1e3073] shadow-sm hover:border-amber-500/40 transition duration-200 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[#FFF9F2]/50 text-[10px] sm:text-xs font-bold uppercase tracking-wider">Pending Action</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-[#FFF9F2]">{metrics.pendingCount}</p>
            </div>
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <FiClock className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>

          <div className="bg-[#0d1a45]/80 backdrop-blur-sm rounded-2xl p-4 sm:p-5 border border-[#1e3073] shadow-sm hover:border-emerald-500/40 transition duration-200 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[#FFF9F2]/50 text-[10px] sm:text-xs font-bold uppercase tracking-wider">Total Revenue</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-[#FFF9F2]">
                ${metrics.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <FiCheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>
        </div>

        {/* Search Bar & Status Filters */}
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
          <div className="relative flex-1 max-w-lg">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#FFF9F2]/40" size={18} />
            <input
              type="text"
              placeholder="Search by customer, email, or order ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 sm:py-3 bg-[#0d1a45] border border-[#1e3073] rounded-xl text-[#FFF9F2] placeholder-[#FFF9F2]/40 text-xs sm:text-sm focus:outline-none focus:border-[#F2842F] focus:ring-1 focus:ring-[#F2842F] transition shadow-inner"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#FFF9F2]/40 hover:text-[#FFF9F2] p-1 rounded-md"
              >
                <FiX size={16} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
            <div className="flex items-center gap-1.5 min-w-max">
              <span className="text-xs text-[#FFF9F2]/40 mr-1 hidden xl:flex items-center gap-1">
                <FiFilter size={12} /> Filter:
              </span>
              {statuses.map((status) => {
                const isActive = filterStatus === status
                return (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition duration-150 flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-[#F2842F] text-[#FFF9F2] shadow-md shadow-[#F2842F]/20'
                        : 'bg-[#0d1a45] text-[#FFF9F2]/70 border border-[#1e3073] hover:text-[#FFF9F2] hover:border-[#1e3073]/80'
                    }`}
                  >
                    {status}
                    {status === 'all' && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-[#FFF9F2]/20 text-white' : 'bg-[#15255e] text-[#FFF9F2]/60'}`}>
                        {orders.length}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <SkeletonOrdersList />
        ) : filteredOrders.length === 0 ? (
          <EmptyOrdersState 
            hasOrders={orders.length > 0} 
            onClear={() => { setSearchQuery(''); setFilterStatus('all'); }} 
          />
        ) : (
          <>
            {/* Mobile & Tablet Card View */}
            <div className="block lg:hidden space-y-4">
              {filteredOrders.map((order) => {
                const price = Number(order.total_price) || 0
                const orderIdDisplay = order.id ? `#${order.id.slice(0, 8)}` : 'N/A'
                const formattedDate = formatDateSafely(order.created_at)

                return (
                  <div 
                    key={order.id} 
                    className="bg-[#0d1a45] border border-[#1e3073] rounded-2xl p-4 space-y-4 shadow-sm hover:border-[#1e3073]/90 transition"
                  >
                    <div className="flex items-center justify-between border-b border-[#1e3073]/60 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 bg-[#15255e] text-[#FFF9F2]/90 font-mono text-xs font-semibold rounded-lg border border-[#1e3073]">
                          {orderIdDisplay}
                        </span>
                        <span className="text-[11px] text-[#FFF9F2]/50 flex items-center gap-1">
                          <FiCalendar size={12} /> {formattedDate}
                        </span>
                      </div>

                      <button
                        onClick={() => handleViewDetails(order)}
                        className="px-3 py-1.5 bg-[#F2842F]/10 hover:bg-[#F2842F]/20 text-[#F2842F] border border-[#F2842F]/30 rounded-xl transition flex items-center gap-1.5 text-xs font-semibold"
                      >
                        <FiEye size={14} /> Details
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-2 text-xs">
                      <div className="flex items-center gap-2 text-[#FFF9F2]">
                        <FiUser className="text-[#F2842F] shrink-0" size={14} />
                        <span className="font-semibold">{order.customer_name || 'Guest Customer'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#FFF9F2]/60 truncate">
                        <FiMail className="shrink-0" size={14} />
                        <span className="truncate">{order.customer_email || 'No email provided'}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#1e3073]/60 gap-3">
                      <div>
                        <p className="text-[10px] uppercase text-[#FFF9F2]/40 font-bold">Total Amount</p>
                        <p className="text-lg font-bold text-[#FFF9F2]">${price.toFixed(2)}</p>
                      </div>

                      <div className="flex-1 max-w-[160px]">
                        <StatusSelect
                          status={order.status}
                          disabled={updatingId === order.id}
                          onChange={(newStatus) => handleUpdateStatus(order.id, newStatus)}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block bg-[#0d1a45] rounded-2xl border border-[#1e3073] overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#0f1d4f] border-b border-[#1e3073] text-[#FFF9F2]/60 text-xs font-bold uppercase tracking-wider">
                      <th className="py-4 px-6">Order ID</th>
                      <th className="py-4 px-6">Customer</th>
                      <th className="py-4 px-6">Email</th>
                      <th className="py-4 px-6">Amount</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6">Date</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e3073]/60 text-sm">
                    {filteredOrders.map((order) => {
                      const price = Number(order.total_price) || 0
                      const orderIdDisplay = order.id ? `#${order.id.slice(0, 8)}` : 'N/A'
                      const formattedDate = formatDateSafely(order.created_at)

                      return (
                        <tr key={order.id} className="hover:bg-[#13235b]/60 transition-colors group">
                          <td className="py-4 px-6 font-mono text-xs font-medium text-[#FFF9F2]/80">
                            {orderIdDisplay}
                          </td>
                          <td className="py-4 px-6 font-semibold text-[#FFF9F2]">
                            {order.customer_name || 'Guest Customer'}
                          </td>
                          <td className="py-4 px-6 text-[#FFF9F2]/70 text-xs">
                            {order.customer_email || 'N/A'}
                          </td>
                          <td className="py-4 px-6 font-bold text-[#FFF9F2]">
                            ${price.toFixed(2)}
                          </td>
                          <td className="py-4 px-6">
                            <StatusSelect
                              status={order.status}
                              disabled={updatingId === order.id}
                              onChange={(newStatus) => handleUpdateStatus(order.id, newStatus)}
                            />
                          </td>
                          <td className="py-4 px-6 text-[#FFF9F2]/60 text-xs whitespace-nowrap">
                            {formattedDate}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <button
                              onClick={() => handleViewDetails(order)}
                              className="px-3 py-1.5 bg-[#F2842F]/10 hover:bg-[#F2842F]/20 text-[#F2842F] border border-[#F2842F]/30 rounded-xl transition inline-flex items-center gap-1.5 text-xs font-semibold"
                            >
                              <FiEye size={15} />
                              <span>Details</span>
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          orderItems={orderItems}
          loading={itemsLoading}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  )
}

function StatusSelect({ 
  status, 
  disabled, 
  onChange 
}: { 
  status?: string
  disabled?: boolean
  onChange: (val: string) => void 
}) {
  const normalizedStatus = status?.toLowerCase() || 'pending'

  return (
    <div className="relative w-full">
      <select
        value={normalizedStatus}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Update order status"
        className={`w-full appearance-none px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer border border-[#1e3073] focus:outline-none focus:ring-1 focus:ring-[#F2842F] transition disabled:opacity-50 ${getStatusSelectStyle(normalizedStatus)}`}
      >
        <option value="pending" className="bg-[#0d1a45] text-amber-200 font-semibold">Pending</option>
        <option value="processing" className="bg-[#0d1a45] text-blue-200 font-semibold">Processing</option>
        <option value="shipped" className="bg-[#0d1a45] text-purple-200 font-semibold">Shipped</option>
        <option value="delivered" className="bg-[#0d1a45] text-emerald-200 font-semibold">Delivered</option>
        <option value="cancelled" className="bg-[#0d1a45] text-rose-200 font-semibold">Cancelled</option>
      </select>
    </div>
  )
}

function SkeletonOrdersList() {
  return (
    <div className="space-y-4">
      <div className="block lg:hidden space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-[#0d1a45] border border-[#1e3073] rounded-2xl p-4 space-y-3 animate-pulse">
            <div className="h-4 bg-[#15255e] rounded w-1/3"></div>
            <div className="h-3 bg-[#15255e] rounded w-2/3"></div>
            <div className="h-8 bg-[#15255e] rounded w-full"></div>
          </div>
        ))}
      </div>

      <div className="hidden lg:block bg-[#0d1a45] rounded-2xl border border-[#1e3073] p-6 space-y-4 animate-pulse">
        <div className="h-6 bg-[#15255e] rounded w-1/4"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 bg-[#15255e]/60 rounded-xl w-full"></div>
          ))}
        </div>
      </div>
    </div>
  )
}

function EmptyOrdersState({ hasOrders, onClear }: { hasOrders: boolean; onClear: () => void }) {
  return (
    <div className="text-center py-16 px-6 bg-[#0d1a45] rounded-2xl border border-[#1e3073] max-w-md mx-auto shadow-lg">
      <div className="w-16 h-16 rounded-2xl bg-[#15255e] text-[#F2842F] flex items-center justify-center mx-auto mb-4 border border-[#1e3073]">
        <FiShoppingBag size={28} />
      </div>
      <h3 className="text-lg font-bold text-[#FFF9F2] mb-1">
        {hasOrders ? 'No matching orders found' : 'No orders logged yet'}
      </h3>
      <p className="text-xs sm:text-sm text-[#FFF9F2]/60 mb-6">
        {hasOrders 
          ? 'Try adjusting your search terms or status filter.'
          : 'Orders placed by store visitors will appear here automatically.'}
      </p>
      {hasOrders && (
        <button
          onClick={onClear}
          className="px-4 py-2 bg-[#F2842F] hover:bg-[#d97223] text-[#FFF9F2] font-semibold rounded-xl text-xs transition shadow-md"
        >
          Reset Filters
        </button>
      )}
    </div>
  )
}

function formatDateSafely(dateString?: string) {
  if (!dateString) return 'N/A'
  try {
    const d = new Date(dateString)
    return isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  } catch {
    return 'N/A'
  }
}

function getStatusSelectStyle(status?: string) {
  switch (status?.toLowerCase()) {
    case 'pending':
      return 'bg-amber-500/15 text-amber-300 border-amber-500/30'
    case 'processing':
      return 'bg-blue-500/15 text-blue-300 border-blue-500/30'
    case 'shipped':
      return 'bg-purple-500/15 text-purple-300 border-purple-500/30'
    case 'delivered':
      return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
    case 'cancelled':
    case 'canceled':
      return 'bg-rose-500/15 text-rose-300 border-rose-500/30'
    default:
      return 'bg-slate-500/15 text-slate-300 border-slate-500/30'
  }
}