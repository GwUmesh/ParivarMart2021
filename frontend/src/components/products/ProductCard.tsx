"use client";

import React from 'react';
import Link from 'next/link';
import { ShoppingCart, Star } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { getImageUrl } from '@/lib/utils';

interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    slug: string;
    price: number;
    discountPrice?: number;
    images: string[];
    unit: string;
    stock: number;
  };
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  
  const discount = product.discountPrice && product.discountPrice > 0 
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const currentPrice = product.discountPrice && product.discountPrice > 0 
    ? product.discountPrice 
    : product.price;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock > 0) {
      addToCart(product, 1);
      toast.success(`${product.name} added to cart!`);
    } else {
      toast.error('Out of stock');
    }
  };

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="card group relative flex flex-col h-full bg-white transition-colors duration-300"
    >
      {/* Badge */}
      {discount > 0 && (
        <div className="absolute top-4 left-4 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-md">
          {discount}% OFF
        </div>
      )}

      {/* Image */}
      <Link href={`/products/${product.slug}`} className="block overflow-hidden h-48 sm:h-64 relative">
        <img 
          src={getImageUrl(product.images?.[0])} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex items-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={12} className={i < 4 ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} />
          ))}
          <span className="text-[10px] text-gray-500 ml-1">(12)</span>
        </div>

        <Link href={`/products/${product.slug}`}>
          <h3 className="text-dark font-bold text-lg mb-1 group-hover:text-primary transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>
        <p className="text-gray-500 text-sm mb-4">Per {product.unit}</p>

        <div className="mt-auto flex items-center justify-between">
          <div className="flex flex-col">
            {discount > 0 && (
              <span className="text-gray-400 line-through text-xs">₹{product.price}</span>
            )}
            <span className="text-primary font-bold text-xl">₹{currentPrice}</span>
          </div>

          <button 
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className={`p-3 rounded-full shadow-md transition-all duration-300 active:scale-90 ${
              product.stock > 0 
                ? 'bg-primary text-white hover:bg-primary-hover hover:rotate-6' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <ShoppingCart size={20} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
