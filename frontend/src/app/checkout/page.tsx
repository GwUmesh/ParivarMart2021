"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { 
  MapPin, 
  CreditCard, 
  CheckCircle2, 
  ChevronRight, 
  Plus, 
  Tag, 
  ShoppingBag,
  Truck,
  Store,
  ArrowLeft,
  Gift
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, subtotal, clearCart, isInitialized } = useCart();
  const { user, loading: authLoading, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  
  // Checkout State
  const [step, setStep] = useState(1);
  const [deliveryType, setDeliveryType] = useState('home_delivery');
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<any>(null);
  const [newAddress, setNewAddress] = useState({
    fullName: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', pincode: ''
  });
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      toast.error('Please login to checkout');
      router.push('/auth/login?redirect=/checkout');
    }
    if (isInitialized && cart.length === 0 && !orderSuccess) {
      router.push('/cart');
    }

    const fetchData = async () => {
      try {
        const res = await api.get('/settings');
        setSettings(res.data);
      } catch (e) {
        console.error('Settings fetch failed', e);
      }
    };
    fetchData();

    if (user?.addresses && user.addresses.length > 0) {
      const defaultAddr = user.addresses.find((a: any) => a.isDefault) || user.addresses[0];
      setSelectedAddress(defaultAddr._id);
    }
  }, [user, authLoading, cart]);

  const handleApplyPromo = async () => {
    if (!promoCode) return;
    try {
      setLoading(true);
      const res = await api.post('/promocodes/apply', { code: promoCode, subtotal });
      setAppliedPromo(res.data);
      toast.success(res.data.message);
    } catch (error: any) {
      toast.error(error.message || 'Invalid promo code');
      setAppliedPromo(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.post('/users/address', newAddress);
      toast.success('Address added successfully');
      setIsAddingAddress(false);
      
      // Update UI with the newly added address
      // res.data is the updated list of addresses
      if (res.data && res.data.length > 0) {
        const added = res.data[res.data.length - 1];
        setSelectedAddress(added._id);
        
        // Refresh full user object in context
        const profileRes = await api.get('/users/profile');
        updateUser(profileRes.data);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to add address');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (deliveryType === 'home_delivery' && !selectedAddress) {
      toast.error('Please select a delivery address');
      return;
    }

    try {
      setLoading(true);
      const address = user?.addresses?.find((a: any) => a._id === selectedAddress);
      
      const res = await api.post('/orders', {
        items: cart.map(i => ({ product: i._id, name: i.name, price: i.price, quantity: i.quantity })),
        address: deliveryType === 'home_delivery' ? address : null,
        promoCode: appliedPromo?.code,
        paymentMethod,
        deliveryType
      });

      setOrderSuccess(true);
      toast.success('Order placed successfully! Check your email for invoice.');
      clearCart();
      router.push(`/profile?order=${res.data._id}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  // Pricing Logic
  const freeDeliveryThreshold = settings?.freeDeliveryThreshold || 1000;
  const deliveryCharge = deliveryType === 'store_pickup' || subtotal >= freeDeliveryThreshold ? 0 : (settings?.deliveryCharge || 40);
  const platformFee = deliveryType === 'store_pickup' || subtotal >= freeDeliveryThreshold ? 0 : (settings?.platformFee || 3);
  const discount = appliedPromo?.discount || 0;
  const total = subtotal + deliveryCharge + platformFee - discount;

  if (authLoading || !user) return <div className="py-20 text-center font-bold text-primary">Verifying session...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
       {/* Steps Progress */}
       <div className="flex items-center justify-between mb-12 max-w-2xl mx-auto">
         {[
           { id: 1, label: 'Delivery', icon: <Truck size={18} /> },
           { id: 2, label: 'Payment', icon: <CreditCard size={18} /> },
           { id: 3, label: 'Review', icon: <CheckCircle2 size={18} /> }
         ].map((s, i) => (
           <React.Fragment key={s.id}>
             <div className="flex flex-col items-center gap-2 relative">
               <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${step >= s.id ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/30' : 'bg-gray-100 text-gray-400'}`}>
                 {s.icon}
               </div>
               <span className={`text-xs font-bold uppercase tracking-wider ${step >= s.id ? 'text-primary' : 'text-gray-400'}`}>{s.label}</span>
             </div>
             {i < 2 && <div className={`flex-1 h-1 mx-4 rounded-full transition-all duration-700 ${step > s.id ? 'bg-primary' : 'bg-gray-100'}`} />}
           </React.Fragment>
         ))}
       </div>

       <div className="grid lg:grid-cols-3 gap-12">
         {/* Main Form */}
         <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex flex-col gap-8"
                >
                  <h2 className="text-3xl font-bold text-dark">How would you like your <span className="text-primary">order?</span></h2>
                  
                  {/* Delivery Type Toggle */}
                   <div className="grid grid-cols-2 gap-2 p-2 bg-white border border-primary/10 rounded-2xl shadow-sm">
                    <button 
                      onClick={() => setDeliveryType('home_delivery')}
                      className={`flex items-center justify-center gap-3 py-4 rounded-xl font-bold transition-all ${deliveryType === 'home_delivery' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-dark'}`}
                    >
                      <Truck size={20} /> Home Delivery
                    </button>
                    <button 
                      onClick={() => setDeliveryType('store_pickup')}
                      className={`flex items-center justify-center gap-3 py-4 rounded-xl font-bold transition-all ${deliveryType === 'store_pickup' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-dark'}`}
                    >
                      <Store size={20} /> Store Pickup
                    </button>
                  </div>

                  {deliveryType === 'home_delivery' && (
                    <div className="flex flex-col gap-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-dark flex items-center gap-2">
                          <MapPin className="text-primary" size={20} /> Select Address
                        </h3>
                        <button 
                          onClick={() => setIsAddingAddress(!isAddingAddress)}
                          className="flex items-center gap-1 text-primary font-bold hover:underline"
                        >
                          <Plus size={18} /> Add New
                        </button>
                      </div>

                      {isAddingAddress ? (
                        <form onSubmit={handleAddAddress} className="card p-6 grid md:grid-cols-2 gap-4">
                          <input required placeholder="Full Name" className="input-field md:col-span-2" value={newAddress.fullName} onChange={e => setNewAddress({...newAddress, fullName: e.target.value})} />
                          <input required placeholder="Phone Number" className="input-field" value={newAddress.phone} onChange={e => setNewAddress({...newAddress, phone: e.target.value})} />
                          <input required placeholder="Pincode" className="input-field" value={newAddress.pincode} onChange={e => setNewAddress({...newAddress, pincode: e.target.value})} />
                          <input required placeholder="Address Line 1" className="input-field md:col-span-2" value={newAddress.addressLine1} onChange={e => setNewAddress({...newAddress, addressLine1: e.target.value})} />
                          <input placeholder="Address Line 2 (Optional)" className="input-field md:col-span-2" value={newAddress.addressLine2} onChange={e => setNewAddress({...newAddress, addressLine2: e.target.value})} />
                          <input required placeholder="City" className="input-field" value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} />
                          <input required placeholder="State" className="input-field" value={newAddress.state} onChange={e => setNewAddress({...newAddress, state: e.target.value})} />
                          <div className="md:col-span-2 flex gap-4 mt-2">
                            <button type="submit" disabled={loading} className="btn-primary flex-1">Save Address</button>
                            <button type="button" onClick={() => setIsAddingAddress(false)} className="px-6 py-2 border rounded-lg hover:bg-gray-100 transition-colors">Cancel</button>
                          </div>
                        </form>
                      ) : (
                        <div className="grid md:grid-cols-2 gap-4">
                          {user.addresses?.map((addr: any) => (
                            <div 
                              key={addr._id}
                              onClick={() => setSelectedAddress(addr._id)}
                              className={`p-6 rounded-2xl border-2 transition-all cursor-pointer relative group ${selectedAddress === addr._id ? 'border-primary bg-primary/5 shadow-md' : 'border-gray-100 hover:border-primary/20 bg-white'}`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded">{addr.label || 'Address'}</span>
                                {selectedAddress === addr._id && <CheckCircle2 className="text-primary" size={20} />}
                              </div>
                              <p className="font-bold text-dark">{addr.fullName}</p>
                              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{addr.addressLine1}, {addr.city}</p>
                              <p className="text-sm text-gray-500">{addr.phone}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {deliveryType === 'store_pickup' && (
                    <div className="card p-8 bg-primary/5 border-primary/20 flex items-start gap-4">
                      <div className="p-3 bg-white rounded-xl shadow-sm border border-primary/10 text-primary">
                        <Store size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-dark text-lg">Pick up from Store</h3>
                        <p className="text-gray-600 mt-1">Parade Corner, Rasayani, Raigad – 410220</p>
                        <p className="text-sm text-primary font-bold mt-2 flex items-center gap-1 cursor-pointer">
                          View on Map <ChevronRight size={14} />
                        </p>
                      </div>
                    </div>
                  )}

                  <button 
                    disabled={deliveryType === 'home_delivery' && !selectedAddress}
                    onClick={() => setStep(2)} 
                    className="btn-primary py-5 text-xl flex items-center justify-center gap-2 mt-4"
                  >
                    Continue to Payment <ChevronRight size={20} />
                  </button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex flex-col gap-8"
                >
                  <button onClick={() => setStep(1)} className="flex items-center gap-1 text-sm text-gray-400 hover:text-primary transition-colors">
                    <ArrowLeft size={16} /> Back to Delivery
                  </button>
                  <h2 className="text-3xl font-bold text-dark">Choose <span className="text-primary">Payment</span> Method</h2>
                  
                  <div className="grid gap-4">
                    <div 
                      onClick={() => setPaymentMethod('cod')}
                      className={`p-6 rounded-2xl border-2 cursor-pointer flex items-center justify-between transition-all ${paymentMethod === 'cod' ? 'border-primary bg-primary/5' : 'border-gray-100 hover:border-primary/20 bg-white'}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-4 rounded-xl ${paymentMethod === 'cod' ? 'bg-primary text-white' : 'bg-gray-100'}`}>
                          <CreditCard size={24} />
                        </div>
                        <div>
                          <p className="font-bold text-dark">Cash on Delivery</p>
                          <p className="text-sm text-gray-500">Pay when you receive your order</p>
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'cod' ? 'border-primary' : 'border-gray-300'}`}>
                        {paymentMethod === 'cod' && <div className="w-3 h-3 rounded-full bg-primary" />}
                      </div>
                    </div>

                    <div className="p-6 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center gap-4 opacity-60 cursor-not-allowed">
                       <div className="p-4 rounded-xl bg-gray-200">
                          <ShoppingBag size={24} />
                        </div>
                        <div>
                          <p className="font-bold text-dark">Online Payment</p>
                          <p className="text-sm text-gray-400">Temporarily disabled</p>
                        </div>
                    </div>
                  </div>

                  <button onClick={() => setStep(3)} className="btn-primary py-5 text-xl">
                    Review Order
                  </button>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div 
                  key="step3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex flex-col gap-8"
                >
                  <button onClick={() => setStep(2)} className="flex items-center gap-1 text-sm text-gray-400 hover:text-primary transition-colors">
                    <ArrowLeft size={16} /> Back to Payment
                  </button>
                  <h2 className="text-3xl font-bold text-dark">Final <span className="text-primary">Review</span></h2>
                  
                  <div className="card p-6 bg-white flex flex-col gap-6 divide-y divide-gray-100">
                    <div className="flex justify-between items-start pt-0">
                      <div>
                        <h4 className="font-bold text-dark mb-1">Items</h4>
                        <p className="text-sm text-gray-500">{cart.length} items from Parivar Mart</p>
                      </div>
                      <Link href="/cart" className="text-primary text-sm font-bold underline">Edit Cart</Link>
                    </div>

                    <div className="pt-6">
                      <h4 className="font-bold text-dark mb-2">Delivery Details</h4>
                      <p className="text-sm text-gray-600">
                        {deliveryType === 'home_delivery' 
                          ? `Home delivery to ${user?.addresses?.find((a: any) => a._id === selectedAddress)?.fullName || 'Selected Address'}` 
                          : 'Store pickup at Parade Corner'}
                      </p>
                    </div>

                    <div className="pt-6">
                      <h4 className="font-bold text-dark mb-2">Payment Method</h4>
                      <p className="text-sm text-gray-600">Cash on Delivery</p>
                    </div>
                  </div>

                  <button 
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="btn-primary py-5 text-2xl flex items-center justify-center gap-3 shadow-xl shadow-primary/40 group overflow-hidden relative"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                       {loading ? 'Processing...' : 'Place Your Order'}
                       {!loading && <CheckCircle2 className="group-hover:rotate-12 transition-transform" size={24} />}
                    </span>
                    <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
         </div>

         {/* Order Summary Stickbar */}
         <aside>
            <div className="card p-8 flex flex-col gap-8 sticky top-24">
              <h2 className="text-xl font-bold text-dark border-b border-primary/10 pb-4">Order Summary</h2>
              
              <div className="flex flex-col gap-3">
                {cart.map(item => (
                  <div key={item._id} className="flex justify-between text-sm">
                    <span className="text-gray-500">{item.quantity}x {item.name}</span>
                    <span className="font-bold text-dark">₹{(item.price * item.quantity).toFixed(0)}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-6 pt-6 border-t border-primary/10">
                 {/* Promo Code Input */}
                 <div className="flex flex-col gap-3">
                   <p className="text-sm font-bold text-dark flex items-center gap-2">
                     <Tag size={16} className="text-primary" /> Apply Promo Code
                   </p>
                   <div className="flex gap-2">
                     <input 
                       disabled={!!appliedPromo}
                       type="text" 
                       placeholder="e.g. WELCOME50"
                       value={promoCode}
                       onChange={e => setPromoCode(e.target.value.toUpperCase())}
                       className="flex-1 px-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary outline-none uppercase"
                     />
                     <button 
                       disabled={!promoCode || !!appliedPromo || loading}
                       onClick={handleApplyPromo}
                       className={`px-4 py-2 rounded-xl font-bold ${appliedPromo ? 'bg-green-500 text-white' : 'bg-primary text-white hover:bg-primary-hover transition-colors'}`}
                     >
                       {appliedPromo ? 'Applied' : 'Apply'}
                     </button>
                   </div>
                   {appliedPromo && (
                     <div className="p-2 bg-green-50 text-green-600 text-[10px] font-bold rounded-lg border border-green-100 flex items-center justify-between">
                       <span>CODE APPLIED: {appliedPromo.code}</span>
                       <button onClick={() => { setAppliedPromo(null); setPromoCode(''); }} className="underline">Remove</button>
                     </div>
                   )}
                 </div>

                 {/* Price Breakdown */}
                 <div className="flex flex-col gap-4 text-gray-600">
                    <div className="flex justify-between items-center">
                      <span>Subtotal</span>
                      <span className="font-bold text-dark">₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Delivery {deliveryCharge === 0 ? <span className="text-[10px] text-green-600 bg-green-50 px-1 rounded ml-1 font-bold">FREE</span> : ''}</span>
                      <span className="font-bold text-dark">₹{deliveryCharge.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span>Platform Fee {platformFee === 0 ? <span className="text-[10px] text-green-600 bg-green-50 px-1 rounded ml-1 font-bold">FREE</span> : ''}</span>
                      <span className="font-bold text-dark">₹{platformFee.toFixed(2)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between items-center text-green-600">
                        <span className="flex items-center gap-1 font-bold"><Gift size={14} /> Discount</span>
                        <span className="font-bold">-₹{discount.toFixed(2)}</span>
                      </div>
                    )}
                 </div>

                 <div className="flex flex-col gap-2 pt-6 border-t-2 border-primary/20">
                    <div className="flex justify-between items-center text-3xl font-black text-primary">
                      <span>Total</span>
                      <span>₹{total.toFixed(2)}</span>
                    </div>
                 </div>
              </div>
            </div>
         </aside>
       </div>
    </div>
  );
}
