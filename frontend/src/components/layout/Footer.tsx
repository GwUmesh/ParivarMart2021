import React from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin, Instagram, Facebook, X } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-dark text-white pt-20 pb-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="flex flex-col gap-6">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">P</span>
              </div>
              <span className="text-2xl font-bold tracking-tight">ParivarMart</span>
            </Link>
            <p className="text-gray-400 leading-relaxed">
              Your Family's Trusted Store Since 2021. Providing fast, reliable, and premium grocery shopping experience.
            </p>
            <div className="flex items-center gap-4">
              <a href="https://instagram.com/parivar_mart_2021/" target="_blank" rel="noopener noreferrer" className="p-2 border border-primary/20 rounded-full hover:bg-primary transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="p-2 border border-primary/20 rounded-full hover:bg-primary transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="p-2 border border-primary/20 rounded-full hover:bg-primary transition-colors">
                <X size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-6 border-b border-primary/20 pb-2 inline-block">Quick Links</h4>
            <ul className="flex flex-col gap-4">
              <li><Link href="/products" className="text-gray-400 hover:text-primary transition-colors">Shop All Products</Link></li>
              <li><Link href="/#offers" className="text-gray-400 hover:text-primary transition-colors">Special Offers</Link></li>
              <li><Link href="/profile" className="text-gray-400 hover:text-primary transition-colors">My Account</Link></li>
              <li><Link href="/cart" className="text-gray-400 hover:text-primary transition-colors">Shopping Cart</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-lg font-bold mb-6 border-b border-primary/20 pb-2 inline-block">Categories</h4>
            <ul className="flex flex-col gap-4">
              <li><Link href="/products?category=oils" className="text-gray-400 hover:text-primary transition-colors">Oils & Ghee</Link></li>
              <li><Link href="/products?category=biscuits" className="text-gray-400 hover:text-primary transition-colors">Biscuits & Snacks</Link></li>
              <li><Link href="/products?category=beverages" className="text-gray-400 hover:text-primary transition-colors">Beverages</Link></li>
              <li><Link href="/products?category=household" className="text-gray-400 hover:text-primary transition-colors">Household Items</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-bold mb-6 border-b border-primary/20 pb-2 inline-block">Contact Us</h4>
            <ul className="flex flex-col gap-4 text-gray-400">
              <li className="flex items-start gap-3">
                <MapPin className="text-primary shrink-0" size={20} />
                <span>Parade Corner, Rasayani, Raigad – 410220, Maharashtra, India</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="text-primary shrink-0" size={20} />
                <span>+91 7021716914</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="text-primary shrink-0" size={20} />
                <span>parivarmart399@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-primary/10 text-center text-gray-500 text-sm">
          <p>© 2026 Parivar Mart. All rights reserved. Designed for excellence.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
