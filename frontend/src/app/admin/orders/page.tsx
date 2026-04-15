"use client";

import React, { useEffect, useState } from 'react';
import { 
  ShoppingCart, 
  Search, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Truck, 
  MoreVertical,
  Eye,
  FileText,
  Filter,
  Package,
  ArrowRight
} from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, search]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/orders?status=${statusFilter}&search=${search}&limit=50`);
      setOrders(res.data.orders);
    } catch (error) {
      console.error('Failed to fetch admin orders', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (id: string, newStatus: string) => {
    try {
      await api.put(`/orders/${id}/status`, { status: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
      fetchOrders();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status');
    }
  };

  const deleteOrder = async (id: string) => {
    if (!window.confirm('Delete this order? This action cannot be undone.')) return;
    try {
      await api.delete(`/orders/${id}`);
      toast.success('Order deleted');
      fetchOrders();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete order');
    }
  };

  const viewInvoice = (orderId: string) => {
    const token = localStorage.getItem('pm_token');
    const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/orders/${orderId}/invoice?token=${token}`;
    window.open(url, '_blank');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-600 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-600 border-red-200';
      case 'processing': return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'dispatched': return 'bg-purple-100 text-purple-600 border-purple-200';
      default: return 'bg-yellow-100 text-yellow-600 border-yellow-200';
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl font-black text-dark">Order <span className="text-primary">Management</span></h1>
          <p className="text-gray-500">Track and fulfill customer orders.</p>
        </div>
        <div className="flex items-center gap-2">
           <div className="bg-emerald-100 border border-emerald-200 px-4 py-2 rounded-xl flex items-center gap-2 text-emerald-700 font-bold text-sm">
             <div className="w-2 h-2 rounded-full bg-emerald-500" />
             {orders.filter((o: any) => o.status === 'delivered').length} Completed
           </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-6 bg-white flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by Order ID, Invoice ID, or Customer..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-12"
          />
        </div>
        <select 
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="input-field md:w-64"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="dispatched">Dispatched</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button className="p-3 border rounded-xl hover:bg-gray-50 text-gray-500">
          <Filter size={20} />
        </button>
      </div>

      {/* Orders List */}
      <div className="flex flex-col gap-4">
        {loading ? (
          [...Array(3)].map((_, i) => <div key={i} className="h-40 bg-gray-100 animate-pulse rounded-3xl" />)
        ) : orders.length > 0 ? (
          orders.map((order: any) => (
            <motion.div 
              layout
              key={order._id}
              className="card bg-white p-6 sm:p-8 flex flex-col gap-6 group hover:border-primary/20 transition-all border-l-8 border-l-primary/5"
            >
              <div className="flex flex-wrap items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                   <div className="w-16 h-16 rounded-2xl bg-gray-50 flex flex-col items-center justify-center border border-gray-100">
                      <Clock size={24} className="text-gray-300" />
                      <span className="text-[10px] font-black uppercase tracking-tighter text-gray-400 mt-1">{new Date(order.createdAt).getDate()} {new Date(order.createdAt).toLocaleString('default', { month: 'short' })}</span>
                   </div>
                   <div>
                      <div className="flex items-center gap-2 mb-1">
                         <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded italic">{order.invoiceId}</span>
                         <span className="text-xs text-gray-400 font-bold">#{order._id.slice(-6).toUpperCase()}</span>
                      </div>
                      <h3 className="text-xl font-bold text-dark">{order.address?.fullName || order.user?.name || 'Guest'}</h3>
                      <p className="text-sm text-gray-500 italic max-w-sm truncate">{order.address?.addressLine1}, {order.address?.city}</p>
                   </div>
                </div>

                <div className="flex flex-wrap items-center gap-8 ml-auto">
                   <div className="flex flex-col items-end">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Amount</p>
                      <p className="text-2xl font-black text-primary">₹{(order.totalAmount || order.total || 0).toFixed(2)}</p>
                   </div>
                   
                   <div className="flex flex-col gap-2">
                       <select 
                         value={order.status}
                         onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                         className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border-2 outline-none cursor-pointer transition-all ${getStatusColor(order.status)}`}
                       >
                         <option value="pending">Pending</option>
                         <option value="processing">Processing</option>
                         <option value="dispatched">Dispatched</option>
                         <option value="delivered">Delivered</option>
                         <option value="cancelled">Cancelled</option>
                       </select>
                   </div>

                   <div className="flex items-center gap-2">
                      <button 
                        onClick={() => viewInvoice(order._id)}
                        title="View Invoice"
                        className="p-3 bg-gray-50 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
                      >
                        <FileText size={20} />
                      </button>
                      <button 
                        onClick={() => deleteOrder(order._id)}
                        title="Delete Order"
                        className="p-3 bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <XCircle size={20} />
                      </button>
                   </div>
                </div>
              </div>

              {/* Items Summary Preview */}
              <div className="flex items-center gap-8 pt-4 border-t border-gray-50">
                 <div className="flex flex-1 items-center gap-4 overflow-x-auto pb-1 no-scrollbar">
                    {order.items.map((item: any, i: number) => (
                      <div key={i} className="flex items-center gap-2 pr-4 border-r border-gray-100 last:border-0 shrink-0">
                         <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-400 italic">
                           {item.quantity}x
                         </div>
                         <span className="text-xs font-bold text-gray-600">{item.name}</span>
                      </div>
                    ))}
                 </div>
                 <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full">
                    <Package size={14} className="text-primary" />
                    {order.deliveryType === 'home_delivery' ? 'Home Delivery' : 'Store Pickup'}
                 </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="py-32 flex flex-col items-center gap-6 grayscale opacity-20 text-center">
            <ShoppingCart size={80} />
            <h3 className="text-3xl font-black italic">No orders found</h3>
            <p className="text-gray-500 max-w-xs uppercase tracking-tighter text-sm font-bold">Try changing your filters or searching for something else.</p>
          </div>
        )}
      </div>
    </div>
  );
}
