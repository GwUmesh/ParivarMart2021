"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Lock, ArrowLeft, Loader2, CheckCircle, ShieldCheck } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useParams, useRouter } from 'next/navigation';

export default function ResetPassword() {
  const params = useParams();
  const token = params.token;
  const router = useRouter();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error('Passwords do not match');
    }
    if (password.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }

    setLoading(true);
    try {
      await api.post(`/users/reset-password/${token}`, { password });
      setSuccess(true);
      toast.success('Password reset successful!');
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card max-w-md w-full p-8 sm:p-12 bg-white flex flex-col gap-8 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-primary" />
        
        <div className="flex flex-col gap-3">
          <h1 className="text-4xl font-black text-dark tracking-tighter uppercase mt-2">Reset <span className="text-primary">Password</span></h1>
          <p className="text-gray-500 font-medium leading-relaxed">
            {success 
              ? 'Your password has been changed successfully. You will be redirected to the login page shortly.' 
              : 'Create a strong new password for your Parivar Mart account.'}
          </p>
        </div>

        {!success ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400">New Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
                <input 
                  required
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field pl-12"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400">Confirm Password</label>
              <div className="relative group">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
                <input 
                  required
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field pl-12"
                />
              </div>
            </div>

            <button 
              disabled={loading}
              type="submit" 
              className="btn-primary py-5 text-lg flex items-center justify-center gap-3 shadow-xl shadow-primary/20"
            >
              {loading ? <Loader2 size={24} className="animate-spin" /> : 'Update Password'}
            </button>
          </form>
        ) : (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex flex-col items-center gap-6 py-8 text-center"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-500 shadow-inner">
              <CheckCircle size={40} />
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-2xl font-bold text-dark">Success!</h3>
              <p className="text-gray-500 font-medium italic">Redirecting you to login...</p>
            </div>
            <Link href="/auth/login" className="btn-primary py-3 px-8">Go to Login Now</Link>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
