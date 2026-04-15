"use client";

import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  ShoppingCart, 
  Users, 
  Package, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  CheckCircle2,
  XCircle,
  Settings
} from 'lucide-react';
import api from '@/lib/api';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // We'll create a single dashboard stats endpoint in Agent 4, 
        // for now we'll fetch individual parts
        const [ordersRes] = await Promise.all([
          api.get('/orders?limit=5')
        ]);
        
        setRecentOrders(ordersRes.data.orders);
        
        // Mock stats for now until backend is enhanced
        setStats({
          revenue: 125400,
          orders: 450,
          customers: 1200,
          products: 85
        });
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const statCards = [
    { label: 'Total Revenue', value: stats ? `₹${stats.revenue.toLocaleString()}` : '...', icon: <TrendingUp size={24} />, color: 'bg-blue-500', trend: '+12.5%' },
    { label: 'Total Orders', value: stats ? stats.orders : '...', icon: <ShoppingCart size={24} />, color: 'bg-emerald-500', trend: '+8.2%' },
    { label: 'Total Customers', value: stats ? stats.customers : '...', icon: <Users size={24} />, color: 'bg-orange-500', trend: '+5.4%' },
    { label: 'Total Products', value: stats ? stats.products : '...', icon: <Package size={24} />, color: 'bg-purple-500', trend: 'In stock' },
  ];

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black text-dark">Dashboard <span className="text-primary">Overview</span></h1>
        <p className="text-gray-500">Welcome to the Parivar Mart admin panel.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <motion.div 
            key={i}
            whileHover={{ y: -5 }}
            className="card p-6 flex flex-col gap-4 bg-white"
          >
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-2xl text-white ${stat.color} shadow-lg`}>
                {stat.icon}
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold ${stat.trend.startsWith('+') ? 'text-green-500' : 'text-gray-400'}`}>
                {stat.trend} {stat.trend.startsWith('+') && <ArrowUpRight size={14} />}
              </div>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-3xl font-black text-dark mt-1">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="card bg-white p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-dark">Recent Orders</h2>
              <button className="text-primary font-bold text-sm hover:underline">View All Orders</button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-50 text-xs font-bold text-gray-400 uppercase tracking-widest">
                    <th className="pb-4">Order ID</th>
                    <th className="pb-4">Customer</th>
                    <th className="pb-4">Total</th>
                    <th className="pb-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentOrders.map((order: any) => (
                    <tr key={order._id} className="group hover:bg-gray-50 transition-colors">
                      <td className="py-4 font-bold text-dark text-sm">#{order._id.slice(-6)}</td>
                      <td className="py-4 text-sm text-gray-600">{order.address?.fullName || order.user?.name || 'Guest'}</td>
                      <td className="py-4 font-bold text-primary">₹{(order.totalAmount || order.total || 0).toFixed(2)}</td>
                      <td className="py-4">
                        <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-600' :
                          'bg-yellow-100 text-yellow-600'
                        }`}>
                          {order.status}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {recentOrders.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-10 text-center text-gray-400 italic">No orders found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Quick Actions / Status */}
        <div className="flex flex-col gap-6">
          <div className="card p-8 bg-dark text-white">
            <h2 className="text-2xl font-bold mb-6">Store Status</h2>
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                  <span className="font-bold">Online Store</span>
                </div>
                <button className="text-[10px] font-bold uppercase tracking-widest text-primary">Open</button>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Usage (Monthly)</span>
                  <span>75%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-3/4 rounded-full shadow-[0_0_10px_rgba(15,194,192,0.5)]" />
                </div>
              </div>
            </div>
          </div>

          <div className="card p-8 bg-white border border-primary/10">
            <h2 className="text-xl font-bold text-dark mb-6">Quick Links</h2>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => window.location.href = '/admin/products'}
                className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 font-bold text-gray-600 hover:border-primary hover:text-primary transition-all group"
              >
                <PlusIcon className="text-primary group-hover:rotate-90 transition-transform" size={18} /> Add New Product
              </button>
              <button 
                onClick={() => window.location.href = '/admin/settings'}
                className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 font-bold text-gray-600 hover:border-primary hover:text-primary transition-all"
              >
                <Settings size={18} /> Update Pricing
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlusIcon({ className, size }: { className?: string, size?: number }) {
  return (
    <svg 
      className={className} 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  );
}
