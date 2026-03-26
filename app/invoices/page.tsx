'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface Invoice {
  id: string;
  order_number: string;
  total_amount: number;
  currency: string;
  status: string;
  created_at: string;
  products_name: string;
  sellers_company: string;
}

export default function InvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/buyer'); return; }

      const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
      const role = profile?.role;

      let query = supabase
        .from('orders')
        .select(`
          id, total_amount, currency, status, created_at,
          products ( name ),
          sellers ( company_name ),
          buyers ( user_id )
        `)
        .order('created_at', { ascending: false });

      if (role === 'buyer') {
        const { data: buyer } = await supabase.from('buyers').select('id').eq('user_id', user.id).single();
        if (!buyer) { setLoading(false); return; }
        query = query.eq('buyer_id', buyer.id);
      } else if (role === 'seller') {
        const { data: seller } = await supabase.from('sellers').select('id').eq('user_id', user.id).single();
        if (!seller) { setLoading(false); return; }
        query = query.eq('seller_id', seller.id);
      } else {
        const { data: buyer } = await supabase.from('buyers').select('id').eq('user_id', user.id).single();
        if (buyer) query = query.eq('buyer_id', buyer.id);
      }

      const { data } = await query;

      const formatted: Invoice[] = (data || []).map((order: any) => ({
        id: order.id,
        order_number: order.id.slice(0, 8).toUpperCase(),
        total_amount: order.total_amount,
        currency: order.currency,
        status: order.status,
        created_at: order.created_at,
        products_name: order.products?.name || 'Product',
        sellers_company: order.sellers?.company_name || 'Seller',
      }));

      setInvoices(formatted);
      setLoading(false);
    }
    load();
  }, [router]);

  function downloadInvoice(invoice: Invoice) {
    // Generate a simple text invoice as a download
    const content = `
INVOICE
=======
Invoice #: ${invoice.order_number}
Date: ${new Date(invoice.created_at).toLocaleDateString('en-IN')}

DETAILS
-------
Product: ${invoice.products_name}
Seller: ${invoice.sellers_company}
Status: ${invoice.status}

AMOUNT
------
Total: ₹${invoice.total_amount.toLocaleString('en-IN')} ${invoice.currency}

Thank you for trading on Karobarrr!
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Invoice_${invoice.order_number}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const filtered = invoices.filter(inv => {
    if (dateFrom && new Date(inv.created_at) < new Date(dateFrom)) return false;
    if (dateTo && new Date(inv.created_at) > new Date(dateTo + 'T23:59:59')) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="text-gray-400 text-sm">Loading invoices...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4" style={{ background: 'var(--bg)' }}>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black>Invoices</h1>
          <span className="text-sm text-gray-500">{filtered.length} invoices</span>
        </div>

        {/* Date filter */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="px-3 py-2 text-sm  outline-none"
              style={{ boxShadow: 'var(--shadow-inset)', borderRadius: 'var(--radius-xs)' }}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">To</label>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="px-3 py-2 text-sm  outline-none"
              style={{ boxShadow: 'var(--shadow-inset)', borderRadius: 'var(--radius-xs)' }}
            />
          </div>
          {(dateFrom || dateTo) && (
            <div className="flex items-end">
              <button
                onClick={() => { setDateFrom(''); setDateTo(''); }}
                className="px-4 py-2 text-sm font-semibold"
                style={{ boxShadow: 'var(--shadow-inset)', borderRadius: 'var(--radius-xs)', background: 'var(--surface)', color: 'var(--text-inactive)' }}
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white text-center py-16" style={{ borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-raised)' }}>
            <div className="text-4xl mb-3">🧾</div>
            <h3 className="font-black  mb-2">No invoices found</h3>
            <p className="text-gray-400 text-sm">Invoices are generated automatically from your orders.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(invoice => (
              <div
                key={invoice.id}
                className="bg-white flex items-center gap-4"
                style={{ borderRadius: 'var(--radius-sm)', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: '16px 20px' }}
              >
                <div className="text-2xl flex-shrink-0">🧾</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold  text-sm">Invoice #{invoice.order_number}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{invoice.products_name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(invoice.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-black>₹{invoice.total_amount.toLocaleString('en-IN')}</p>
                      <span
                        className="text-xs font-semibold"
                        style={{
                          color: invoice.status === 'Delivered' ? '#166534' : invoice.status === 'Cancelled' ? '#991b1b' : '#854d0e',
                        }}
                      >
                        {invoice.status}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => downloadInvoice(invoice)}
                  className="flex-shrink-0 px-4 py-2 text-xs font-bold text-white"
                  style={{ background: 'var(--active-bg)', borderRadius: 'var(--radius-pill)' }}
                >
                  Download
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
