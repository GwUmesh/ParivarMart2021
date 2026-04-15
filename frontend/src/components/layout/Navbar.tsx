"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart, User, Search, Menu, X, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

import { useRouter } from 'next/navigation';

const Navbar = () => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout, isAdmin } = useAuth();
  const { totalItems } = useCart();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsMenuOpen(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'glass-dark py-2 shadow-lg' : 'bg-transparent py-4'}`}>
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
            <span className="text-white font-bold text-xl">P</span>
          </div>
          <span className={`text-2xl font-bold tracking-tight ${isScrolled ? 'text-white' : 'text-dark'}`}>
            Parivar<span className="text-primary">Mart</span>
          </span>
        </Link>

        {/* Desktop Search */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8 relative">
          <input
            type="text"
            placeholder="Search groceries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full rounded-full py-2 px-6 pr-12 focus:outline-none focus:ring-2 focus:ring-primary backdrop-blur-md transition-all duration-300 border ${isScrolled
              ? 'bg-white/10 border-white/20 text-white placeholder:text-gray-400'
              : 'bg-primary/5 border-primary/20 text-dark placeholder:text-gray-500'
              }`}
          />
          <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-primary hover:scale-110 transition-transform">
            <Search size={20} />
          </button>
        </form>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-8">
          <Link href="/products" className={`font-medium hover:text-primary transition-colors ${isScrolled ? 'text-white/80' : 'text-dark/80'}`}>Products</Link>
          <div className="flex items-center gap-6 border-l border-primary/20 pl-8">
            <Link href="/cart" className="relative group">
              <ShoppingCart className={`${isScrolled ? 'text-white' : 'text-dark'} group-hover:text-primary transition-colors`} />
              {totalItems > 0 && (
                <span className="absolute -top-3 -right-3 bg-primary text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-bounce">
                  {totalItems}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center gap-4">
                <Link href="/profile" className="flex items-center gap-2 group">
                  {user.profilePic ? (
                    <img src={user.profilePic} alt={user.name} className="w-8 h-8 rounded-full border-2 border-primary" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                      {user.name[0]}
                    </div>
                  )}
                </Link>
                {isAdmin && (
                  <Link href="/admin/dashboard" title="Admin Dashboard">
                    <LayoutDashboard className={`${isScrolled ? 'text-white/80' : 'text-dark/80'} hover:text-primary transition-colors`} size={20} />
                  </Link>
                )}
                <button onClick={logout} title="Logout">
                  <LogOut className={`${isScrolled ? 'text-white/80' : 'text-dark/80'} hover:text-red-500 transition-colors pointer-cursor`} size={20} />
                </button>
              </div>
            ) : (
              <Link href="/auth/login" className="btn-primary flex items-center gap-2">
                <User size={18} />
                <span>Login</span>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Toggle */}
        <button className="lg:hidden text-primary" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-dark border-t border-primary/20 overflow-hidden"
          >
            <div className="container mx-auto px-4 py-8 flex flex-col gap-6">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Search groceries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-full py-3 px-6 pr-12 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-primary">
                  <Search size={22} />
                </button>
              </form>

              <Link href="/products" className="text-white text-xl font-medium" onClick={() => setIsMenuOpen(false)}>Products</Link>
              <Link href="/cart" className="text-white text-xl font-medium" onClick={() => setIsMenuOpen(false)}>Cart ({totalItems})</Link>
              {user ? (
                <>
                  <Link href="/profile" className="text-white text-xl font-medium" onClick={() => setIsMenuOpen(false)}>Profile</Link>
                  {isAdmin && <Link href="/admin/dashboard" className="text-primary text-xl font-medium" onClick={() => setIsMenuOpen(false)}>Admin Dashboard</Link>}
                  <button onClick={() => { logout(); setIsMenuOpen(false); }} className="text-red-400 text-xl font-medium text-left">Logout</button>
                </>
              ) : (
                <Link href="/auth/login" className="text-primary text-xl font-medium" onClick={() => setIsMenuOpen(false)}>Login</Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
