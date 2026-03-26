'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

interface OrderDetail {
  id: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  currency: string;
  status: string;
  notes: string | null;
  shipping_address: Record<string, string> | null;
  created_at: string;
  confirmed_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;
  products: {
    id: string;
    name: string;
    description: string | null;
    images: string[];
    category: string;
  } | null;
  sellers: {
    company_name: string;
    users: { email: string; phone: string | null } | null;
  } | null;
}

const STATUS_STEPS = ['Pending', 'Confirmed', 'Shipped', 'Delivered'];

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  Pending:   { bg: '#fef9c3', color: '#854d0e' },
  Confirmed: { bg: '#dbeafe', color: '#1e40af' },
  Shipped:   { bg: '#e0e7ff', color: '#3730a3' },
  Delivered: { bg: '#dcfce7', color: '#166534' },
  Cancelled: { bg: '#fee2e2', color: '#991b1b' },
};

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/buyer'); return; }

      const { data } = await supabase
        .from('orders')
        .select(`
          id, quantity, unit_price, total_amount, currency, status,
          notes, shipping_address, created_at, confirmed_at, shipped_at, delivered_at, cancelled_at,
          products ( id, name, description, images, category ),
          sellers ( company_name, users ( email, phone ) )
        `)
        .eq('id', orderId)
        .single();

      if (!data) { router.push('/my-orders'); return; }
      setOrder(data as OrderDetail);
      setLoading(false);
    }
    load();
  }, [orderId, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="text-gray-400 text-sm">Loading order...</div>
      </div>
    );
  }

  if (!order) return null;

  const sc = STATUS_COLORS[order.status] || { bg: 'var(--bg)', color: 'var(--text-inactive)' };
  const currentStepIndex = STATUS_STEPS.indexOf(order.status);
  const img = order.products?.images?.[0];
  const addr = order.shipping_address;

  const stepTimestamps: Record<string, string | null> = {
    Pending:   order.created_at,
    Confirmed: order.confirmed_at,
    Shipped:   order.shipped_at,
    Delivered: order.delivered_at,
  };

  return (
    <div className="min-h-screen py-10 px-4" style={{ background: 'var(--bg)' }}>
      <div className="max-w-2xl mx-auto">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/my-orders" className="hover:">My Orders</Link>
          <span>›</span>
          <span className=" font-semibold">Order Details</span>
        </div>

        {/* Status + Order ID */}
        <div className="bg-white mb-4" style={{ borderRadius: 'var(--radius-md)', padding: '28px', boxShadow: 'var(--shadow-raised)' }}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">Order ID</p>
              <p className="font-mono text-sm font-semibold">{order.id.slice(0, 8).toUpperCase()}</p>
              <p className="text-xs text-gray-400 mt-1">
                Placed on {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <span
              className="px-3 py-1 text-sm font-bold"
              style={{ borderRadius: 'var(--radius-pill)', background: sc.bg, color: sc.color }}
            >
              {order.status}
            </span>
          </div>

          {/* Status timeline */}
          {order.status !== 'Cancelled' && (
            <div className="mt-6">
              <div className="flex items-center justify-between relative">
                <div
                  className="absolute h-1 top-4 left-0"
                  style={{
                    right: '0',
                    background: 'var(--surface)',
                    zIndex: 0,
                  }}
                />
                <div
                  className="absolute h-1 top-4 left-0"
                  style={{
                    width: `${(currentStepIndex / (STATUS_STEPS.length - 1)) * 100}%`,
                    background: 'var(--active-bg)',
                    zIndex: 1,
                    transition: 'width 0.5s',
                  }}
                />
                {STATUS_STEPS.map((step, idx) => {
                  const done = idx <= currentStepIndex;
                  const ts = stepTimestamps[step];
                  return (
                    <div key={step} className="flex flex-col items-center" style={{ zIndex: 2, flex: 1 }}>
                      <div
                        className="flex items-center justify-center text-xs font-bold"
                        style={{
                          width: '32px', height: '32px', borderRadius: '50%',
                          background: done ? 'var(--active-bg)' : 'var(--surface)',
                          color: done ? 'var(--surface)' : 'var(--text-inactive)',
                          border: done ? '2px solid #000000' : '2px solid #e5e7eb',
                        }}
                      >
                        {done ? '✓' : idx + 1}
                      </div>
                      <p className="text-xs font-semibold mt-2" style={{ color: done ? 'var(--active-bg)' : 'var(--text-inactive)' }}>{step}</p>
                      {ts && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="bg-white mb-4" style={{ borderRadius: 'var(--radius-md)', padding: '24px', boxShadow: 'var(--shadow-raised)' }}>
          <h2 className="text-sm font-black  mb-4">Product</h2>
          <div className="flex gap-4">
            <div
              className="flex-shrink-0 flex items-center justify-center"
              style={{ width: '80px', height: '80px', borderRadius: 'var(--radius-sm)', background: 'var(--bg)', overflow: 'hidden' }}
            >
              {img
                ? <img src={img} alt={order.products?.name} style={{ width: '80px', height: '80px', objectFit: 'cover' }} />
                : <span className="text-3xl">📦</span>
              }
            </div>
            <div>
              <h3 className="font-bold">{order.products?.name}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{order.products?.category}</p>
              <p className="text-sm text-gray-600 mt-1">
                Qty: {order.quantity} × ₹{order.unit_price.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>

        {/* Price breakdown */}
        <div className="bg-white mb-4" style={{ borderRadius: 'var(--radius-md)', padding: '24px', boxShadow: 'var(--shadow-raised)' }}>
          <h2 className="text-sm font-black  mb-4">Price Breakdown</h2>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Unit Price</span>
              <span className="font-semibold>₹{order.unit_price.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Quantity</span>
              <span className="font-semibold">{order.quantity}</span>
            </div>
            <div className="flex justify-between text-sm pt-2" style={{ borderTop: '1px solid #f3f4f6' }}>
              <span className="font-black>Total</span>
              <span className="font-black  text-lg">₹{order.total_amount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Delivery address */}
        {addr && (
          <div className="bg-white mb-4" style={{ borderRadius: 'var(--radius-md)', padding: '24px', boxShadow: 'var(--shadow-raised)' }}>
            <h2 className="text-sm font-black  mb-3">Delivery Address</h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              {[addr.name, addr.street, addr.city, addr.state, addr.pincode].filter(Boolean).join(', ')}
            </p>
            {addr.phone && <p className="text-sm text-gray-500 mt-1">📱 {addr.phone}</p>}
          </div>
        )}

        {/* Seller info + contact */}
        {order.sellers && (
          <div className="bg-white mb-4" style={{ borderRadius: 'var(--radius-md)', padding: '24px', boxShadow: 'var(--shadow-raised)' }}>
            <h2 className="text-sm font-black  mb-3">Seller</h2>
            <p className="text-sm font-semibold">{order.sellers.company_name}</p>
            {order.sellers.users?.email && (
              <p className="text-xs text-gray-500 mt-0.5">{order.sellers.users.email}</p>
            )}
            <Link
              href={`/messages`}
              className="inline-block mt-3 px-4 py-2 text-sm font-semibold"
              style={{ boxShadow: 'var(--shadow-raised)', borderRadius: 'var(--radius-pill)', color: '#000', background: 'var(--surface)' }}
            >
              Contact Seller
            </Link>
          </div>
        )}

        {/* Notes */}
        {order.notes && (
          <div className="bg-white mb-4" style={{ borderRadius: 'var(--radius-md)', padding: '24px', boxShadow: 'var(--shadow-raised)' }}>
            <h2 className="text-sm font-black  mb-2">Notes</h2>
            <p className="text-sm text-gray-600">{order.notes}</p>
          </div>
        )}

        {/* Download invoice */}
        <Link
          href={`/invoices`}
          className="block text-center w-full py-3.5 text-sm font-bold text-white"
          style={{ background: 'var(--active-bg)', borderRadius: 'var(--radius-sm)' }}
        >
          🧾 Download Invoice
        </Link>
      </div>
    </div>
  );
}
