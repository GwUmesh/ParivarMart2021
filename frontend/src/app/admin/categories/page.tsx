"use client";

import React, { useEffect, useState } from 'react';
import { 
  Tags, 
  Plus, 
  Edit, 
  Trash2, 
  Image as ImageIcon,
  Loader2,
  X
} from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { getImageUrl } from '@/lib/utils';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', description: '', image: '' });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (error) {
      console.error('Failed to fetch categories', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (category: any = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({ name: category.name, description: category.description || '', image: category.image || '' });
    } else {
      setEditingCategory(null);
      setFormData({ name: '', description: '', image: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Auto-generate slug from name
      const slug = formData.name.toLowerCase().trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      const payload = { ...formData, slug };

      if (editingCategory) {
        await api.patch(`/categories/${editingCategory._id}`, payload);
        toast.success('Category updated');
      } else {
        await api.post('/categories', payload);
        toast.success('Category created');
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (error: any) {
      toast.error(error.message || 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this category? This might affect products linked to it.')) return;
    try {
      await api.delete(`/categories/${id}`);
      toast.success('Category deleted');
      fetchCategories();
    } catch (error: any) {
      toast.error(error.message || 'Deletion failed');
    }
  };

  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl font-black text-dark">Category <span className="text-primary">Management</span></h1>
          <p className="text-gray-500">Organize your products into accessible groups.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="btn-primary py-4 px-8 flex items-center gap-2 shadow-xl shadow-primary/20"
        >
          <Plus size={20} /> Create Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading && categories.length === 0 ? (
          [...Array(3)].map((_, i) => <div key={i} className="h-48 bg-gray-100 animate-pulse rounded-3xl" />)
        ) : categories.map((cat: any) => (
          <motion.div 
            layout
            key={cat._id}
            className="card p-6 bg-white flex flex-col gap-6 relative group overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 group-hover:bg-primary/10 transition-colors" />
            
            <div className="flex items-start justify-between relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100 overflow-hidden shadow-inner">
                 {cat.image ? (
                   <img src={getImageUrl(cat.image)} alt={cat.name} className="w-full h-full object-cover" />
                 ) : (
                   <ImageIcon size={24} className="text-gray-300" />
                 )}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleOpenModal(cat)} className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-all">
                  <Edit size={18} />
                </button>
                <button onClick={() => handleDelete(cat._id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <div className="relative z-10">
              <h3 className="text-xl font-bold text-dark mb-1">{cat.name}</h3>
              <p className="text-sm text-gray-500 line-clamp-2">{cat.description || 'No description provided.'}</p>
            </div>
            
            <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between relative z-10">
               <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/5 px-2 py-0.5 rounded">Category ID: {cat._id.slice(-6)}</span>
               <button onClick={() => window.location.href = `/products?category=${cat._id}`} className="text-xs font-bold text-gray-400 hover:text-primary inline-flex items-center gap-1">
                 View Products <Plus size={12} />
               </button>
            </div>
          </motion.div>
        ))}
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
              className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden relative z-10"
            >
              <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-primary/5">
                <h3 className="text-2xl font-black text-dark">{editingCategory ? 'Edit' : 'Create'} <span className="text-primary">Category</span></h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-6">
                 <div className="flex flex-col gap-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Category Name</label>
                    <input 
                      required
                      className="input-field" 
                      placeholder="e.g. Oils & Ghee"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                 </div>
                 <div className="flex flex-col gap-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Description</label>
                    <textarea 
                      rows={3}
                      className="input-field resize-none" 
                      placeholder="Brief overview of items in this group..."
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                    />
                 </div>
                 <div className="flex flex-col gap-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Image URL</label>
                    <input 
                      className="input-field" 
                      placeholder="https://images.unsplash.com/..."
                      value={formData.image}
                      onChange={e => setFormData({ ...formData, image: e.target.value })}
                    />
                 </div>
                 <button 
                   disabled={loading}
                   type="submit" 
                   className="btn-primary py-4 text-lg font-bold shadow-xl shadow-primary/20 mt-2"
                 >
                   {loading ? <Loader2 className="animate-spin mx-auto" /> : (editingCategory ? 'Update Category' : 'Create Category')}
                 </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
