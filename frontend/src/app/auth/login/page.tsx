"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, LogIn, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, user, googleLogin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      setLoading(true);
      await googleLogin(credentialResponse.credential);
      toast.success('Login successful!');
      router.push(redirect);
    } catch (err: any) {
      toast.error(err.message || 'Google login failed');
    } finally {
      setLoading(false);
    }
  };

  const redirect = searchParams.get('redirect') || '/';

  useEffect(() => {
    if (user) {
      router.push(redirect);
    }
  }, [user, router, redirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(formData.email, formData.password);
      toast.success('Welcome back to Parivar Mart!');
      router.push(redirect);
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-premium flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="card p-10 flex flex-col gap-8 shadow-2xl relative overflow-hidden bg-white">
          {/* Top accent bar */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary to-accent" />
          {/* Abstract background */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-full -ml-12 -mb-12 blur-xl" />

          <div className="flex flex-col items-center text-center gap-2">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white text-3xl font-black mb-4 shadow-lg rotate-3">P</div>
            <h1 className="text-3xl font-black text-dark tracking-tight">Login to <span className="text-primary">Parivar Mart</span></h1>
            <p className="text-gray-500">Welcome back! Please enter your details.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="relative">
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

            <div className="flex justify-end">
              <Link href="/auth/forgot-password" title="Coming soon!" className="text-sm text-primary font-bold hover:underline">Forgot password?</Link>
            </div>

            <button 
              disabled={loading}
              type="submit" 
              className="btn-primary py-4 text-lg font-bold flex items-center justify-center gap-2 shadow-xl shadow-primary/20 mt-2"
            >
              {loading ? 'Logging in...' : 'Sign In'} <ArrowRight size={20} />
            </button>
          </form>

          <div className="relative flex items-center justify-center py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <span className="relative bg-white px-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Or Continue With</span>
          </div>

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error('Login Failed')}
              theme="outline"
              size="large"
              shape="pill"
            />
          </div>

          <p className="text-center text-gray-500 font-medium">
            Don't have an account? <Link href="/auth/signup" className="text-primary font-bold hover:underline">Create one</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-20 text-center">Loading login page...</div>}>
      <LoginContent />
    </Suspense>
  );
}
