"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ShoppingBag, Truck, ShieldCheck, Clock, ArrowRight } from 'lucide-react';
import api from '@/lib/api';
import ProductCard from '@/components/products/ProductCard';

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          api.get('/categories'),
          api.get('/products?limit=8')
        ]);
        setCategories(catRes.data);
        setFeaturedProducts(prodRes.data.products);
      } catch (error) {
        console.error('Error fetching home data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const features = [
    { icon: <Truck className="text-primary" size={32} />, title: 'Home Delivery', desc: 'Fast delivery from 1000+ products' },
    { icon: <Clock className="text-primary" size={32} />, title: 'Ready in 30 Min', desc: 'Store pickup and fast delivery' },
    { icon: <ShieldCheck className="text-primary" size={32} />, title: 'Premium Quality', desc: 'Only the best for your family' },
    { icon: <ShoppingBag className="text-primary" size={32} />, title: 'Secure Payment', desc: 'Safe and secure transactions' },
  ];

  return (
    <div className="flex flex-col gap-20">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[#0FC2C0]/10 rounded-l-full blur-3xl -z-10 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-1/4 h-1/2 bg-[#023535]/5 rounded-tr-full blur-2xl -z-10" />

        <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col gap-8"
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full font-semibold border border-primary/20">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </span>
              Fresh Groceries Delivered
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold leading-tight text-dark">
              Your Family's <span className="text-primary">Trusted Store</span> Since 2021
            </h1>
            
            <p className="text-xl text-gray-600 max-w-lg leading-relaxed">
              Providing fast, reliable, and premium grocery shopping experience. Get the freshest products delivered to your doorstep in minutes.
            </p>

            <div className="flex flex-wrap gap-4 mt-4">
              <Link href="/products" className="btn-primary flex items-center gap-2 py-4">
                Shop Now <ShoppingBag size={20} />
              </Link>
              <Link href="/products?category=oils" className="btn-secondary flex items-center gap-2 py-4">
                View Offers <ArrowRight size={20} />
              </Link>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="relative"
          >
            <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border-8 border-white">
              <Image 
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1000" 
                alt="Supermarket" 
                width={800}
                height={600}
                priority
                className="w-full h-full object-cover"
              />
            </div>
            {/* Floating Card */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="absolute -bottom-6 -left-6 z-20 glass p-6 rounded-xl shadow-xl flex items-center gap-4 max-w-xs"
            >
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">✓</div>
              <div>
                <p className="font-bold text-dark">5000+ Happy Clients</p>
                <p className="text-sm text-gray-600">Premium grocery service</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -10 }}
              className="p-8 bg-white rounded-2xl border border-primary/10 shadow-sm flex flex-col items-center text-center gap-4 group"
            >
              <div className="p-4 bg-primary/5 rounded-full group-hover:bg-primary group-hover:text-white transition-all duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-dark">{feature.title}</h3>
              <p className="text-gray-500">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Categories Section */}
      <section className="bg-[#f0fefe] py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center text-center gap-4 mb-16">
            <h2 className="text-4xl font-bold text-dark">Browse by <span className="text-primary">Categories</span></h2>
            <div className="h-1.5 w-24 bg-primary rounded-full" />
            <p className="text-gray-600 max-w-md">Explore our wide range of categories for all your household needs.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {loading ? (
              [...Array(6)].map((_, i) => <div key={i} className="h-40 bg-gray-200 animate-pulse rounded-2xl" />)
            ) : (
              categories.map((cat: any) => (
                <Link key={cat._id} href={`/products?category=${cat._id}`}>
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="p-6 bg-white rounded-2xl shadow-sm hover:shadow-md border border-primary/5 flex flex-col items-center gap-4 transition-all"
                  >
                    <div className="w-20 h-20 bg-primary/5 rounded-full overflow-hidden flex items-center justify-center">
                      <img src={cat.image || `https://ui-avatars.com/api/?name=${cat.name}&background=0FC2C0&color=fff`} alt={cat.name} className="w-12 h-12 object-contain" />
                    </div>
                    <span className="font-bold text-dark text-center">{cat.name}</span>
                  </motion.div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4 py-20">
        <div className="flex items-end justify-between mb-12">
          <div className="flex flex-col gap-4">
            <h2 className="text-4xl font-bold text-dark">Featured <span className="text-primary">Products</span></h2>
            <div className="h-1.5 w-24 bg-primary rounded-full" />
          </div>
          <Link href="/products" className="flex items-center gap-2 text-primary font-bold hover:gap-4 transition-all">
            See All <ArrowRight size={20} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {loading ? (
             [...Array(4)].map((_, i) => <div key={i} className="h-80 bg-gray-200 animate-pulse rounded-2xl" />)
          ) : (
            featuredProducts.map((product: any) => (
              <ProductCard key={product._id} product={product} />
            ))
          )}
        </div>
      </section>

      {/* Offer Section */}
      <section className="container mx-auto px-4 mb-20">
        <div className="bg-accent rounded-[2rem] overflow-hidden relative p-12 lg:p-20 text-white flex flex-col gap-8">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/20 blur-3xl -z-0" />
          <div className="relative z-10 flex flex-col gap-6 max-w-2xl">
            <h2 className="text-4xl lg:text-6xl font-bold leading-tight">
              Get <span className="text-primary">FREE Home Delivery</span> On Orders Above ₹1000
            </h2>
            <p className="text-xl text-white/80">
              No platform fee, no delivery charge. Just pure savings on all your family essentials.
            </p>
            <div>
              <Link href="/products" className="btn-primary py-4 px-10">Start Shopping</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
