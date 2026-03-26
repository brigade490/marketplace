'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  price_unit: string;
  stock_qty: number;
  is_active: boolean;
  images: string[];
  avg_rating: number;
  review_count: number;
  created_at: string;
}

export default function MyProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sellerId, setSellerId] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/buyer'); return; }

      const { data: seller } = await supabase.from('sellers').select('id').eq('user_id', user.id).single();
      if (!seller) { router.push('/become-seller'); return; }
      setSellerId(seller.id);

      const { data } = await supabase
        .from('products')
        .select('id, name, category, price, price_unit, stock_qty, is_active, images, avg_rating, review_count, created_at')
        .eq('seller_id', seller.id)
        .order('created_at', { ascending: false });

      setProducts((data as Product[]) || []);
      setLoading(false);
    }
    load();
  }, [router]);

  async function handleDelete(productId: string) {
    setDeletingId(productId);
    const supabase = createClient();
    await supabase.from('products').delete().eq('id', productId);
    setProducts(prev => prev.filter(p => p.id !== productId));
    setConfirmDeleteId(null);
    setDeletingId(null);
  }

  async function toggleActive(product: Product) {
    const supabase = createClient();
    await supabase.from('products').update({ is_active: !product.is_active }).eq('id', product.id);
    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, is_active: !p.is_active } : p));
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="text-gray-400 text-sm">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4" style={{ background: 'var(--bg)' }}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black>My Products</h1>
            <p className="text-sm text-gray-500 mt-0.5">{products.length} products listed</p>
          </div>
          <Link
            href="/add-product"
            className="px-5 py-2.5 text-sm font-bold text-white"
            style={{ background: 'var(--active-bg)', borderRadius: 'var(--radius-pill)' }}
          >
            + Add Product
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="bg-white text-center py-16" style={{ borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-raised)' }}>
            <div className="text-4xl mb-3">🏪</div>
            <h3 className="font-black  mb-2">No products yet</h3>
            <p className="text-gray-400 text-sm mb-6">Start by adding your first product listing.</p>
            <Link
              href="/add-product"
              className="inline-block px-6 py-3 text-sm font-bold text-white"
              style={{ background: 'var(--active-bg)', borderRadius: 'var(--radius-pill)' }}
            >
              Add Product
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {products.map(product => {
              const img = product.images?.[0];
              return (
                <div key={product.id} className="bg-white" style={{ borderRadius: 'var(--radius-sm)', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                  <div className="flex items-start gap-4 p-5">
                    {/* Image */}
                    <div
                      className="flex-shrink-0 flex items-center justify-center"
                      style={{ width: '80px', height: '80px', borderRadius: 'var(--radius-sm)', background: 'var(--bg)', overflow: 'hidden' }}
                    >
                      {img
                        ? <img src={img} alt={product.name} style={{ width: '80px', height: '80px', objectFit: 'cover' }} />
                        : <span className="text-3xl">📦</span>
                      }
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-bold>{product.name}</h3>
                          <p className="text-xs text-gray-500 mt-0.5">{product.category}</p>
                          <p className="text-sm font-black  mt-1">
                            ₹{product.price.toLocaleString('en-IN')} / {product.price_unit}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Stock: {product.stock_qty} · Rating: {product.avg_rating > 0 ? `★ ${product.avg_rating}` : 'No reviews'} ({product.review_count})
                          </p>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          {/* Active toggle */}
                          <button
                            onClick={() => toggleActive(product)}
                            className="text-xs px-3 py-1 font-semibold"
                            style={{
                              borderRadius: 'var(--radius-pill)',
                              background: product.is_active ? '#dcfce7' : '#fee2e2',
                              color: product.is_active ? '#166534' : '#991b1b',
                            }}
                          >
                            {product.is_active ? 'Active' : 'Inactive'}
                          </button>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3 mt-3">
                        <Link
                          href={`/products/${product.id}`}
                          className="text-xs font-semibold text-gray-600 hover:"
                        >
                          View
                        </Link>
                        <Link
                          href={`/add-product?edit=${product.id}`}
                          className="text-xs font-semibold
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => setConfirmDeleteId(product.id)}
                          className="text-xs font-semibold text-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {confirmDeleteId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={e => { if (e.target === e.currentTarget) setConfirmDeleteId(null); }}
        >
          <div className="bg-white p-8 text-center" style={{ borderRadius: 'var(--radius-md)', maxWidth: '360px', width: '100%' }}>
            <div className="text-3xl mb-3">🗑️</div>
            <h3 className="text-lg font-black  mb-2">Delete Product?</h3>
            <p className="text-sm text-gray-500 mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 py-3 text-sm font-semibold"
                style={{ boxShadow: 'var(--shadow-inset)', borderRadius: 'var(--radius-pill)', background: 'var(--surface)', color: 'var(--text-primary)' }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                disabled={deletingId === confirmDeleteId}
                className="flex-1 py-3 text-sm font-bold text-white"
                style={{ background: '#dc2626', borderRadius: 'var(--radius-pill)', opacity: deletingId ? 0.6 : 1 }}
              >
                {deletingId ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
