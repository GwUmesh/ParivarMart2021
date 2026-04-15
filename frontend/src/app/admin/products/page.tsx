"use client";

import React, { useEffect, useState } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  ExternalLink,
  Filter,
  MoreVertical,
  CheckCircle,
  XCircle
} from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { getImageUrl } from '@/lib/utils';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchData();
  }, [category, search]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        api.get(`/products?limit=100&search=${search}&category=${category}`),
        api.get('/categories')
      ]);
      setProducts(prodRes.data.products);
      setCategories(catRes.data);
    } catch (error) {
      console.error('Failed to fetch admin products', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted successfully');
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete product');
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl font-black text-dark">Inventory <span className="text-primary">Management</span></h1>
          <p className="text-gray-500">Manage your product catalog and stock levels.</p>
        </div>
        <button 
          onClick={() => window.location.href = '/admin/products/new'}
          className="btn-primary py-4 px-8 flex items-center justify-center gap-2 shadow-xl shadow-primary/20"
        >
          <Plus size={20} /> Add New Product
        </button>
      </div>

      {/* Filters & Actions */}
      <div className="card p-6 bg-white flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search products by name or SKU..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-12"
          />
        </div>
        <select 
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="input-field md:w-64"
        >
          <option value="">All Categories</option>
          {categories.map((cat: any) => (
            <option key={cat._id} value={cat._id}>{cat.name}</option>
          ))}
        </select>
        <button className="p-3 border rounded-xl hover:bg-gray-50 text-gray-500">
          <Filter size={20} />
        </button>
      </div>

      {/* Products Table */}
      <div className="card bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs font-black uppercase tracking-widest text-gray-400">
                <th className="px-8 py-5">Product Info</th>
                <th className="px-8 py-5">Category</th>
                <th className="px-8 py-5">Stock</th>
                <th className="px-8 py-5">Price</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-8 py-8"><div className="h-4 bg-gray-100 rounded w-full"></div></td>
                  </tr>
                ))
              ) : products.length > 0 ? (
                products.map((product: any) => (
                  <tr key={product._id} className="group hover:bg-primary/5 transition-all">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-gray-50 overflow-hidden border border-gray-100 shrink-0">
                          <img src={getImageUrl(product.images?.[0])} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-bold text-dark text-sm leading-tight group-hover:text-primary transition-colors">{product.name}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter mt-1">{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm font-medium text-gray-500">{product.category?.name || 'Uncategorized'}</td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col gap-1">
                        <span className={`text-xs font-black ${product.stock < 10 ? 'text-red-500' : 'text-dark'}`}>
                          {product.stock} {product.unit}
                        </span>
                        <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${product.stock < 10 ? 'bg-red-500' : 'bg-primary'}`} style={{ width: `${Math.min(100, (product.stock/50)*100)}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="font-black text-dark text-lg">₹{product.discountPrice || product.price}</span>
                        {product.discountPrice > 0 && <span className="text-[10px] text-gray-400 line-through">₹{product.price}</span>}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                       <button className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${product.stock > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                         {product.stock > 0 ? <><CheckCircle size={10} /> Active</> : <><XCircle size={10} /> Out of Stock</>}
                       </button>
                    </td>
                    <td className="px-8 py-5">
                       <div className="flex items-center justify-center gap-2">
                          <button 
                            className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                            onClick={() => window.location.href = `/admin/products/edit/${product._id}`}
                          >
                            <Edit size={18} />
                          </button>
                          <button 
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            onClick={() => handleDelete(product._id)}
                          >
                            <Trash2 size={18} />
                          </button>
                          <button 
                             className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                             onClick={() => window.open(`/products/${product.slug}`, '_blank')}
                          >
                             <Eye size={18} />
                          </button>
                       </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center flex flex-col items-center gap-4 grayscale opacity-30">
                    <Package size={64} />
                    <p className="text-xl font-bold">Your inventory is empty</p>
                    <button onClick={() => window.location.href = '/admin/products/new'} className="btn-primary mt-4 py-2">Create First Product</button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination placeholder */}
        <div className="px-8 py-4 bg-gray-50 flex items-center justify-between border-t border-gray-100">
           <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Showing {products.length} Products</p>
           <div className="flex gap-2">
              <button disabled className="px-4 py-2 border rounded-lg text-xs font-bold bg-white text-gray-300">Previous</button>
              <button disabled className="px-4 py-2 border rounded-lg text-xs font-bold bg-white text-gray-300">Next</button>
           </div>
        </div>
      </div>
    </div>
  );
}
