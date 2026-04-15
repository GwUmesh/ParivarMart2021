import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Tag, 
  DollarSign, 
  Layout, 
  Image as ImageIcon, 
  Type, 
  Save, 
  X,
  Plus,
  Minus,
  Check
} from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

interface ProductFormProps {
  initialData?: any;
  isEdit?: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({ initialData, isEdit }) => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: 0,
    discountPrice: 0,
    category: '',
    stock: 0,
    unit: 'kg',
    images: [''],
    isFeatured: false
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res.data);
      } catch (e) {
        console.error('Failed to fetch categories', e);
      }
    };
    fetchCategories();

    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as any;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              type === 'number' ? parseFloat(value) : value
    }));
  };

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData(prev => ({ ...prev, images: newImages }));
  };

  const addImageField = () => {
    setFormData(prev => ({ ...prev, images: [...prev.images, ''] }));
  };

  const removeImageField = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, images: newImages.length ? newImages : [''] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/products/${initialData._id}`, formData);
        toast.success('Product updated successfully!');
      } else {
        await api.post('/products', formData);
        toast.success('Product created successfully!');
        setFormData({
          name: '', slug: '', description: '', price: 0, discountPrice: 0,
          category: '', stock: 0, unit: 'kg', images: [''], isFeatured: false
        });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-10 max-w-5xl mx-auto pb-20">
      <div className="grid lg:grid-cols-2 gap-10">
        {/* Left Column: Basic Info */}
        <div className="flex flex-col gap-8">
          <div className="card p-8 bg-white flex flex-col gap-6">
            <h3 className="text-xl font-bold text-dark flex items-center gap-2">
              <Type size={20} className="text-primary" /> Basic Information
            </h3>
            
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Product Name *</label>
              <input 
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Fresh Organic Apples"
                className="input-field"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400">URL Slug *</label>
              <input 
                required
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                placeholder="e.g. fresh-organic-apples"
                className="input-field"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Description</label>
              <textarea 
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the product quality, origin, benefits..."
                className="input-field py-4 min-h-[120px]"
              />
            </div>
          </div>

          <div className="card p-8 bg-white flex flex-col gap-6">
            <h3 className="text-xl font-bold text-dark flex items-center gap-2">
              <DollarSign size={20} className="text-primary" /> Pricing & Inventory
            </h3>
            
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Regular Price (₹) *</label>
                <input 
                  required
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Discount Price (₹)</label>
                <input 
                  type="number"
                  name="discountPrice"
                  value={formData.discountPrice}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Stock Quantity *</label>
                <input 
                  required
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Unit (kg, g, pc, etc)</label>
                <input 
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Organization & Images */}
        <div className="flex flex-col gap-8">
          <div className="card p-8 bg-white flex flex-col gap-6">
            <h3 className="text-xl font-bold text-dark flex items-center gap-2">
              <Layout size={20} className="text-primary" /> Categorization
            </h3>
            
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Category *</label>
              <select 
                required
                name="category"
                value={(formData.category as any)?._id || formData.category}
                onChange={handleChange}
                className="input-field"
              >
                <option value="">Select a category</option>
                {categories.map((cat: any) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <label className="flex items-center gap-3 cursor-pointer group p-4 rounded-2xl border-2 border-dashed border-gray-100 hover:border-primary/30 transition-all hover:bg-primary/5">
              <div className={`w-6 h-6 rounded flex items-center justify-center border-2 transition-all ${formData.isFeatured ? 'bg-primary border-primary text-white' : 'border-gray-200 group-hover:border-primary/50'}`}>
                {formData.isFeatured && <Check size={14} />}
              </div>
              <input 
                type="checkbox"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                className="hidden"
              />
              <span className="font-bold text-gray-600">Featured Product (Show on homepage)</span>
            </label>
          </div>

          <div className="card p-8 bg-white flex flex-col gap-6">
            <h3 className="text-xl font-bold text-dark flex items-center gap-2">
              <ImageIcon size={20} className="text-primary" /> Product Images
            </h3>
            
            <div className="flex flex-col gap-4">
              {formData.images.map((img, i) => (
                <div key={i} className="flex gap-2">
                  <div className="relative flex-1">
                    <input 
                      required
                      placeholder="Paste Image URL here..."
                      value={img}
                      onChange={(e) => handleImageChange(i, e.target.value)}
                      className="input-field pr-12"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg overflow-hidden bg-gray-50 border border-gray-200">
                      {img && <img src={img} alt="" className="w-full h-full object-cover" />}
                    </div>
                  </div>
                  {formData.images.length > 1 && (
                    <button 
                      type="button"
                      onClick={() => removeImageField(i)}
                      className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <X size={20} />
                    </button>
                  )}
                </div>
              ))}
              <button 
                type="button"
                onClick={addImageField}
                className="flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-100 rounded-2xl text-gray-400 font-bold hover:border-primary/30 hover:text-primary transition-all"
              >
                <Plus size={18} /> Add More Images
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 mt-8">
        <button 
          type="button"
          onClick={() => window.history.back()}
          className="px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-gray-400 hover:text-dark hover:bg-gray-100 transition-all"
        >
          Cancel
        </button>
        <button 
          disabled={loading}
          type="submit"
          className="btn-primary py-5 px-16 text-xl flex items-center justify-center gap-3 shadow-2xl shadow-primary/30 min-w-[280px]"
        >
          {loading ? 'Saving...' : <><Save size={24} /> {isEdit ? 'Update Product' : 'Create Product'}</>}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
