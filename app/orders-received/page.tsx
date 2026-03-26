'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface Order {
  id: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  status: string;
  created_at: string;
  notes: string | null;
  products: { name: string; images: string[] } | null;
  buyers: { users: { full_name: string | null; email: string } | null } | null;
}

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  Pending:   { bg: '#fef9c3', color: '#854d0e' },
  Confirmed: { bg: '#dbeafe', color: '#1e40af' },
  Shipped:   { bg: '#e0e7ff', color: '#3730a3' },
  Delivered: { bg: '#dcfce7', color: '#166534' },
  Cancelled: { bg: '#fee2e2', color: '#991b1b' },
};

export default function OrdersReceivedPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/buyer'); return; }

      const { data: seller } = await supabase.from('sellers').select('id').eq('user_id', user.id).single();
      if (!seller) { router.push('/become-seller'); return; }

      const { data } = await supabase
        .from('orders')
        .select(`
          id, quantity, unit_price, total_amount, status, created_at, notes,
          products ( name, images ),
          buyers ( users ( full_name, email ) )
        `)
        .eq('seller_id', seller.id)
        .order('created_at', { ascending: false });

      setOrders((data as unknown as Order[]) || []);
      setLoading(false);
    }
    load();
  }, [router]);

  async function updateStatus(orderId: string, newStatus: string) {
    setUpdating(orderId);
    const supabase = createClient();
    const updateData: Record<string, string> = { status: newStatus };
    if (newStatus === 'Confirmed') updateData.confirmed_at = new Date().toISOString();
    if (newStatus === 'Shipped')   updateData.shipped_at   = new Date().toISOString();
    if (newStatus === 'Delivered') updateData.delivered_at = new Date().toISOString();
    if (newStatus === 'Cancelled') updateData.cancelled_at = new Date().toISOString();

    await supabase.from('orders').update(updateData).eq('id', orderId);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    setUpdating(null);
  }

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
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black">Orders Received</h1>
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
                background: statusFilter === s ? 'var(--active-bg)' : 'var(--surface)',
                color: statusFilter === s ? 'var(--surface)' : 'var(--text-inactive)',
                boxShadow: 'var(--shadow-raised)',
                borderColor: statusFilter === s ? 'var(--active-bg)' : 'var(--surface)',
              }}
            >
              {s}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white text-center py-16" style={{ borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-raised)' }}>
            <div className="text-4xl mb-3">📋</div>
            <h3 className="font-black  mb-2">No orders yet</h3>
            <p className="text-gray-400 text-sm">Orders from buyers will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(order => {
              const sc = STATUS_COLORS[order.status] || { bg: 'var(--bg)', color: 'var(--text-inactive)' };
              const img = order.products?.images?.[0];
              const buyerName = order.buyers?.users?.full_name || order.buyers?.users?.email || 'Unknown Buyer';

              return (
                <div key={order.id} className="bg-white" style={{ borderRadius: 'var(--radius-sm)', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                  <div className="flex items-start gap-4 p-5">
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
                          <h3 className="font-bold  text-sm">{order.products?.name || 'Product'}</h3>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Buyer: {buyerName} · Qty: {order.quantity}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                          {order.notes && <p className="text-xs text-gray-500 mt-1 italic">Note: {order.notes}</p>}
                        </div>
                        <div className="text-right">
                          <div className="font-black  text-base">₹{order.total_amount.toLocaleString('en-IN')}</div>
                          <span
                            className="inline-block mt-1 px-2.5 py-0.5 text-xs font-semibold"
                            style={{ borderRadius: 'var(--radius-pill)', background: sc.bg, color: sc.color }}
                          >
                            {order.status}
                          </span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 mt-3 flex-wrap">
                        {order.status === 'Pending' && (
                          <>
                            <ActionBtn
                              label="Accept"
                              bg="#dcfce7" color="#166534"
                              disabled={updating === order.id}
                              onClick={() => updateStatus(order.id, 'Confirmed')}
                            />
                            <ActionBtn
                              label="Reject"
                              bg="#fee2e2" color="#991b1b"
                              disabled={updating === order.id}
                              onClick={() => updateStatus(order.id, 'Cancelled')}
                            />
                          </>
                        )}
                        {order.status === 'Confirmed' && (
                          <ActionBtn
                            label="Mark as Shipped"
                            bg="#e0e7ff" color="#3730a3"
                            disabled={updating === order.id}
                            onClick={() => updateStatus(order.id, 'Shipped')}
                          />
                        )}
                        {order.status === 'Shipped' && (
                          <ActionBtn
                            label="Mark as Delivered"
                            bg="#dcfce7" color="#166534"
                            disabled={updating === order.id}
                            onClick={() => updateStatus(order.id, 'Delivered')}
                          />
                        )}
                      </div>
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

function ActionBtn({ label, bg, color, onClick, disabled }: { label: string; bg: string; color: string; onClick: () => void; disabled: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-3 py-1.5 text-xs font-semibold transition-opacity"
      style={{ borderRadius: 'var(--radius-pill)', background: bg, color, opacity: disabled ? 0.6 : 1 }}
    >
      {label}
    </button>
  );
}
