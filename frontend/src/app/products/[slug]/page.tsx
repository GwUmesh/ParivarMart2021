"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ShoppingCart, Star, Plus, Minus, ShieldCheck, Truck, RotateCcw, ChevronLeft } from 'lucide-react';
import api from '@/lib/api';
import { useCart } from '@/context/CartContext';
import ProductCard from '@/components/products/ProductCard';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function ProductDetails() {
  const { slug } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState('');
  const [reviews, setReviews] = useState<any[]>([]);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/products/${slug}`);
        setProduct(res.data);
        setMainImage(res.data.images?.[0] || '');
        
        // Fetch related products (same category)
        const relRes = await api.get(`/products?category=${res.data.category._id}&limit=4`);
        setRelatedProducts(relRes.data.products.filter((p: any) => p._id !== res.data._id));
        
        // Fetch reviews
        const revRes = await api.get(`/reviews/product/${res.data._id}`);
        setReviews(revRes.data.reviews);
      } catch (error) {
        console.error('Error fetching product', error);
        toast.error('Product not found');
        router.push('/products');
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchProduct();
  }, [slug]);

  if (loading) return <div className="container mx-auto px-4 py-20 text-center text-primary font-bold">Loading product details...</div>;
  if (!product) return null;

  const currentPrice = product.discountPrice > 0 ? product.discountPrice : product.price;
  const discount = Math.round(((product.price - currentPrice) / product.price) * 100);

  const handleAddToCart = () => {
    if (product.stock >= quantity) {
      addToCart(product, quantity);
      toast.success(`${quantity} ${product.unit}(s) added to cart`);
    } else {
      toast.error('Insufficient stock');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <button 
        onClick={() => router.back()} 
        className="flex items-center gap-2 text-gray-500 hover:text-primary mb-8 transition-colors group"
      >
        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        Back to Results
      </button>

      <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 mb-20">
        {/* Product Images */}
        <div className="flex flex-col gap-4">
          <div className="aspect-square rounded-[2rem] overflow-hidden border border-primary/10 shadow-xl bg-white relative">
            {discount > 0 && (
              <div className="absolute top-6 left-6 z-10 bg-red-500 text-white font-bold px-4 py-2 rounded-xl shadow-lg">
                SAVE {discount}%
              </div>
            )}
            <img 
              src={mainImage || 'https://via.placeholder.com/600?text=No+Image'} 
              alt={product.name} 
              className="w-full h-full object-cover p-8"
            />
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {product.images.map((img: string, i: number) => (
                <button 
                  key={i}
                  onClick={() => setMainImage(img)}
                  className={`w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all shrink-0 ${mainImage === img ? 'border-primary shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <img src={img} alt={`${product.name} ${i}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Summary */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex text-yellow-500">
              {[...Array(5)].map((_, i) => <Star key={i} size={18} fill={i < 4 ? "currentColor" : "none"} />)}
            </div>
            <span className="text-gray-500 text-sm">({reviews.length} Customer Reviews)</span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-bold text-dark">{product.name}</h1>
          <p className="text-primary font-bold text-lg">{product.category.name}</p>

          <div className="flex items-end gap-4 py-6 border-y border-primary/10 my-4">
            <div className="flex flex-col">
              {discount > 0 && (
                <span className="text-2xl text-gray-400 line-through">₹{product.price}</span>
              )}
              <span className="text-5xl font-bold text-primary">₹{currentPrice}</span>
            </div>
            <span className="text-gray-500 mb-2">per {product.unit}</span>
          </div>

          <p className="text-gray-600 leading-relaxed text-lg">
            {product.description || 'No description available for this product. Our premium selection ensures the highest quality for your family essentials.'}
          </p>

          <div className="flex flex-col gap-6 mt-4">
            {/* Quantity Selector */}
            <div className="flex items-center gap-6">
              <span className="font-bold text-dark uppercase tracking-wider text-sm">Quantity</span>
              <div className="flex items-center border border-primary/20 rounded-xl bg-gray-50 overflow-hidden">
                <button 
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="p-4 hover:bg-primary/10 text-primary transition-colors"
                >
                  <Minus size={18} />
                </button>
                <span className="w-12 text-center font-bold text-dark text-lg">{quantity}</span>
                <button 
                  onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                  className="p-4 hover:bg-primary/10 text-primary transition-colors"
                >
                  <Plus size={18} />
                </button>
              </div>
              <span className={`text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button 
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="flex-1 btn-primary py-5 flex items-center justify-center gap-3 text-xl disabled:bg-gray-300"
              >
                <ShoppingCart size={24} />
                Add to Cart
              </button>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-4 mt-10">
            <div className="flex flex-col items-center text-center gap-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <ShieldCheck size={24} />
              </div>
              <span className="text-[10px] sm:text-xs font-bold uppercase text-gray-500">100% Quality</span>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Truck size={24} />
              </div>
              <span className="text-[10px] sm:text-xs font-bold uppercase text-gray-500">Fast Delivery</span>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <RotateCcw size={24} />
              </div>
              <span className="text-[10px] sm:text-xs font-bold uppercase text-gray-500">Easy Return</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section Placeholder */}
      <section className="py-20 border-t border-primary/10">
        <h2 className="text-3xl font-bold text-dark mb-10">Customer Reviews</h2>
        {reviews.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-8">
            {reviews.map((review: any) => (
              <div key={review._id} className="p-6 bg-white rounded-2xl border border-primary/5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                      {review.user?.name[0]}
                    </div>
                    <div>
                      <p className="font-bold text-dark">{review.user?.name}</p>
                      <p className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex text-yellow-500">
                    {[...Array(5)].map((_, i) => <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} />)}
                  </div>
                </div>
                <p className="text-gray-600 italic">"{review.comment}"</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
          </div>
        )}
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="py-20">
          <h2 className="text-3xl font-bold text-dark mb-10">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {relatedProducts.map((p: any) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
