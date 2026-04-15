"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Truck, Info, Gift, ShieldCheck } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { getImageUrl } from '@/lib/utils';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, subtotal, totalItems } = useCart();
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/settings');
        setSettings(res.data);
      } catch (error) {
        console.error('Error fetching settings', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleDeleteItem = (id: string, name: string) => {
    removeFromCart(id);
    toast.success(`${name} removed from cart`);
  };

  if (loading) return <div className="container mx-auto px-4 py-20 text-center font-bold text-primary">Loading cart...</div>;

  const freeDeliveryThreshold = settings?.freeDeliveryThreshold || 1000;
  const deliveryCharge = settings?.deliveryCharge || 40;
  const platformFee = settings?.platformFee || 3;
  const minOrderValue = settings?.minOrderValue || 100;

  const amountToFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal);
  const isFreeDeliveryEligible = subtotal >= freeDeliveryThreshold;

  const total = isFreeDeliveryEligible 
    ? subtotal 
    : subtotal + deliveryCharge + platformFee;

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center text-center gap-8">
        <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center text-primary">
          <ShoppingBag size={64} />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold text-dark">Your cart is empty</h1>
          <p className="text-gray-500 text-lg">Looks like you haven't added anything to your cart yet.</p>
        </div>
        <Link href="/products" className="btn-primary py-4 px-10 text-xl">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col gap-4 mb-10">
        <h1 className="text-4xl font-bold text-dark flex items-center gap-4">
          Shopping <span className="text-primary">Cart</span>
          <span className="text-lg font-normal text-gray-400">({totalItems} items)</span>
        </h1>
        <div className="h-1.5 w-32 bg-primary rounded-full" />
      </div>

      <div className="grid lg:grid-cols-3 gap-12 items-start">
        {/* Cart Items List */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Smart Suggestion Banner */}
          <AnimatePresence>
            {!isFreeDeliveryEligible && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-primary/10 border border-primary/20 p-4 rounded-2xl flex items-center gap-4 text-dark"
              >
                <div className="p-3 bg-white rounded-xl shadow-sm text-primary">
                  <Truck size={24} />
                </div>
                <div>
                  <p className="font-bold">Add <span className="text-primary text-xl">₹{amountToFreeDelivery}</span> more for <span className="uppercase text-primary font-black">Free Delivery</span></p>
                  <p className="text-sm text-gray-600">Currently, delivery fee is ₹{deliveryCharge} + ₹{platformFee} platform fee.</p>
                </div>
                <Link href="/products" className="ml-auto flex items-center gap-1 font-bold text-primary hover:gap-2 transition-all">
                  Add more <ArrowRight size={16} />
                </Link>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-col gap-4">
            {cart.map((item) => (
              <motion.div 
                layout
                key={item._id}
                className="card p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-6"
              >
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-white border border-primary/10 shadow-sm shrink-0">
                  <img src={getImageUrl(item.image)} alt={item.name} className="w-full h-full object-contain p-2" />
                </div>
                
                <div className="flex-1 flex flex-col gap-2">
                  <Link href={`/products/${item._id}`}>
                    <h3 className="text-xl font-bold text-dark hover:text-primary transition-colors">{item.name}</h3>
                  </Link>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="font-bold text-primary text-lg">₹{item.discountPrice && item.discountPrice > 0 ? item.discountPrice : item.price}</span>
                    <span className="text-xs">/ piece</span>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="flex items-center border border-primary/20 rounded-xl bg-white overflow-hidden shadow-sm">
                    <button 
                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      className="p-2 hover:bg-primary/10 text-primary transition-colors"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-8 text-center font-bold text-dark">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      className="p-2 hover:bg-primary/10 text-primary transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  
                  <div className="w-20 text-right font-bold text-dark text-lg">
                    ₹{((item.discountPrice && item.discountPrice > 0 ? item.discountPrice : item.price) * item.quantity).toFixed(2)}
                  </div>

                  <button 
                    onClick={() => handleDeleteItem(item._id, item.name)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <aside className="lg:top-24 flex flex-col gap-6">
          <div className="card p-8 flex flex-col gap-8 sticky top-24">
            <h2 className="text-2xl font-bold text-dark border-b border-primary/10 pb-4">Order Summary</h2>
            
            <div className="flex flex-col gap-4 text-gray-600">
              <div className="flex justify-between items-center">
                <span>Items Subtotal</span>
                <span className="font-bold text-dark">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center group relative">
                <span className="flex items-center gap-2">
                  Delivery Fee <Info size={14} className="text-gray-400 cursor-help" />
                </span>
                <span className={`font-bold ${isFreeDeliveryEligible ? 'text-green-600' : 'text-dark'}`}>
                  {isFreeDeliveryEligible ? 'FREE' : `₹${deliveryCharge.toFixed(2)}`}
                </span>
                <div className="absolute bottom-full left-0 mb-2 p-2 bg-dark text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity w-48 z-10">
                  Free delivery on orders above ₹{freeDeliveryThreshold}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>Platform Fee</span>
                <span className={`font-bold ${isFreeDeliveryEligible ? 'text-green-600' : 'text-dark'}`}>
                   {isFreeDeliveryEligible ? 'FREE' : `₹${platformFee.toFixed(2)}`}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-4 pt-6 border-t-2 border-primary/20">
              <div className="flex justify-between items-center text-2xl font-black text-primary">
                <span>Total Amount</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
              <p className="text-xs text-gray-400 text-center">Price inclusive of all taxes</p>
            </div>

            {subtotal < minOrderValue && (
              <div className="p-4 bg-red-50 rounded-xl border border-red-100 flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-500 shrink-0">!</div>
                <p className="text-xs text-red-600 leading-tight">Minimum order value is <strong>₹{minOrderValue}</strong>. Please add more items to checkout.</p>
              </div>
            )}

            <button 
              disabled={subtotal < minOrderValue}
              className="btn-primary w-full py-5 text-xl flex items-center justify-center gap-3 disabled:bg-gray-300 disabled:scale-100"
              onClick={() => window.location.href = '/checkout'}
            >
              Checkout <ArrowRight size={24} />
            </button>

            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <ShieldCheck size={18} className="text-primary" />
                <span>100% Secure Checkout</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <Gift size={18} className="text-primary" />
                <span>Apply coupons at checkout</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
