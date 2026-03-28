'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

interface Product {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  price: number | null;
  min_qty: number | null;
  unit: string | null;
  sellers: { company_name: string | null } | null;
}

function SearchResults() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') ?? '';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (!q.trim()) { setProducts([]); setSearched(false); return; }
    setLoading(true);
    setSearched(false);
    const supabase = createClient();
    supabase
      .from('products')
      .select('id, name, description, category, price, min_qty, unit, sellers(company_name)')
      .or(`name.ilike.%${q}%,description.ilike.%${q}%`)
      .eq('is_active', true)
      .order('name')
      .limit(48)
      .then(({ data }) => {
        setProducts((data as unknown as Product[]) ?? []);
        setLoading(false);
        setSearched(true);
      });
  }, [q]);

  const emojis: Record<string, string> = {
    Packaging: '📦', Electronics: '⚡', Industrial: '⚙️',
    'Office Supplies': '🖊️', 'Raw Materials': '🪨', Construction: '🏗️',
    'Textile & Fabric': '🧵', 'Food & Agriculture': '🌾',
    Chemicals: '🧪', 'Automobile Parts': '🔧', Others: '📋',
  };

  return (
    <div className="min-h-screen py-10 px-4" style={{ background: 'var(--bg)' }}>
      <div className="max-w-screen-xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          {q ? (
            <>
              <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>Search results for</p>
              <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>"{q}"</h1>
              {searched && !loading && (
                <p className="text-sm mt-1" style={{ color: 'var(--text-inactive)' }}>
                  {products.length === 0 ? 'No products found' : `${products.length} product${products.length !== 1 ? 's' : ''} found`}
                </p>
              )}
            </>
          ) : (
            <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>Search Products</h1>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{ height: 280, background: 'var(--surface)', borderRadius: '20px', boxShadow: '4px 4px 12px rgba(140,140,152,0.2), -4px -4px 12px rgba(255,255,255,0.85)', opacity: 0.6 }} />
            ))}
          </div>
        )}

        {/* No results */}
        {searched && !loading && products.length === 0 && (
          <div
            className="text-center py-24"
            style={{ background: 'var(--surface)', borderRadius: '24px', boxShadow: '4px 4px 12px rgba(140,140,152,0.2), -4px -4px 12px rgba(255,255,255,0.85)' }}
          >
            <div className="text-5xl mb-4">🔍</div>
            <h2 className="text-xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>No results found</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-inactive)' }}>
              No products match "{q}". Try a different search term.
            </p>
            <Link
              href="/products"
              className="inline-block px-6 py-3 text-sm font-semibold"
              style={{ background: 'var(--active-bg)', color: '#fff', borderRadius: 'var(--radius-pill)', boxShadow: 'var(--shadow-active)' }}
            >
              Browse All Products
            </Link>
          </div>
        )}

        {/* Empty state — no query */}
        {!q && !loading && (
          <div
            className="text-center py-24"
            style={{ background: 'var(--surface)', borderRadius: '24px', boxShadow: '4px 4px 12px rgba(140,140,152,0.2), -4px -4px 12px rgba(255,255,255,0.85)' }}
          >
            <div className="text-5xl mb-4">🔍</div>
            <h2 className="text-xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>Search for products</h2>
            <p className="text-sm" style={{ color: 'var(--text-inactive)' }}>Use the search bar above to find products.</p>
          </div>
        )}

        {/* Results grid */}
        {!loading && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => {
              const emoji = emojis[product.category ?? ''] ?? '📦';
              return (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="block group"
                  style={{
                    background: '#ffffff',
                    borderRadius: '20px',
                    boxShadow: '4px 4px 12px rgba(140,140,152,0.2), -4px -4px 12px rgba(255,255,255,0.85)',
                    transition: 'transform 0.22s cubic-bezier(0.4,0,0.2,1)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-3px)'}
                  onMouseLeave={(e) => (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)'}
                >
                  <div style={{ borderRadius: '20px', overflow: 'hidden' }}>
                    {/* Image placeholder */}
                    <div
                      className="flex items-center justify-center"
                      style={{ height: '160px', background: '#ffffff', fontSize: '52px', borderRadius: '20px 20px 0 0' }}
                    >
                      {emoji}
                    </div>

                    {/* Content */}
                    <div style={{ padding: '14px 16px 18px', background: '#ffffff' }}>
                      {product.category && (
                        <span
                          className="text-xs font-semibold"
                          style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}
                        >
                          {product.category}
                        </span>
                      )}
                      <h3
                        className="text-sm font-bold mt-0.5 mb-1 line-clamp-2"
                        style={{ color: 'var(--text-primary)', lineHeight: 1.35 }}
                      >
                        {product.name}
                      </h3>
                      {product.sellers?.company_name && (
                        <p className="text-xs mb-2 truncate" style={{ color: 'var(--text-inactive)' }}>{product.sellers.company_name}</p>
                      )}
                      <div className="flex items-baseline gap-2">
                        {product.price != null ? (
                          <span className="text-base font-black" style={{ color: 'var(--text-primary)' }}>
                            ₹{product.price.toLocaleString('en-IN')}
                          </span>
                        ) : (
                          <span className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Price on request</span>
                        )}
                        {product.unit && (
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>/{product.unit}</span>
                        )}
                      </div>
                      {product.min_qty != null && (
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-inactive)' }}>Min: {product.min_qty} {product.unit ?? 'units'}</p>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchResults />
    </Suspense>
  );
}
