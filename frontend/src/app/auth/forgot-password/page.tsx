"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/users/forgot-password', { email });
      setSubmitted(true);
      toast.success('Reset link sent to your email');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card max-w-md w-full p-8 sm:p-12 bg-white flex flex-col gap-8 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-primary" />
        
        <div className="flex flex-col gap-3">
          <Link href="/auth/login" className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-primary transition-all w-fit group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Login
          </Link>
          <h1 className="text-4xl font-black text-dark tracking-tighter uppercase mt-2">Forgot <span className="text-primary">Password</span></h1>
          <p className="text-gray-500 font-medium leading-relaxed">
            {submitted 
              ? 'Please check your email for the reset link. Don\'t forget to check your spam folder.' 
              : 'Don\'t worry! It happens. Enter the email associated with your account to receive a reset link.'}
          </p>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
                <input 
                  required
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="input-field pl-12"
                />
              </div>
            </div>

            <button 
              disabled={loading}
              type="submit" 
              className="btn-primary py-5 text-lg flex items-center justify-center gap-3 shadow-xl shadow-primary/20"
            >
              {loading ? <Loader2 size={24} className="animate-spin" /> : 'Send Reset Link'}
            </button>
          </form>
        ) : (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center gap-6 py-8 text-center"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-500 shadow-inner">
              <CheckCircle size={40} />
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-2xl font-bold text-dark">Email Sent!</h3>
              <p className="text-gray-500 font-medium">Reset instructions are on their way to <span className="text-dark font-bold">{email}</span></p>
            </div>
            <button 
              onClick={() => setSubmitted(false)}
              className="text-primary font-bold hover:underline"
            >
              Didn't receive code? Try again
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
