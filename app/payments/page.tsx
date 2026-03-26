'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface PaymentMethod {
  id: string;
  type: 'upi' | 'bank';
  details: Record<string, string>;
  is_default: boolean;
}

export default function PaymentsPage() {
  const router = useRouter();
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [addType, setAddType] = useState<'upi' | 'bank'>('upi');
  const [upiId, setUpiId] = useState('');
  const [bankForm, setBankForm] = useState({ account_name: '', account_no: '', ifsc: '', bank_name: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState('');

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/buyer'); return; }
      setUserId(user.id);

      const { data } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });

      setMethods((data as PaymentMethod[]) || []);
      setLoading(false);
    }
    load();
  }, [router]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    let details: Record<string, string> = {};
    if (addType === 'upi') {
      if (!upiId.trim()) { setError('UPI ID is required'); return; }
      details = { upi_id: upiId.trim() };
    } else {
      if (!bankForm.account_no.trim() || !bankForm.ifsc.trim() || !bankForm.bank_name.trim() || !bankForm.account_name.trim()) {
        setError('All bank details are required');
        return;
      }
      details = bankForm;
    }

    setSaving(true);
    const supabase = createClient();
    const isFirst = methods.length === 0;
    const { data } = await supabase
      .from('payment_methods')
      .insert({ user_id: userId, type: addType, details, is_default: isFirst })
      .select('*')
      .single();

    if (data) setMethods(prev => [...prev, data as PaymentMethod]);
    setShowModal(false);
    setUpiId('');
    setBankForm({ account_name: '', account_no: '', ifsc: '', bank_name: '' });
    setSaving(false);
  }

  async function handleDelete(methodId: string) {
    const supabase = createClient();
    await supabase.from('payment_methods').delete().eq('id', methodId);
    setMethods(prev => prev.filter(m => m.id !== methodId));
  }

  async function setDefault(methodId: string) {
    const supabase = createClient();
    await supabase.from('payment_methods').update({ is_default: false }).eq('user_id', userId);
    await supabase.from('payment_methods').update({ is_default: true }).eq('id', methodId);
    setMethods(prev => prev.map(m => ({ ...m, is_default: m.id === methodId })));
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="text-gray-400 text-sm">Loading payment methods...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4" style={{ background: 'var(--bg)' }}>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black text-black">Payments & Billing</h1>
          <button
            onClick={() => setShowModal(true)}
            className="px-5 py-2.5 text-sm font-bold text-white"
            style={{ background: '#000000', borderRadius: 'var(--radius-pill)' }}
          >
            + Add Method
          </button>
        </div>

        {methods.length === 0 && (
          <div className="bg-white text-center py-16" style={{ borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-raised)' }}>
            <div className="text-4xl mb-3">💳</div>
            <h3 className="font-black text-black mb-2">No payment methods</h3>
            <p className="text-gray-400 text-sm mb-6">Add a UPI ID or bank account for payments.</p>
            <button onClick={() => setShowModal(true)} className="px-6 py-3 text-sm font-bold text-white" style={{ background: '#000', borderRadius: 'var(--radius-pill)' }}>Add Method</button>
          </div>
        )}

        <div className="space-y-4">
          {methods.map(method => (
            <div key={method.id} className="bg-white" style={{ borderRadius: 'var(--radius-sm)', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: '20px' }}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{method.type === 'upi' ? '📱' : '🏦'}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-black text-sm">{method.type === 'upi' ? 'UPI' : 'Bank Account'}</h3>
                      {method.is_default && (
                        <span className="px-2 py-0.5 text-xs font-bold text-white" style={{ background: '#000', borderRadius: 'var(--radius-pill)' }}>Default</span>
                      )}
                    </div>
                    {method.type === 'upi' ? (
                      <p className="text-sm text-gray-600">{method.details.upi_id}</p>
                    ) : (
                      <>
                        <p className="text-sm text-gray-600">{method.details.bank_name} · {method.details.account_no}</p>
                        <p className="text-xs text-gray-400">{method.details.account_name} · IFSC: {method.details.ifsc}</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-3">
                {!method.is_default && (
                  <button onClick={() => setDefault(method.id)} className="text-xs font-semibold text-gray-600">Set Default</button>
                )}
                <button onClick={() => handleDelete(method.id)} className="text-xs font-semibold text-red-500">Remove</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Payment Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="bg-white w-full" style={{ borderRadius: 'var(--radius-md)', padding: '32px', maxWidth: '440px' }}>
            <h2 className="text-xl font-black text-black mb-5">Add Payment Method</h2>

            {/* Type tabs */}
            <div className="flex mb-5 p-1" style={{ background: 'var(--bg)', borderRadius: 'var(--radius-sm)' }}>
              {(['upi', 'bank'] as const).map(t => (
                <button key={t} type="button" onClick={() => setAddType(t)}
                  className="flex-1 py-2 text-sm font-semibold"
                  style={{ borderRadius: '8px', background: addType === t ? '#000' : 'transparent', color: addType === t ? 'var(--surface)' : 'var(--text-inactive)' }}>
                  {t === 'upi' ? 'UPI' : 'Bank Account'}
                </button>
              ))}
            </div>

            <form onSubmit={handleAdd} className="space-y-4">
              {addType === 'upi' ? (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">UPI ID *</label>
                  <input type="text" value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="name@upi"
                    className="w-full px-4 py-3 text-sm text-black placeholder-gray-400 outline-none"
                    style={{ border: '1.5px solid #e5e7eb', borderRadius: 'var(--radius-sm)' }}
                    onFocus={e => (e.currentTarget.style.borderColor = '#000')}
                    onBlur={e => (e.currentTarget.style.borderColor = 'var(--surface)')} />
                </div>
              ) : (
                <>
                  {['account_name', 'account_no', 'bank_name', 'ifsc'].map(field => (
                    <div key={field}>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        {field === 'account_name' ? 'Account Holder Name' : field === 'account_no' ? 'Account Number' : field === 'bank_name' ? 'Bank Name' : 'IFSC Code'} *
                      </label>
                      <input type="text" value={bankForm[field as keyof typeof bankForm]}
                        onChange={e => setBankForm(f => ({ ...f, [field]: e.target.value }))}
                        className="w-full px-4 py-3 text-sm text-black placeholder-gray-400 outline-none"
                        style={{ border: '1.5px solid #e5e7eb', borderRadius: 'var(--radius-sm)' }}
                        onFocus={e => (e.currentTarget.style.borderColor = '#000')}
                        onBlur={e => (e.currentTarget.style.borderColor = 'var(--surface)')} />
                    </div>
                  ))}
                </>
              )}

              {error && <p className="text-xs text-red-600 bg-red-50 px-3 py-2" style={{ borderRadius: '8px' }}>{error}</p>}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 text-sm font-semibold"
                  style={{ border: '1.5px solid #e5e7eb', borderRadius: 'var(--radius-pill)' }}>Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-3 text-sm font-bold text-white"
                  style={{ background: '#000', borderRadius: 'var(--radius-pill)', opacity: saving ? 0.6 : 1 }}>
                  {saving ? 'Adding...' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
