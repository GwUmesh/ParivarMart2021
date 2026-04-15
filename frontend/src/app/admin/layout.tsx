"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings, 
  Tags, 
  ChevronRight,
  LogOut,
  ArrowLeft
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAdmin, loading } = useAuth();

  useEffect(() => {
    if (!loading && !isAdmin) {
      import('react-hot-toast').then(({ toast }) => {
        toast.error("Access Denied: Admin credentials required.");
      });
      router.push('/auth/login?callbackUrl=/admin/dashboard');
    }
  }, [isAdmin, loading, router]);

  if (loading || !isAdmin) return <div className="py-20 text-center font-bold text-primary">Checking admin access...</div>;

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, href: '/admin/dashboard' },
    { id: 'orders', label: 'Orders', icon: <ShoppingCart size={20} />, href: '/admin/orders' },
    { id: 'products', label: 'Products', icon: <Package size={20} />, href: '/admin/products' },
    { id: 'categories', label: 'Categories', icon: <Tags size={20} />, href: '/admin/categories' },
    { id: 'promocodes', label: 'Promo Codes', icon: <Tags size={20} />, href: '/admin/promocodes' }, // Using Tags icon for now
    { id: 'settings', label: 'Store Settings', icon: <Settings size={20} />, href: '/admin/settings' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 pt-20">
      {/* Admin Sidebar */}
      <aside className="w-72 bg-white border-r border-gray-100 hidden lg:flex flex-col sticky top-20 h-[calc(100vh-80px)]">
        <div className="p-8 border-b border-gray-50">
          <h2 className="text-sm font-black uppercase tracking-widest text-gray-400">Admin Control</h2>
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-1">
          {menuItems.map(item => (
            <Link 
              key={item.id} 
              href={item.href}
              className={`flex items-center gap-4 p-4 rounded-xl font-bold transition-all ${pathname === item.href ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-500 hover:bg-primary/5 hover:text-primary'}`}
            >
              {item.icon}
              {item.label}
              {pathname === item.href && <ChevronRight size={16} className="ml-auto" />}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-50">
           <Link href="/" className="flex items-center gap-4 p-4 rounded-xl font-bold text-gray-500 hover:bg-gray-50">
             <ArrowLeft size={20} />
             Back to Shop
           </Link>
        </div>
      </aside>

      {/* Main Admin Content */}
      <main className="flex-1 p-6 lg:p-12 overflow-x-hidden">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
