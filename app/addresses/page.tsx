'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface Address {
  id: string;
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
}

const INDIAN_STATES = [
  'Andhra Pradesh', 'Assam', 'Bihar', 'Delhi', 'Goa', 'Gujarat', 'Haryana',
  'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Odisha', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Other',
];

const EMPTY_FORM = { name: '', phone: '', street: '', city: '', state: '', pincode: '' };

export default function AddressesPage() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
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
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });

      setAddresses((data as Address[]) || []);
      setLoading(false);
    }
    load();
  }, [router]);

  function openAdd() { setForm(EMPTY_FORM); setEditId(null); setShowForm(true); setError(''); }
  function openEdit(addr: Address) {
    setForm({ name: addr.name, phone: addr.phone, street: addr.street, city: addr.city, state: addr.state, pincode: addr.pincode });
    setEditId(addr.id);
    setShowForm(true);
    setError('');
  }
  function set(key: string, val: string) { setForm(f => ({ ...f, [key]: val })); }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.street.trim() || !form.city.trim() || !form.pincode.trim()) {
      setError('All fields are required');
      return;
    }
    setSaving(true);
    setError('');
    const supabase = createClient();

    if (editId) {
      await supabase.from('addresses').update(form).eq('id', editId);
      setAddresses(prev => prev.map(a => a.id === editId ? { ...a, ...form } : a));
    } else {
      const isFirst = addresses.length === 0;
      const { data } = await supabase.from('addresses').insert({ ...form, user_id: userId, is_default: isFirst }).select('*').single();
      if (data) setAddresses(prev => [...prev, data as Address]);
    }

    setShowForm(false);
    setSaving(false);
  }

  async function handleDelete(addrId: string) {
    const supabase = createClient();
    await supabase.from('addresses').delete().eq('id', addrId);
    setAddresses(prev => prev.filter(a => a.id !== addrId));
  }

  async function setDefault(addrId: string) {
    const supabase = createClient();
    await supabase.from('addresses').update({ is_default: false }).eq('user_id', userId);
    await supabase.from('addresses').update({ is_default: true }).eq('id', addrId);
    setAddresses(prev => prev.map(a => ({ ...a, is_default: a.id === addrId })));
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="text-gray-400 text-sm">Loading addresses...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4" style={{ background: 'var(--bg)' }}>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black text-black">Addresses</h1>
          <button
            onClick={openAdd}
            className="px-5 py-2.5 text-sm font-bold text-white"
            style={{ background: '#000000', borderRadius: 'var(--radius-pill)' }}
          >
            + Add Address
          </button>
        </div>

        {addresses.length === 0 && !showForm && (
          <div className="bg-white text-center py-16" style={{ borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-raised)' }}>
            <div className="text-4xl mb-3">📍</div>
            <h3 className="font-black text-black mb-2">No addresses saved</h3>
            <p className="text-gray-400 text-sm mb-6">Add delivery addresses for faster checkout.</p>
            <button onClick={openAdd} className="px-6 py-3 text-sm font-bold text-white" style={{ background: '#000', borderRadius: 'var(--radius-pill)' }}>
              Add Address
            </button>
          </div>
        )}

        <div className="space-y-4">
          {addresses.map(addr => (
            <div key={addr.id} className="bg-white" style={{ borderRadius: 'var(--radius-sm)', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: '20px' }}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-black">{addr.name}</h3>
                    {addr.is_default && (
                      <span className="px-2 py-0.5 text-xs font-bold text-white" style={{ background: '#000', borderRadius: 'var(--radius-pill)' }}>Default</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{addr.street}</p>
                  <p className="text-sm text-gray-600">{addr.city}, {addr.state} — {addr.pincode}</p>
                  <p className="text-sm text-gray-500 mt-1">📱 {addr.phone}</p>
                </div>
              </div>
              <div className="flex gap-3 mt-3">
                <button onClick={() => openEdit(addr)} className="text-xs font-semibold text-black">Edit</button>
                {!addr.is_default && (
                  <button onClick={() => setDefault(addr.id)} className="text-xs font-semibold text-gray-600">Set Default</button>
                )}
                <button onClick={() => handleDelete(addr.id)} className="text-xs font-semibold text-red-500">Delete</button>
              </div>
            </div>
          ))}
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: 'rgba(0,0,0,0.5)' }}
            onClick={e => { if (e.target === e.currentTarget) setShowForm(false); }}
          >
            <div className="bg-white w-full" style={{ borderRadius: 'var(--radius-md)', padding: '32px', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto' }}>
              <h2 className="text-xl font-black text-black mb-5">{editId ? 'Edit Address' : 'Add Address'}</h2>
              <form onSubmit={handleSave} className="space-y-4">
                <Field label="Full Name *" value={form.name} onChange={v => set('name', v)} placeholder="Recipient name" required />
                <Field label="Phone *" value={form.phone} onChange={v => set('phone', v)} placeholder="+91 98765 43210" required type="tel" />
                <Field label="Street Address *" value={form.street} onChange={v => set('street', v)} placeholder="House/Flat No., Street, Area" required />
                <Field label="City *" value={form.city} onChange={v => set('city', v)} placeholder="Mumbai" required />
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">State *</label>
                  <select
                    value={form.state}
                    onChange={e => set('state', e.target.value)}
                    required
                    className="w-full px-4 py-3 text-sm text-black outline-none"
                    style={{ border: '1.5px solid #e5e7eb', borderRadius: 'var(--radius-sm)', background: 'var(--surface)' }}
                  >
                    <option value="">Select state</option>
                    {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <Field label="Pincode *" value={form.pincode} onChange={v => set('pincode', v)} placeholder="400001" required />

                {error && <p className="text-xs text-red-600 bg-red-50 px-3 py-2" style={{ borderRadius: '8px' }}>{error}</p>}

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 text-sm font-semibold" style={{ border: '1.5px solid #e5e7eb', borderRadius: 'var(--radius-pill)' }}>Cancel</button>
                  <button type="submit" disabled={saving} className="flex-1 py-3 text-sm font-bold text-white" style={{ background: '#000000', borderRadius: 'var(--radius-pill)', opacity: saving ? 0.6 : 1 }}>
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, required, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean; type?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-700 mb-1.5">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required}
        className="w-full px-4 py-3 text-sm text-black placeholder-gray-400 outline-none"
        style={{ border: '1.5px solid #e5e7eb', borderRadius: 'var(--radius-sm)' }}
        onFocus={e => (e.currentTarget.style.borderColor = '#000')}
        onBlur={e => (e.currentTarget.style.borderColor = 'var(--surface)')}
      />
    </div>
  );
}
