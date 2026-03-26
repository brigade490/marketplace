'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

interface Order {
  id: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  currency: string;
  status: string;
  created_at: string;
  products: { name: string; images: string[] } | null;
  sellers: { company_name: string } | null;
}

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  Pending:   { bg: '#fef9c3', color: '#854d0e' },
  Confirmed: { bg: '#dbeafe', color: '#1e40af' },
  Shipped:   { bg: '#e0e7ff', color: '#3730a3' },
  Delivered: { bg: '#dcfce7', color: '#166534' },
  Cancelled: { bg: '#fee2e2', color: '#991b1b' },
};

export default function MyOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [buyerId, setBuyerId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/buyer'); return; }

      const { data: buyer } = await supabase.from('buyers').select('id').eq('user_id', user.id).single();
      if (!buyer) {
        const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
        if (profile?.role === 'seller') { router.push('/orders-received'); return; }
        setLoading(false);
        return;
      }
      setBuyerId(buyer.id);

      const { data } = await supabase
        .from('orders')
        .select(`
          id, quantity, unit_price, total_amount, currency, status, created_at,
          products ( name, images ),
          sellers ( company_name )
        `)
        .eq('buyer_id', buyer.id)
        .order('created_at', { ascending: false });

      setOrders((data as Order[]) || []);
      setLoading(false);
    }
    load();
  }, [router]);

  const filtered = statusFilter === 'All' ? orders : orders.filter(o => o.status === statusFilter);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="text-gray-400 text-sm">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4" style={{ background: 'var(--bg)' }}>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black text-black">My Orders</h1>
          <span className="text-sm text-gray-500">{orders.length} total</span>
        </div>

        {/* Status filter */}
        <div className="flex gap-2 flex-wrap mb-6">
          {['All', 'Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className="px-4 py-1.5 text-sm font-semibold transition-colors"
              style={{
                borderRadius: 'var(--radius-pill)',
                background: statusFilter === s ? '#000000' : 'var(--surface)',
                color: statusFilter === s ? 'var(--surface)' : 'var(--text-inactive)',
                border: '1.5px solid',
                borderColor: statusFilter === s ? '#000000' : 'var(--surface)',
              }}
            >
              {s}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white text-center py-16" style={{ borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-raised)' }}>
            <div className="text-4xl mb-3">📦</div>
            <h3 className="font-black text-black mb-1">No orders found</h3>
            <p className="text-gray-400 text-sm mb-6">
              {statusFilter !== 'All' ? `No ${statusFilter} orders.` : "You haven't placed any orders yet."}
            </p>
            <Link
              href="/products"
              className="inline-block px-6 py-3 text-sm font-bold text-white"
              style={{ background: '#000000', borderRadius: 'var(--radius-pill)' }}
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(order => {
              const sc = STATUS_COLORS[order.status] || { bg: 'var(--bg)', color: 'var(--text-inactive)' };
              const img = order.products?.images?.[0];
              return (
                <div
                  key={order.id}
                  className="bg-white"
                  style={{ borderRadius: 'var(--radius-sm)', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}
                >
                  <div className="flex items-start gap-4 p-5">
                    {/* Product image */}
                    <div
                      className="flex-shrink-0 flex items-center justify-center"
                      style={{ width: '72px', height: '72px', borderRadius: 'var(--radius-sm)', background: 'var(--bg)', overflow: 'hidden' }}
                    >
                      {img
                        ? <img src={img} alt={order.products?.name} style={{ width: '72px', height: '72px', objectFit: 'cover' }} />
                        : <span className="text-2xl">📦</span>
                      }
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-black text-sm truncate">{order.products?.name || 'Product'}</h3>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Seller: {order.sellers?.company_name || '—'} · Qty: {order.quantity}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="font-black text-black text-base">
                            ₹{order.total_amount.toLocaleString('en-IN')}
                          </div>
                          <span
                            className="inline-block mt-1 px-2.5 py-0.5 text-xs font-semibold"
                            style={{ borderRadius: 'var(--radius-pill)', background: sc.bg, color: sc.color }}
                          >
                            {order.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="px-5 pb-4">
                    <Link
                      href={`/order/${order.id}`}
                      className="text-sm font-semibold text-black underline"
                    >
                      View Order Details →
                    </Link>
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
