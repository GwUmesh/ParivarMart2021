"use client";

import React, { useEffect, useState } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Tag, 
  Calendar, 
  CheckCircle2, 
  XCircle,
  X,
  Loader2,
  Gift,
  ArrowRight
} from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminPromocodes() {
  const [promocodes, setPromocodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<any>(null);
  const [formData, setFormData] = useState({ 
    code: '', 
    value: 0, 
    discountType: 'flat', 
    expiryDate: '',
    minOrder: 0,
    isActive: true 
  });

  useEffect(() => {
    fetchPromocodes();
  }, []);

  const fetchPromocodes = async () => {
    try {
      setLoading(true);
      const res = await api.get('/promocodes');
      setPromocodes(res.data);
    } catch (error) {
      console.error('Failed to fetch promocodes', error);
      toast.error('Failed to load promocodes');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (code: any = null) => {
    if (code) {
      setEditingCode(code);
      setFormData({ 
        code: code.code, 
        value: code.value, 
        discountType: code.discountType || 'flat', 
        expiryDate: code.expiryDate ? new Date(code.expiryDate).toISOString().split('T')[0] : '',
        minOrder: code.minOrder || 0,
        isActive: code.isActive ?? true 
      });
    } else {
      setEditingCode(null);
      setFormData({ 
        code: '', 
        value: 0, 
        discountType: 'flat', 
        expiryDate: '',
        minOrder: 0,
        isActive: true 
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editingCode) {
        await api.put(`/promocodes/${editingCode._id}`, formData);
        toast.success('Promocode updated');
      } else {
        await api.post('/promocodes', formData);
        toast.success('Promocode created');
      }
      setIsModalOpen(false);
      fetchPromocodes();
    } catch (error: any) {
      toast.error(error.message || 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this promo code?')) return;
    try {
      await api.delete(`/promocodes/${id}`);
      toast.success('Deleted successfully');
      fetchPromocodes();
    } catch (error) {
      toast.error('Deletion failed');
    }
  };

  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl font-black text-dark">Promo <span className="text-primary">Codes</span></h1>
          <p className="text-gray-500">Create discount codes to boost your store sales.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="btn-primary py-4 px-8 flex items-center gap-2 shadow-xl shadow-primary/20"
        >
          <Plus size={20} /> Create Code
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading && promocodes.length === 0 ? (
          [...Array(3)].map((_, i) => <div key={i} className="h-48 bg-gray-100 animate-pulse rounded-3xl" />)
        ) : promocodes.length > 0 ? (
          promocodes.map((code: any) => (
            <motion.div 
              layout
              key={code._id}
              className={`card p-8 flex flex-col gap-6 relative group border-2 ${code.isActive ? 'border-primary/5 bg-white' : 'border-gray-100 bg-gray-50 opacity-70'}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-1">
                   <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary mb-1">
                     <Tag size={12} /> {code.discountType === 'percentage' ? 'Percentage Off' : 'Fixed Amount'}
                   </div>
                   <h3 className="text-3xl font-black text-dark tracking-tighter">{code.code}</h3>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleOpenModal(code)} className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-all">
                    <Edit size={18} />
                  </button>
                  <button onClick={() => handleDelete(code._id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4 py-4 border-y border-gray-50 my-2">
                 <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Discount</span>
                    <span className="text-2xl font-black text-primary">{code.discountType === 'percentage' ? `${code.value}%` : `₹${code.value}`}</span>
                 </div>
                 <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Min Spend</span>
                    <span className="text-xl font-bold text-dark">₹{code.minOrder || 0}</span>
                 </div>
                 <div className="w-px h-8 bg-gray-100 mx-2" />
                 <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Used</span>
                    <span className="text-xl font-bold text-primary">{code.usedCount || 0}</span>
                 </div>
              </div>

              <div className="flex items-center justify-between mt-auto">
                 <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                   <Calendar size={14} />
                   Exp: {code.expiryDate ? new Date(code.expiryDate).toLocaleDateString() : 'Never'}
                 </div>
                 <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${code.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                   {code.isActive ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                   {code.isActive ? 'Active' : 'Inactive'}
                 </div>
              </div>

              {!code.isActive && <div className="absolute inset-0 bg-white/40 pointer-events-none" />}
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-32 flex flex-col items-center gap-6 grayscale opacity-20 text-center">
            <Gift size={80} />
            <h3 className="text-3xl font-black italic">No Promo Codes</h3>
            <p className="text-gray-500 max-w-xs uppercase tracking-tighter text-sm font-bold">Start your first marketing campaign by creating a discount code!</p>
            <button onClick={() => handleOpenModal()} className="btn-primary mt-4 py-3">Create First Code</button>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-dark/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden relative z-10"
            >
              <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-primary/5">
                <h3 className="text-2xl font-black text-dark">{editingCode ? 'Update' : 'Generate'} <span className="text-primary">Promo Code</span></h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-6">
                 <div className="grid sm:grid-cols-2 gap-6">
                   <div className="flex flex-col gap-2 col-span-2">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-400">Code String</label>
                      <input 
                        required
                        className="input-field font-black tracking-widest uppercase text-xl" 
                        placeholder="e.g. SAVE50"
                        value={formData.code}
                        onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      />
                   </div>
                   
                   <div className="flex flex-col gap-2">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-400">Discount Value</label>
                      <input 
                        type="number"
                        className="input-field" 
                        value={formData.value}
                        onChange={e => setFormData({ ...formData, value: Number(e.target.value) })}
                      />
                   </div>

                   <div className="flex flex-col gap-2">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-400">Discount Type</label>
                      <select 
                        className="input-field" 
                        value={formData.discountType}
                        onChange={e => setFormData({ ...formData, discountType: e.target.value })}
                      >
                        <option value="flat">Fixed Amount (₹)</option>
                        <option value="percentage">Percentage (%)</option>
                      </select>
                   </div>

                   <div className="flex flex-col gap-2">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-400">Expiry Date</label>
                      <input 
                        type="date"
                        className="input-field" 
                        value={formData.expiryDate}
                        onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                      />
                   </div>

                   <div className="flex flex-col gap-2">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-400">Min Order Value (₹)</label>
                      <input 
                        type="number"
                        className="input-field" 
                        value={formData.minOrder}
                        onChange={e => setFormData({ ...formData, minOrder: Number(e.target.value) })}
                      />
                   </div>
                 </div>

                 <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                    <input 
                      type="checkbox" 
                      id="isActive"
                      className="w-5 h-5 accent-primary"
                      checked={formData.isActive}
                      onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                    />
                    <label htmlFor="isActive" className="font-bold text-dark">Currently Active</label>
                 </div>

                 <button 
                   disabled={loading}
                   type="submit" 
                   className="btn-primary py-4 text-lg font-bold shadow-xl shadow-primary/20 mt-2 flex items-center justify-center gap-2"
                 >
                   {loading ? <Loader2 className="animate-spin" /> : (editingCode ? 'Save Changes' : 'Create Promo Code')}
                   {!loading && <ArrowRight size={20} />}
                 </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
