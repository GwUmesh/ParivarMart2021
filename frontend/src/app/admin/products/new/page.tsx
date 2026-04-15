"use client";

import React from 'react';
import ProductForm from '@/components/admin/ProductForm';
import { Package, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewProductPage() {
  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-4">
        <Link 
          href="/admin/products" 
          className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-primary transition-all w-fit group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Inventory
        </Link>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-inner">
            <Package size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-black text-dark tracking-tighter uppercase">Add New <span className="text-primary">Product</span></h1>
            <p className="text-gray-500 font-medium">Create a new entry in your supermarket catalog.</p>
          </div>
        </div>
      </div>

      <ProductForm />
    </div>
  );
}
