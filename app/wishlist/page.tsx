'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

interface WishlistItem {
  id: string;
  product_id: string;
  created_at: string;
  products: {
    id: string;
    name: string;
    category: string;
    price: number;
    price_unit: string;
    images: string[];
    avg_rating: number;
    sellers: { company_name: string } | null;
  } | null;
}

export default function WishlistPage() {
  const router = useRouter();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/buyer'); return; }

      const { data } = await supabase
        .from('wishlist')
        .select(`
          id, product_id, created_at,
          products (
            id, name, category, price, price_unit, images, avg_rating,
            sellers ( company_name )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setItems((data as WishlistItem[]) || []);
      setLoading(false);
    }
    load();
  }, [router]);

  async function handleRemove(itemId: string) {
    setRemoving(itemId);
    const supabase = createClient();
    await supabase.from('wishlist').delete().eq('id', itemId);
    setItems(prev => prev.filter(i => i.id !== itemId));
    setRemoving(null);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="text-gray-400 text-sm">Loading wishlist...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4" style={{ background: 'var(--bg)' }}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black>Saved / Wishlist</h1>
          <span className="text-sm text-gray-500">{items.length} saved</span>
        </div>

        {items.length === 0 ? (
          <div className="bg-white text-center py-16" style={{ borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-raised)' }}>
            <div className="text-4xl mb-3">❤️</div>
            <h3 className="font-black  mb-2">Your wishlist is empty</h3>
            <p className="text-gray-400 text-sm mb-6">Save products you're interested in to view them later.</p>
            <Link
              href="/products"
              className="inline-block px-6 py-3 text-sm font-bold text-white"
              style={{ background: 'var(--active-bg)', borderRadius: 'var(--radius-pill)' }}
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map(item => {
              const product = item.products;
              if (!product) return null;
              const img = product.images?.[0];

              return (
                <div key={item.id} className="bg-white" style={{ borderRadius: 'var(--radius-sm)', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                  <Link href={`/products/${product.id}`}>
                    <div
                      className="flex items-center justify-center"
                      style={{ width: '100%', height: '180px', background: 'var(--bg)', overflow: 'hidden' }}
                    >
                      {img
                        ? <img src={img} alt={product.name} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                        : <span className="text-4xl">📦</span>
                      }
                    </div>
                  </Link>

                  <div className="p-4">
                    <Link href={`/products/${product.id}`}>
                      <h3 className="font-bold  text-sm hover:underline line-clamp-2">{product.name}</h3>
                    </Link>
                    <p className="text-xs text-gray-500 mt-0.5">{product.sellers?.company_name || ''}</p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="font-black  text-base">
                        ₹{product.price.toLocaleString('en-IN')}<span className="text-xs font-normal text-gray-500">/{product.price_unit}</span>
                      </p>
                      {product.avg_rating > 0 && (
                        <span className="text-xs text-gray-500">★ {product.avg_rating.toFixed(1)}</span>
                      )}
                    </div>

                    <div className="flex gap-2 mt-3">
                      <Link
                        href={`/products/${product.id}`}
                        className="flex-1 py-2 text-xs font-bold text-white text-center"
                        style={{ background: 'var(--active-bg)', borderRadius: 'var(--radius-pill)' }}
                      >
                        View Product
                      </Link>
                      <button
                        onClick={() => handleRemove(item.id)}
                        disabled={removing === item.id}
                        className="px-3 py-2 text-xs font-semibold"
                        style={{ boxShadow: 'var(--shadow-inset)', borderRadius: 'var(--radius-pill)', background: 'var(--surface)', color: '#dc2626', opacity: removing === item.id ? 0.6 : 1 }}
                      >
                        {removing === item.id ? '...' : '✕'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
