"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { 
  User, 
  MapPin, 
  Package, 
  Settings, 
  LogOut, 
  ExternalLink, 
  Clock, 
  CheckCircle2, 
  XCircle,
  ChevronRight,
  Plus,
  FileText,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getImageUrl } from '@/lib/utils';

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, logout, loading: authLoading, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Check for success redirect (e.g. from checkout)
  const newOrderId = searchParams.get('order');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders/my-orders');
        setOrders(res.data);
      } catch (error) {
        console.error('Failed to fetch orders', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchOrders();
    if (newOrderId) setActiveTab('orders');
  }, [user, authLoading, newOrderId]);

  const viewInvoice = (orderId: string) => {
    const token = localStorage.getItem('pm_token');
    const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/orders/${orderId}/invoice?token=${token}`;
    window.open(url, '_blank');
  };

  const deleteAddress = async (addressId: string) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    try {
      const res = await api.delete(`/users/address/${addressId}`);
      toast.success('Address deleted successfully');
      if (user) {
        updateUser({ ...user, addresses: res.data });
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete address');
    }
  };

  if (authLoading) return <div className="py-20 text-center font-bold text-primary">Loading profile...</div>;
  if (!user) return null;

  const tabs = [
    { id: 'orders', label: 'My Orders', icon: <Package size={20} /> },
    { id: 'addresses', label: 'My Addresses', icon: <MapPin size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Sidebar */}
        <aside className="w-full lg:w-80 flex flex-col gap-8">
          <div className="card p-8 flex flex-col items-center text-center gap-4 bg-gradient-to-b from-primary/5 to-white border-primary/10">
            <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-white text-4xl font-black shadow-xl">
              {user.name[0]}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-dark">{user.name}</h1>
              <p className="text-gray-500">{user.email}</p>
            </div>
            {user.role === 'admin' && (
               <button 
                 onClick={() => router.push('/admin/dashboard')}
                 className="flex items-center gap-2 text-primary font-bold text-sm bg-primary/10 px-4 py-2 rounded-full hover:bg-primary hover:text-white transition-all underline decoration-primary/20"
               >
                 Admin Dashboard <ExternalLink size={14} />
               </button>
            )}
          </div>

          <div className="flex flex-col gap-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-4 p-4 rounded-2xl font-bold transition-all ${activeTab === tab.id ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-gray-500 hover:bg-primary/5 hover:text-primary'}`}
              >
                {tab.icon}
                {tab.label}
                <ChevronRight size={16} className={`ml-auto transition-transform ${activeTab === tab.id ? 'rotate-90' : ''}`} />
              </button>
            ))}
            <button
              onClick={logout}
              className="flex items-center gap-4 p-4 rounded-2xl font-bold text-red-400 hover:bg-red-50 transition-all mt-4"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <AnimatePresence mode="wait">
            {activeTab === 'orders' && (
              <motion.div 
                key="orders"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-6"
              >
                <h2 className="text-3xl font-black text-dark mb-4">My <span className="text-primary">Orders</span></h2>
                
                {loading ? (
                  [...Array(3)].map((_, i) => <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-2xl" />)
                ) : orders.length > 0 ? (
                  <div className="flex flex-col gap-4">
                    {orders.map((order: any) => (
                      <div key={order._id} className={`card p-6 flex flex-col gap-4 border-2 ${order._id === newOrderId ? 'border-primary ring-4 ring-primary/10 shadow-xl' : 'border-primary/5'}`}>
                         <div className="flex flex-wrap items-center justify-between gap-4">
                            <div>
                               <p className="text-xs font-bold text-primary uppercase tracking-widest border border-primary/20 px-2 py-0.5 rounded-md inline-block mb-1">{order.invoiceId}</p>
                               <h3 className="font-bold text-dark text-lg">Order #{order._id.slice(-6)}</h3>
                               <p className="text-sm text-gray-400 flex items-center gap-1"><Clock size={14} /> {new Date(order.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                               <p className="font-black text-2xl text-primary">₹{(order.totalAmount || order.total || 0).toFixed(2)}</p>
                               <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                 order.status === 'delivered' ? 'bg-green-100 text-green-600' :
                                 order.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                                 'bg-yellow-100 text-yellow-600'
                               }`}>
                                 {order.status}
                               </div>
                               <button 
                                 onClick={() => viewInvoice(order._id)}
                                 className="flex items-center gap-1 text-[10px] font-bold text-primary hover:underline mt-2 p-1 bg-primary/5 rounded border border-primary/10 transition-all hover:bg-primary/10"
                               >
                                 <FileText size={12} /> View Invoice
                               </button>
                            </div>
                         </div>
                         <div className="flex items-center gap-2 overflow-x-auto pb-2">
                           {order.items.slice(0, 4).map((item: any, i: number) => (
                             <div key={i} className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-400 shrink-0 overflow-hidden">
                               {item.product?.images?.[0] ? (
                                 <img src={getImageUrl(item.product.images[0])} alt="" className="w-full h-full object-cover" />
                               ) : (
                                 <span>{item.quantity}x</span>
                               )}
                             </div>
                           ))}
                           {order.items.length > 4 && <span className="text-xs text-gray-400 font-bold">+{order.items.length - 4} more</span>}
                         </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 flex flex-col items-center gap-4 text-center grayscale opacity-50">
                    <Package size={64} />
                    <p className="text-xl font-bold">No orders yet</p>
                    <button onClick={() => router.push('/products')} className="btn-primary mt-4">Start Shopping</button>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'addresses' && (
              <motion.div 
                key="addresses"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-3xl font-black text-dark">My <span className="text-primary">Addresses</span></h2>
                  <button onClick={() => router.push('/checkout')} className="btn-primary flex items-center gap-2 py-2 text-sm"><Plus size={16} /> New Address</button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {user.addresses?.map((addr: any) => (
                    <div key={addr._id} className="card p-6 border-primary/10 relative group hover:border-primary transition-all">
                       <div className="flex items-center gap-2 mb-4">
                         <MapPin size={24} className="text-primary" />
                         <span className="font-bold text-dark">{addr.label || 'Home'}</span>
                       </div>
                       <p className="font-bold text-dark">{addr.fullName}</p>
                       <p className="text-sm text-gray-500 mt-1">{addr.addressLine1}</p>
                       <p className="text-sm text-gray-500">{addr.city}, {addr.state} - {addr.pincode}</p>
                       <p className="text-sm text-dark font-bold mt-4">{addr.phone}</p>
                       <button 
                         onClick={() => deleteAddress(addr._id)}
                         className="absolute top-6 right-6 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        >
                         <Trash2 size={18} />
                       </button>
                    </div>
                  ))}
                  {(!user.addresses || user.addresses.length === 0) && (
                    <div className="md:col-span-2 text-center py-20 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-100 text-gray-400">
                      <p>You haven't saved any addresses yet.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div 
                key="settings"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-8"
              >
                <h2 className="text-3xl font-black text-dark mb-4">Account <span className="text-primary">Settings</span></h2>
                
                <div className="card p-8 flex flex-col gap-6">
                   <div className="grid md:grid-cols-2 gap-6">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Full Name</label>
                        <input className="input-field" defaultValue={user.name} />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Email Address</label>
                        <input className="input-field bg-gray-50" defaultValue={user.email} disabled />
                      </div>
                   </div>
                   <button className="btn-primary w-fit px-8 mt-4">Update Profile</button>
                </div>

                <div className="card p-8 border-red-100 flex flex-col gap-6">
                   <h3 className="text-xl font-bold text-red-500 uppercase tracking-tighter">Security</h3>
                   <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Change Password</label>
                        <input className="input-field" type="password" placeholder="New Password" />
                   </div>
                   <button className="px-8 py-3 bg-red-50 text-red-500 font-bold rounded-xl border border-red-100 hover:bg-red-500 hover:text-white transition-all w-fit">Update Password</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-20 text-center">Loading profile...</div>}>
      <ProfileContent />
    </Suspense>
  );
}
