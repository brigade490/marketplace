'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const CATEGORIES = [
  'Agriculture & Food', 'Chemicals', 'Construction', 'Electronics', 'Furniture',
  'Industrial Machinery', 'Metals & Alloys', 'Packaging', 'Pharmaceuticals',
  'Plastics & Rubber', 'Textiles & Garments', 'Other',
];

export default function PostRequirementPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [buyerId, setBuyerId] = useState('');

  const [form, setForm] = useState({
    title: '',
    category: '',
    description: '',
    quantity_text: '',
    budget_min: '',
    budget_max: '',
    deadline: '',
    location: '',
    is_urgent: false,
  });

  useEffect(() => {
    async function check() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/buyer'); return; }

      // Ensure buyer record exists
      let { data: buyer } = await supabase.from('buyers').select('id').eq('user_id', user.id).single();
      if (!buyer) {
        const { data: newBuyer } = await supabase.from('buyers').insert({ user_id: user.id }).select('id').single();
        buyer = newBuyer;
      }

      if (buyer) setBuyerId(buyer.id);
      setLoading(false);
    }
    check();
  }, [router]);

  function set(key: string, val: string | boolean) { setForm(f => ({ ...f, [key]: val })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { setError('Title is required'); return; }
    if (!buyerId) { setError('Buyer profile not found'); return; }

    setSubmitting(true);
    setError('');
    const supabase = createClient();

    let budget_display = '';
    if (form.budget_min && form.budget_max) {
      budget_display = `₹${Number(form.budget_min).toLocaleString('en-IN')} – ₹${Number(form.budget_max).toLocaleString('en-IN')}`;
    } else if (form.budget_min) {
      budget_display = `₹${Number(form.budget_min).toLocaleString('en-IN')}+`;
    } else if (form.budget_max) {
      budget_display = `Up to ₹${Number(form.budget_max).toLocaleString('en-IN')}`;
    }

    const { error: err } = await supabase.from('requirements').insert({
      buyer_id: buyerId,
      title: form.title.trim(),
      category: form.category || null,
      description: form.description.trim() || null,
      quantity_text: form.quantity_text.trim() || null,
      budget_min: form.budget_min ? Number(form.budget_min) : null,
      budget_max: form.budget_max ? Number(form.budget_max) : null,
      budget_display: budget_display || null,
      deadline: form.deadline || null,
      location: form.location.trim() || null,
      is_urgent: form.is_urgent,
    });

    if (err) { setError(err.message); setSubmitting(false); return; }
    router.push('/my-requirements');
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="text-gray-400 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4" style={{ background: 'var(--bg)' }}>
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-black  mb-2">Post a Requirement</h1>
        <p className="text-gray-500 text-sm mb-6">Tell sellers what you need and get competitive quotes.</p>

        <div className="bg-white" style={{ borderRadius: 'var(--radius-md)', padding: '36px', boxShadow: 'var(--shadow-raised)' }}>
          <form onSubmit={handleSubmit} className="space-y-5">
            <Field label="Requirement Title *" value={form.title} onChange={v => set('title', v)} placeholder="e.g. Need 500 kg Stainless Steel Rods" required />

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Category</label>
              <select
                value={form.category}
                onChange={e => set('category', e.target.value)}
                className="w-full px-4 py-3 text-sm  outline-none"
                style={{ boxShadow: 'var(--shadow-inset)', borderRadius: 'var(--radius-sm)', background: 'var(--surface)' }}
              >
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Description</label>
              <textarea
                value={form.description}
                onChange={e => set('description', e.target.value)}
                placeholder="Describe your requirement in detail — specifications, quality standards, delivery requirements..."
                rows={4}
                className="w-full px-4 py-3 text-sm  placeholder-gray-400 outline-none resize-none"
                style={{ boxShadow: 'var(--shadow-inset)', borderRadius: 'var(--radius-sm)' }}
                onFocus={e => (e.currentTarget.style.borderColor = '#000')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--surface)')}
              />
            </div>

            <Field label="Quantity Needed" value={form.quantity_text} onChange={v => set('quantity_text', v)} placeholder="e.g. 500 kg, 1000 pieces/month" />

            <div className="grid grid-cols-2 gap-3">
              <Field label="Budget Min (₹)" value={form.budget_min} onChange={v => set('budget_min', v)} placeholder="e.g. 10000" type="number" />
              <Field label="Budget Max (₹)" value={form.budget_max} onChange={v => set('budget_max', v)} placeholder="e.g. 50000" type="number" />
            </div>

            <Field label="Deadline" value={form.deadline} onChange={v => set('deadline', v)} type="date" />
            <Field label="Delivery Location" value={form.location} onChange={v => set('location', v)} placeholder="e.g. Mumbai, Maharashtra" />

            {/* Urgent toggle */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => set('is_urgent', !form.is_urgent)}
              >
                <div
                  style={{
                    width: '44px', height: '24px', borderRadius: 'var(--radius-pill)',
                    background: form.is_urgent ? '#dc2626' : 'var(--surface)',
                    position: 'relative', transition: 'background 0.2s',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute', top: '3px',
                      left: form.is_urgent ? '23px' : '3px',
                      width: '18px', height: '18px',
                      borderRadius: '50%', background: 'var(--surface)',
                      transition: 'left 0.2s',
                    }}
                  />
                </div>
              </button>
              <span className="text-sm font-semibold text-gray-700">Mark as Urgent</span>
            </div>

            {error && <p className="text-xs text-red-600 bg-red-50 px-3 py-2" style={{ borderRadius: 'var(--radius-xs)' }}>{error}</p>}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 py-3 text-sm font-semibold"
                style={{ boxShadow: 'var(--shadow-inset)', borderRadius: 'var(--radius-pill)', background: 'var(--surface)', color: 'var(--text-primary)' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3 text-sm font-bold text-white"
                style={{ background: 'var(--active-bg)', borderRadius: 'var(--radius-pill)', opacity: submitting ? 0.6 : 1 }}
              >
                {submitting ? 'Posting...' : 'Post Requirement'}
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
        className="w-full px-4 py-3 text-sm  placeholder-gray-400 outline-none"
        style={{ boxShadow: 'var(--shadow-inset)', borderRadius: 'var(--radius-sm)' }}
        onFocus={e => (e.currentTarget.style.borderColor = '#000')}
        onBlur={e => (e.currentTarget.style.borderColor = 'var(--surface)')}
      />
    </div>
  );
}
