'use client'

import { FiX } from 'react-icons/fi'

interface Order {
  id: string
  customer_name: string
  customer_email: string
  phone?: string | null
  address?: string | null
  city?: string | null
  notes?: string | null
  status: string
  total_price: number | string
  created_at: string
}

interface OrderItem {
  id: string
  product_id: string
  quantity: number
  price: number
  products?: {
    name: string
  }
}

interface OrderDetailsModalProps {
  order: Order
  orderItems: OrderItem[]
  loading: boolean
  onClose: () => void
}

export default function OrderDetailsModal({ order, orderItems, loading, onClose }: OrderDetailsModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-700 sticky top-0 bg-gray-800">
          <div>
            <h2 className="text-xl font-bold">Order Details</h2>
            <p className="text-sm text-gray-400 mt-1">ID: {order.id}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Customer Info */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="font-semibold mb-3">Customer Information</h3>
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-400">Name:</span> {order.customer_name}</p>
              <p><span className="text-gray-400">Email:</span> {order.customer_email}</p>
              <p><span className="text-gray-400">Order Date:</span> {new Date(order.created_at).toLocaleDateString()}</p>
              <p>
                <span className="text-gray-400">Status:</span>
                <span className={`ml-2 px-2 py-1 rounded capitalize ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </p>
            </div>
          </div>

          {/* Delivery Details */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="font-semibold mb-3">Delivery Details</h3>
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-400">Phone:</span> {order.phone || '—'}</p>
              <p><span className="text-gray-400">Address:</span> {order.address || '—'}</p>
              <p><span className="text-gray-400">City:</span> {order.city || '—'}</p>
              {order.notes && (
                <p><span className="text-gray-400">Notes:</span> {order.notes}</p>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="font-semibold mb-3">Items</h3>
            <div className="space-y-2">
              {loading ? (
                <p className="text-gray-400 text-sm">Loading items...</p>
              ) : orderItems.length === 0 ? (
                <p className="text-gray-400 text-sm">No items in this order</p>
              ) : (
                orderItems.map(item => (
                  <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-600 last:border-0">
                    <div>
                      <p className="font-semibold">{item.products?.name || 'Unknown Product'}</p>
                      <p className="text-sm text-gray-400">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold">${parseFloat(item.price.toString()).toFixed(2)}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Total */}
          <div className="bg-blue-600/20 border border-blue-600 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total Amount:</span>
              <span className="text-2xl font-bold text-blue-400">${parseFloat(order.total_price.toString()).toFixed(2)}</span>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

function getStatusColor(status: string) {
  switch (status) {
    case 'pending':
      return 'bg-yellow-600/20 text-yellow-400'
    case 'processing':
      return 'bg-blue-600/20 text-blue-400'
    case 'shipped':
      return 'bg-purple-600/20 text-purple-400'
    case 'delivered':
      return 'bg-green-600/20 text-green-400'
    case 'cancelled':
      return 'bg-red-600/20 text-red-400'
    default:
      return 'bg-gray-600/20 text-gray-400'
  }
}