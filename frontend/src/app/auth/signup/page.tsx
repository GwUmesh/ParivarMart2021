"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, UserPlus, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      return toast.error("Passwords don't match");
    }

    setLoading(true);
    try {
      await signup(formData.name, formData.email, formData.password);
      toast.success('Account created! Welcome to Parivar Mart.');
      router.push('/');
    } catch (error: any) {
      toast.error(error.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 flex justify-center items-center min-h-[85vh]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <div className="card p-10 flex flex-col gap-8 shadow-2xl bg-white/80 backdrop-blur-md relative overflow-hidden">
          {/* Decorative shapes */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl -z-10" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl -z-10" />

          <div className="flex flex-col items-center text-center gap-2">
            <h1 className="text-4xl font-black text-dark tracking-tight">Join <span className="text-primary">Parivar Mart</span></h1>
            <p className="text-gray-500">Create shareable family shopping lists and more.</p>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2 relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={20} />
              <input 
                required
                type="text" 
                placeholder="Full Name" 
                className="input-field pl-12 py-4"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            
            <div className="md:col-span-2 relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={20} />
              <input 
                required
                type="email" 
                placeholder="Email Address" 
                className="input-field pl-12 py-4"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={20} />
              <input 
                required
                type="password" 
                placeholder="Password" 
                className="input-field pl-12 py-4"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={20} />
              <input 
                required
                type="password" 
                placeholder="Confirm" 
                className="input-field pl-12 py-4"
                value={formData.confirmPassword}
                onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
            </div>

            <div className="md:col-span-2 flex flex-col gap-4 mt-2">
              <button 
                disabled={loading}
                type="submit" 
                className="btn-primary py-4 text-lg font-bold flex items-center justify-center gap-2 shadow-xl shadow-primary/20"
              >
                {loading ? 'Creating Account...' : 'Sign Up Free'} <UserPlus size={20} />
              </button>
            </div>
          </form>

          <div className="relative flex items-center justify-center py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <span className="relative bg-white px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Already have an account?</span>
          </div>

          <Link href="/auth/login" className="flex items-center justify-center gap-2 py-4 px-6 border border-primary/20 rounded-2xl hover:bg-primary/5 transition-all font-bold text-primary group">
            Login to Existing Account <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>

          <p className="text-[10px] text-gray-400 text-center uppercase tracking-tighter">
            By signing up, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
