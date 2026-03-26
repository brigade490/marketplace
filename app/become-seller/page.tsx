'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const BUSINESS_TYPES = ['manufacturer', 'distributor', 'wholesaler', 'trader'];

export default function BecomeSellerPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState('');
  const [currentRole, setCurrentRole] = useState('');

  const [form, setForm] = useState({
    company_name: '',
    business_type: 'manufacturer',
    country: 'India',
    website: '',
    tax_id: '',
  });

  useEffect(() => {
    async function check() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/seller'); return; }
      setUserId(user.id);

      const { data: p } = await supabase.from('users').select('role, full_name').eq('id', user.id).single();
      if (!p) { router.push('/auth/seller'); return; }

      setCurrentRole(p.role);
      if (p.role === 'seller' || p.role === 'seller+buyer') {
        router.push('/my-products');
        return;
      }
      setLoading(false);
    }
    check();
  }, [router]);

  function set(key: string, val: string) { setForm(f => ({ ...f, [key]: val })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.company_name.trim()) { setError('Company name is required'); return; }

    setSubmitting(true);
    setError('');
    const supabase = createClient();

    // Create seller record
    const { error: sErr } = await supabase.from('sellers').insert({
      user_id: userId,
      company_name: form.company_name.trim(),
      business_type: form.business_type,
      country: form.country,
      website: form.website.trim() || null,
      tax_id: form.tax_id.trim() || null,
    });

    if (sErr) {
      setError(sErr.message);
      setSubmitting(false);
      return;
    }

    // Update role
    const newRole = currentRole === 'buyer' ? 'seller+buyer' : 'seller';
    await supabase.from('users').update({ role: newRole }).eq('id', userId);

    setStep(2);
    setSubmitting(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="text-gray-400 text-sm">Loading...</div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
        <div className="bg-white text-center" style={{ borderRadius: '20px', padding: '52px 40px', maxWidth: '440px', width: '100%', boxShadow: 'var(--shadow-raised)' }}>
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-2xl font-black text-black mb-2">Welcome, Seller!</h2>
          <p className="text-gray-500 text-sm mb-8">Your seller account is ready. Start listing your products and grow your business on Karobarrr.</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => router.push('/add-product')}
              className="w-full py-3 text-sm font-bold text-white"
              style={{ background: '#000000', borderRadius: 'var(--radius-pill)' }}
            >
              Add Your First Product
            </button>
            <button
              onClick={() => router.push('/my-products')}
              className="w-full py-3 text-sm font-semibold"
              style={{ border: '1.5px solid #e5e7eb', borderRadius: 'var(--radius-pill)', background: 'var(--surface)', color: 'var(--text-primary)' }}
            >
              Go to My Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4" style={{ background: 'var(--bg)' }}>
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🚀</div>
          <h1 className="text-3xl font-black text-black mb-2">Become a Seller</h1>
          <p className="text-gray-500 text-sm">Set up your seller profile and start reaching thousands of B2B buyers.</p>
        </div>

        <div className="bg-white" style={{ borderRadius: 'var(--radius-md)', padding: '36px', boxShadow: 'var(--shadow-raised)' }}>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Company / Business Name *</label>
              <input
                type="text"
                value={form.company_name}
                onChange={e => set('company_name', e.target.value)}
                placeholder="ABC Manufacturers Pvt. Ltd."
                required
                className="w-full px-4 py-3 text-sm text-black placeholder-gray-400 outline-none"
                style={{ border: '1.5px solid #e5e7eb', borderRadius: 'var(--radius-sm)' }}
                onFocus={e => (e.currentTarget.style.borderColor = '#000')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--surface)')}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Business Type *</label>
              <select
                value={form.business_type}
                onChange={e => set('business_type', e.target.value)}
                className="w-full px-4 py-3 text-sm text-black outline-none"
                style={{ border: '1.5px solid #e5e7eb', borderRadius: 'var(--radius-sm)', background: 'var(--surface)' }}
              >
                {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Country</label>
              <input
                type="text"
                value={form.country}
                onChange={e => set('country', e.target.value)}
                placeholder="India"
                className="w-full px-4 py-3 text-sm text-black placeholder-gray-400 outline-none"
                style={{ border: '1.5px solid #e5e7eb', borderRadius: 'var(--radius-sm)' }}
                onFocus={e => (e.currentTarget.style.borderColor = '#000')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--surface)')}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Website (optional)</label>
              <input
                type="url"
                value={form.website}
                onChange={e => set('website', e.target.value)}
                placeholder="https://yourcompany.com"
                className="w-full px-4 py-3 text-sm text-black placeholder-gray-400 outline-none"
                style={{ border: '1.5px solid #e5e7eb', borderRadius: 'var(--radius-sm)' }}
                onFocus={e => (e.currentTarget.style.borderColor = '#000')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--surface)')}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">GST / Tax ID (optional)</label>
              <input
                type="text"
                value={form.tax_id}
                onChange={e => set('tax_id', e.target.value)}
                placeholder="22AAAAA0000A1Z5"
                className="w-full px-4 py-3 text-sm text-black placeholder-gray-400 outline-none"
                style={{ border: '1.5px solid #e5e7eb', borderRadius: 'var(--radius-sm)' }}
                onFocus={e => (e.currentTarget.style.borderColor = '#000')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--surface)')}
              />
            </div>

            {error && <p className="text-xs text-red-600 bg-red-50 px-3 py-2" style={{ borderRadius: '8px' }}>{error}</p>}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 py-3 text-sm font-semibold"
                style={{ border: '1.5px solid #e5e7eb', borderRadius: 'var(--radius-pill)', background: 'var(--surface)', color: 'var(--text-primary)' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3 text-sm font-bold text-white"
                style={{ background: '#000000', borderRadius: 'var(--radius-pill)', opacity: submitting ? 0.6 : 1 }}
              >
                {submitting ? 'Setting up...' : 'Become a Seller'}
              </button>
            </div>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          By proceeding, you agree to our <a href="#" className="underline">Seller Terms of Service</a>.
        </p>
      </div>
    </div>
  );
}
