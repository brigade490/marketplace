'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const CATEGORIES = [
  'Agriculture & Food', 'Chemicals', 'Construction', 'Electronics', 'Furniture',
  'Industrial Machinery', 'Metals & Alloys', 'Packaging', 'Pharmaceuticals',
  'Plastics & Rubber', 'Textiles & Garments', 'Other',
];

export default function AddProductPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const fileRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [sellerId, setSellerId] = useState('');

  const [form, setForm] = useState({
    name: '',
    category: '',
    price: '',
    price_unit: 'unit',
    min_order_qty: '1',
    min_order_unit: 'units',
    description: '',
    stock_qty: '0',
    location: '',
    is_active: true,
    tags: '',
  });
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/buyer'); return; }

      const { data: seller } = await supabase.from('sellers').select('id').eq('user_id', user.id).single();
      if (!seller) { router.push('/become-seller'); return; }
      setSellerId(seller.id);

      if (editId) {
        const { data: product } = await supabase.from('products').select('*').eq('id', editId).single();
        if (product) {
          setForm({
            name: product.name || '',
            category: product.category || '',
            price: String(product.price || ''),
            price_unit: product.price_unit || 'unit',
            min_order_qty: String(product.min_order_qty || 1),
            min_order_unit: product.min_order_unit || 'units',
            description: product.description || '',
            stock_qty: String(product.stock_qty || 0),
            location: product.location || '',
            is_active: product.is_active ?? true,
            tags: (product.tags || []).join(', '),
          });
          setImages(product.images || []);
        }
      }
      setLoading(false);
    }
    load();
  }, [router, editId]);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    if (images.length + files.length > 5) { setError('Maximum 5 images allowed'); return; }

    setUploading(true);
    setError('');
    const supabase = createClient();
    const uploadedUrls: string[] = [];

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) { setError('Each image must be under 5MB'); continue; }
      const ext = file.name.split('.').pop();
      const path = `products/${sellerId}-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: upErr } = await supabase.storage.from('uploads').upload(path, file);
      if (upErr) { setError('Upload failed: ' + upErr.message); continue; }
      const { data: { publicUrl } } = supabase.storage.from('uploads').getPublicUrl(path);
      uploadedUrls.push(publicUrl);
    }

    setImages(prev => [...prev, ...uploadedUrls]);
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  }

  function removeImage(idx: number) {
    setImages(prev => prev.filter((_, i) => i !== idx));
  }

  function set(key: string, val: string | boolean) { setForm(f => ({ ...f, [key]: val })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setError('Product name is required'); return; }
    if (!form.category) { setError('Please select a category'); return; }
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) {
      setError('Please enter a valid price');
      return;
    }

    setSaving(true);
    setError('');
    const supabase = createClient();

    const payload = {
      seller_id: sellerId,
      name: form.name.trim(),
      category: form.category,
      price: Number(form.price),
      price_unit: form.price_unit.trim() || 'unit',
      min_order_qty: Number(form.min_order_qty) || 1,
      min_order_unit: form.min_order_unit.trim() || 'units',
      description: form.description.trim() || null,
      stock_qty: Number(form.stock_qty) || 0,
      location: form.location.trim() || null,
      is_active: form.is_active,
      images,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
    };

    let err;
    if (editId) {
      ({ error: err } = await supabase.from('products').update(payload).eq('id', editId));
    } else {
      ({ error: err } = await supabase.from('products').insert(payload));
    }

    if (err) { setError(err.message); setSaving(false); return; }
    router.push('/my-products');
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f7f7f8' }}>
        <div className="text-gray-400 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4" style={{ background: '#f7f7f8' }}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-black text-black mb-6">{editId ? 'Edit Product' : 'Add New Product'}</h1>

        <div className="bg-white" style={{ borderRadius: '16px', padding: '36px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
          <form onSubmit={handleSubmit} className="space-y-5">
            <Field label="Product Name *" value={form.name} onChange={v => set('name', v)} placeholder="e.g. Stainless Steel Rods 304 Grade" required />

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Category *</label>
              <select
                value={form.category}
                onChange={e => set('category', e.target.value)}
                required
                className="w-full px-4 py-3 text-sm text-black outline-none"
                style={{ border: '1.5px solid #e5e7eb', borderRadius: '10px', background: '#fff' }}
              >
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Price */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Price (₹) *" value={form.price} onChange={v => set('price', v)} placeholder="e.g. 5000" type="number" required />
              <Field label="Price Unit" value={form.price_unit} onChange={v => set('price_unit', v)} placeholder="e.g. kg, meter, unit" />
            </div>

            {/* MOQ */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Min. Order Qty" value={form.min_order_qty} onChange={v => set('min_order_qty', v)} placeholder="e.g. 100" type="number" />
              <Field label="MOQ Unit" value={form.min_order_unit} onChange={v => set('min_order_unit', v)} placeholder="e.g. kg, pieces" />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Description</label>
              <textarea
                value={form.description}
                onChange={e => set('description', e.target.value)}
                placeholder="Describe your product, specifications, and key features..."
                rows={4}
                className="w-full px-4 py-3 text-sm text-black placeholder-gray-400 outline-none resize-none"
                style={{ border: '1.5px solid #e5e7eb', borderRadius: '10px' }}
                onFocus={e => (e.currentTarget.style.borderColor = '#000')}
                onBlur={e => (e.currentTarget.style.borderColor = '#e5e7eb')}
              />
            </div>

            {/* Stock & Location */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Stock Quantity" value={form.stock_qty} onChange={v => set('stock_qty', v)} placeholder="e.g. 500" type="number" />
              <Field label="Location" value={form.location} onChange={v => set('location', v)} placeholder="e.g. Mumbai, Maharashtra" />
            </div>

            {/* Tags */}
            <Field label="Tags (comma separated)" value={form.tags} onChange={v => set('tags', v)} placeholder="e.g. steel, industrial, bulk" />

            {/* Images */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Product Images ({images.length}/5)
              </label>
              <div className="flex flex-wrap gap-3 mb-3">
                {images.map((url, idx) => (
                  <div key={idx} className="relative" style={{ width: '80px', height: '80px' }}>
                    <img src={url} alt="" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute -top-1 -right-1 flex items-center justify-center text-white text-xs font-bold"
                      style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#dc2626' }}
                    >
                      ×
                    </button>
                  </div>
                ))}
                {images.length < 5 && (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="flex flex-col items-center justify-center text-gray-400 text-xs gap-1"
                    style={{ width: '80px', height: '80px', border: '2px dashed #e5e7eb', borderRadius: '8px', background: '#fafafa' }}
                  >
                    {uploading ? '...' : (<><span className="text-2xl">+</span><span>Upload</span></>)}
                  </button>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
              <p className="text-xs text-gray-400">JPG/PNG, max 5MB each, up to 5 images</p>
            </div>

            {/* Active toggle */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => set('is_active', !form.is_active)}
                className="flex items-center gap-2 text-sm font-semibold"
              >
                <div
                  className="relative"
                  style={{
                    width: '44px', height: '24px', borderRadius: '999px',
                    background: form.is_active ? '#000000' : '#e5e7eb',
                    transition: 'background 0.2s',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute', top: '3px',
                      left: form.is_active ? '23px' : '3px',
                      width: '18px', height: '18px',
                      borderRadius: '50%', background: '#fff',
                      transition: 'left 0.2s',
                    }}
                  />
                </div>
                <span className="text-gray-700">List as Active</span>
              </button>
            </div>

            {error && <p className="text-xs text-red-600 bg-red-50 px-3 py-2" style={{ borderRadius: '8px' }}>{error}</p>}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => router.push('/my-products')}
                className="flex-1 py-3 text-sm font-semibold"
                style={{ border: '1.5px solid #e5e7eb', borderRadius: '999px', background: '#fff', color: '#111827' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || uploading}
                className="flex-1 py-3 text-sm font-bold text-white"
                style={{ background: '#000000', borderRadius: '999px', opacity: saving ? 0.6 : 1 }}
              >
                {saving ? 'Saving...' : editId ? 'Update Product' : 'Add Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({
  label, value, onChange, placeholder, required, type = 'text',
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; required?: boolean; type?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-700 mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        min={type === 'number' ? '0' : undefined}
        step={type === 'number' ? 'any' : undefined}
        className="w-full px-4 py-3 text-sm text-black placeholder-gray-400 outline-none"
        style={{ border: '1.5px solid #e5e7eb', borderRadius: '10px' }}
        onFocus={e => (e.currentTarget.style.borderColor = '#000')}
        onBlur={e => (e.currentTarget.style.borderColor = '#e5e7eb')}
      />
    </div>
  );
}
