"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Filter, Search, ChevronRight, X } from 'lucide-react';
import api from '@/lib/api';
import ProductCard from '@/components/products/ProductCard';
import { motion, AnimatePresence } from 'framer-motion';

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  // Filters state
  const categoryId = searchParams.get('category') || '';
  const searchQuery = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || '';
  const page = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [catRes, prodRes] = await Promise.all([
          api.get('/categories'),
          api.get(`/products?category=${categoryId}&search=${searchQuery}&sort=${sort}&page=${page}`)
        ]);
        setCategories(catRes.data);
        setProducts(prodRes.data.products);
        setTotal(prodRes.data.total);
      } catch (error) {
        console.error('Error fetching products', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [categoryId, searchQuery, sort, page]);

  const updateFilters = (newFilters: any) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newFilters).forEach(([key, value]: [string, any]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    params.set('page', '1'); // Reset to page 1 on filter change
    router.push(`/products?${params.toString()}`);
  };

  const activeCategory = categories.find((c: any) => c._id === categoryId) as any;

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-8 overflow-x-auto whitespace-nowrap">
        <Link href="/" className="hover:text-primary">Home</Link>
        <ChevronRight size={14} />
        <Link href="/products" className={!categoryId ? "text-primary font-bold" : "hover:text-primary"}>All Products</Link>
        {activeCategory && (
          <>
            <ChevronRight size={14} />
            <span className="text-primary font-bold">{activeCategory.name}</span>
          </>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters (Desktop) */}
        <aside className="hidden lg:flex flex-col gap-8 w-64 shrink-0">
          <div>
            <h3 className="text-lg font-bold text-dark mb-4 flex items-center gap-2">
              <Filter size={18} /> Categories
            </h3>
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => updateFilters({ category: '' })}
                className={`text-left px-4 py-2 rounded-lg transition-all ${!categoryId ? 'bg-primary text-white font-bold' : 'hover:bg-primary/10 text-gray-600'}`}
              >
                All Categories
              </button>
              {categories.map((cat: any) => (
                <button 
                  key={cat._id}
                  onClick={() => updateFilters({ category: cat._id })}
                  className={`text-left px-4 py-2 rounded-lg transition-all ${categoryId === cat._id ? 'bg-primary text-white font-bold' : 'hover:bg-primary/10 text-gray-600'}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-dark mb-4">Sort By</h3>
            <select 
              value={sort}
              onChange={(e) => updateFilters({ sort: e.target.value })}
              className="input-field"
            >
              <option value="">Default</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name">Name: A-Z</option>
            </select>
          </div>
        </aside>

        {/* Mobile Filters Toggle */}
        <div className="lg:hidden mb-4 flex gap-4">
          <button 
            onClick={() => setShowFilters(true)}
            className="flex-1 btn-secondary flex items-center justify-center gap-2 py-3"
          >
            <Filter size={18} /> Filters
          </button>
          <div className="flex-1 relative">
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchQuery}
              onChange={(e) => updateFilters({ search: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-primary/20 bg-white"
            />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-primary" size={18} />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <div className="hidden lg:flex items-center justify-between mb-8 pb-4 border-b border-primary/10">
            <h1 className="text-3xl font-bold text-dark">
              {activeCategory ? activeCategory.name : 'All Products'}
              <span className="ml-4 text-sm font-normal text-gray-400">({total} items found)</span>
            </h1>
            <div className="flex items-center gap-4">
              <div className="relative w-64">
                <input 
                  type="text" 
                  placeholder="Search products..." 
                  value={searchQuery}
                  onChange={(e) => updateFilters({ search: e.target.value })}
                  className="input-field pl-10"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              </div>
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => <div key={i} className="h-80 bg-gray-100 animate-pulse rounded-2xl" />)}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
              {products.map((product: any) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="py-20 flex flex-col items-center gap-6 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-300">
                <Search size={40} />
              </div>
              <h2 className="text-2xl font-bold text-dark">No products found</h2>
              <p className="text-gray-500">Try adjusting your filters or search query.</p>
              <button 
                onClick={() => router.push('/products')}
                className="btn-primary"
              >
                Clear All Filters
              </button>
            </div>
          )}

          {/* Pagination Placeholder */}
          {total > products.length && (
            <div className="mt-12 flex justify-center gap-2">
               {/* Simplified pagination for now */}
               <button 
                 disabled={page === 1}
                 onClick={() => updateFilters({ page: page - 1 })}
                 className="p-2 border rounded-lg disabled:opacity-50"
               >
                 Prev
               </button>
               <span className="flex items-center px-4 font-bold text-primary">{page}</span>
               <button 
                 disabled={products.length < 20}
                 onClick={() => updateFilters({ page: page + 1 })}
                 className="p-2 border rounded-lg disabled:opacity-50"
               >
                 Next
               </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Modal */}
      <AnimatePresence>
        {showFilters && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="fixed inset-0 z-[100] bg-white p-6 flex flex-col gap-8 lg:hidden"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-dark">Filters</h3>
              <button onClick={() => setShowFilters(false)} className="p-2 bg-gray-100 rounded-full">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto flex flex-col gap-8">
              <div>
                <h4 className="font-bold mb-4 text-primary">Categories</h4>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => { updateFilters({ category: '' }); setShowFilters(false); }}
                    className={`px-4 py-3 rounded-xl border text-sm ${!categoryId ? 'bg-primary text-white' : 'border-gray-200'}`}
                  >
                    All Items
                  </button>
                  {categories.map((cat: any) => (
                    <button 
                      key={cat._id}
                      onClick={() => { updateFilters({ category: cat._id }); setShowFilters(false); }}
                      className={`px-4 py-3 rounded-xl border text-sm ${categoryId === cat._id ? 'bg-primary text-white' : 'border-gray-200'}`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold mb-4 text-primary">Sort Order</h4>
                <div className="flex flex-col gap-2">
                  <button onClick={() => { updateFilters({ sort: '' }); setShowFilters(false); }} className={`p-4 text-left border rounded-xl ${sort === '' ? 'border-primary bg-primary/5' : ''}`}>Default</button>
                  <button onClick={() => { updateFilters({ sort: 'price_asc' }); setShowFilters(false); }} className={`p-4 text-left border rounded-xl ${sort === 'price_asc' ? 'border-primary bg-primary/5' : ''}`}>Price: Low to High</button>
                  <button onClick={() => { updateFilters({ sort: 'price_desc' }); setShowFilters(false); }} className={`p-4 text-left border rounded-xl ${sort === 'price_desc' ? 'border-primary bg-primary/5' : ''}`}>Price: High to Low</button>
                </div>
              </div>
            </div>

            <button onClick={() => setShowFilters(false)} className="btn-primary w-full py-4 text-lg">Apply Filters</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import Link from 'next/link';

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-20 text-center">Loading products...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
