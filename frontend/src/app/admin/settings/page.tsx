"use client";

import React, { useEffect, useState } from 'react';
import { 
  Settings, 
  Save, 
  Truck, 
  CreditCard, 
  Phone, 
  Mail, 
  MapPin, 
  Globe,
  Loader2,
  Info,
  ShieldCheck
} from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    minOrderValue: 0,
    deliveryCharge: 0,
    platformFee: 0,
    freeDeliveryThreshold: 0,
    storePhone: '',
    storeEmail: '',
    storeAddress: '',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/settings');
      setSettings(res.data);
    } catch (error) {
      console.error('Failed to fetch settings', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.patch('/settings', settings);
      toast.success('Configuration saved successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="py-20 text-center font-bold text-primary">Loading settings...</div>;

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black text-dark flex items-center gap-4">
          Store <span className="text-primary">Settings</span> 
          <Settings className="text-primary animate-spin-slow" size={32} />
        </h1>
        <p className="text-gray-500">Configure global business logic and contact information.</p>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Pricing Logic Section */}
          <div className="card p-8 bg-white flex flex-col gap-8 h-full">
            <h2 className="text-2xl font-bold text-dark flex items-center gap-3">
              <CreditCard className="text-primary" size={24} /> Pricing & Delivery Logic
            </h2>
            
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">Min Order Value (₹)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">₹</span>
                  <input 
                    type="number" 
                    className="input-field pl-10"
                    value={settings.minOrderValue}
                    onChange={e => setSettings({ ...settings, minOrderValue: Number(e.target.value) })}
                  />
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">Delivery Charge (₹)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">₹</span>
                  <input 
                    type="number" 
                    className="input-field pl-10"
                    value={settings.deliveryCharge}
                    onChange={e => setSettings({ ...settings, deliveryCharge: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">Platform Fee (₹)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">₹</span>
                  <input 
                    type="number" 
                    className="input-field pl-10"
                    value={settings.platformFee}
                    onChange={e => setSettings({ ...settings, platformFee: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">Free Delivery Threshold (₹)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">₹</span>
                  <input 
                    type="number" 
                    className="input-field pl-10 border-emerald-200 focus:ring-emerald-500"
                    value={settings.freeDeliveryThreshold}
                    onChange={e => setSettings({ ...settings, freeDeliveryThreshold: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>

            <div className="mt-auto p-4 bg-primary/5 rounded-2xl border border-primary/10 flex gap-4">
               <Info className="text-primary shrink-0" size={20} />
               <p className="text-xs text-gray-600 leading-relaxed font-medium">
                 Orders above the threshold will automatically have delivery and platform fees set to ₹0. This encourages higher order values!
               </p>
            </div>
          </div>

          {/* Store Info Section */}
          <div className="card p-8 bg-white flex flex-col gap-8 h-full">
            <h2 className="text-2xl font-bold text-dark flex items-center gap-3">
              <Globe className="text-primary" size={24} /> Store Information
            </h2>
            
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">Customer Support Phone</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={18} />
                  <input 
                    type="text" 
                    className="input-field pl-12"
                    value={settings.storePhone}
                    onChange={e => setSettings({ ...settings, storePhone: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">Support Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={18} />
                  <input 
                    type="email" 
                    className="input-field pl-12"
                    value={settings.storeEmail}
                    onChange={e => setSettings({ ...settings, storeEmail: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">Physical Store Address</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-6 text-primary" size={18} />
                  <textarea 
                    rows={3}
                    className="input-field pl-12 resize-none"
                    value={settings.storeAddress}
                    onChange={e => setSettings({ ...settings, storeAddress: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="mt-auto p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex gap-4">
               <ShieldCheck className="text-emerald-500 shrink-0" size={20} />
               <p className="text-xs text-emerald-700 leading-relaxed font-medium">
                 This information is displayed in the footer and on generated invoices. Ensure accuracy for legal fulfillment.
               </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
           <button 
             disabled={saving}
             type="submit" 
             className="btn-primary py-4 px-12 text-xl shadow-2xl shadow-primary/30 flex items-center gap-3 overflow-hidden group"
           >
             {saving ? (
               <Loader2 className="animate-spin" size={24} />
             ) : (
               <>
                 <Save size={24} className="group-hover:scale-110 transition-transform" />
                 Save Configuration
               </>
             )}
           </button>
        </div>
      </form>
    </div>
  );
}
