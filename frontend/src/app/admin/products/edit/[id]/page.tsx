"use client";

import React, { useEffect, useState } from 'react';
import ProductForm from '@/components/admin/ProductForm';
import { Package, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import api from '@/lib/api';

interface Product {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  discountPrice?: number;
  category?: any;
  stock: number;
  unit: string;
  images: string[];
}

export default function EditProductPage() {
  const params = useParams();
  const id = params.id;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data);
      } catch (e) {
        console.error('Failed to fetch product', e);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-primary">
        <Loader2 className="animate-spin" size={48} />
        <p className="font-bold text-xl uppercase tracking-widest">Loading Product Details...</p>
      </div>
    );
  }

  if (!product) {
    return <div className="py-20 text-center font-bold text-red-500">Product not found</div>;
  }

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
            <h1 className="text-4xl font-black text-dark tracking-tighter uppercase">Edit <span className="text-primary">Product</span></h1>
            <p className="text-gray-500 font-medium">Update details for "{product.name}"</p>
          </div>
        </div>
      </div>

      <ProductForm initialData={product} isEdit />
    </div>
  );
}
