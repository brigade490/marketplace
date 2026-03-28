'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const BUSINESS_TYPES = ['manufacturer', 'distributor', 'wholesaler', 'trader', 'retailer', 'service'];
const INDIAN_STATES = [
  'Andhra Pradesh', 'Assam', 'Bihar', 'Delhi', 'Goa', 'Gujarat', 'Haryana',
  'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Odisha', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Other',
];

export default function EditProfilePage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    full_name: '',
    business_name: '',
    business_type: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    pincode: '',
    gst_number: '',
    avatar_url: '',
  });
  const [avatarPreview, setAvatarPreview] = useState('');
  const [userId, setUserId] = useState('');
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/buyer'); return; }
      setUserId(user.id);

      const { data: p } = await supabase.from('users').select('*').eq('id', user.id).single();
      if (p) {
        setUserRole(p.role);
        let bizName = p.business_name || '';
        let bizType = '';

        if (p.role === 'seller' || p.role === 'seller+buyer') {
          const { data: s } = await supabase.from('sellers').select('company_name, business_type').eq('user_id', user.id).single();
          if (s) { bizName = s.company_name || bizName; bizType = s.business_type || ''; }
        } else {
          const { data: b } = await supabase.from('buyers').select('company_name').eq('user_id', user.id).single();
          if (b) bizName = b.company_name || bizName;
        }

        setForm({
          full_name: p.full_name || '',
          business_name: bizName,
          business_type: bizType,
          email: p.email || user.email || '',
          phone: p.phone || '',
          city: p.city || '',
          state: p.state || '',
          pincode: p.pincode || '',
          gst_number: p.gst_number || '',
          avatar_url: p.avatar_url || '',
        });
        setAvatarPreview(p.avatar_url || '');
      }
      setLoading(false);
    }
    load();
  }, [router]);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setError('Image must be under 2MB'); return; }

    setUploading(true);
    setError('');
    const supabase = createClient();
    const ext = file.name.split('.').pop();
    const path = `avatars/${userId}-${Date.now()}.${ext}`;

    const { error: upErr } = await supabase.storage.from('uploads').upload(path, file, { upsert: true });
    if (upErr) {
      setError('Upload failed: ' + upErr.message);
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from('uploads').getPublicUrl(path);
    setForm(f => ({ ...f, avatar_url: publicUrl }));
    setAvatarPreview(publicUrl);
    setUploading(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.full_name.trim()) { setError('Name is required'); return; }
    setSaving(true);
    setError('');
    setSuccess('');

    const supabase = createClient();

    const { error: uErr } = await supabase.from('users').update({
      full_name: form.full_name.trim(),
      phone: form.phone.trim(),
      avatar_url: form.avatar_url || null,
      city: form.city.trim() || null,
      state: form.state || null,
      pincode: form.pincode.trim() || null,
      gst_number: form.gst_number.trim() || null,
      business_name: form.business_name.trim() || null,
    }).eq('id', userId);

    if (uErr) { setError(uErr.message); setSaving(false); return; }

    if (userRole === 'seller' || userRole === 'seller+buyer') {
      await supabase.from('sellers').update({
        company_name: form.business_name.trim() || null,
        business_type: form.business_type || null,
      }).eq('user_id', userId);
    } else {
      await supabase.from('buyers').update({
        company_name: form.business_name.trim() || null,
      }).eq('user_id', userId);
    }

    setSuccess('Profile updated successfully!');
    setSaving(false);
    setTimeout(() => router.push('/profile'), 1200);
  }

  function set(key: string, val: string) { setForm(f => ({ ...f, [key]: val })); }

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
        <div className="bg-white" style={{ borderRadius: 'var(--radius-md)', padding: '36px', boxShadow: 'var(--shadow-raised)' }}>
          <h1 className="text-2xl font-black  mb-6">Edit Profile</h1>

          <form onSubmit={handleSave} className="space-y-5">
            {/* Avatar upload */}
            <div className="flex items-center gap-5">
              <div
                className="flex-shrink-0 flex items-center justify-center font-black text-2xl"
                style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#000', color: 'var(--surface)', overflow: 'hidden' }}
              >
                {avatarPreview
                  ? <img src={avatarPreview} alt="avatar" style={{ width: '72px', height: '72px', objectFit: 'cover' }} />
                  : (form.full_name?.[0]?.toUpperCase() || '?')
                }
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="px-4 py-2 text-sm font-semibold transition-colors"
                  style={{ boxShadow: 'var(--shadow-raised)', borderRadius: 'var(--radius-pill)', background: 'var(--surface)', color: 'var(--text-primary)' }}
                >
                  {uploading ? 'Uploading...' : 'Upload Logo'}
                </button>
                <p className="text-xs text-gray-400 mt-1">JPG/PNG, max 2MB</p>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </div>
            </div>

            <Field label="Full Name *" value={form.full_name} onChange={v => set('full_name', v)} placeholder="Your full name" required />
            <Field label="Business / Company Name" value={form.business_name} onChange={v => set('business_name', v)} placeholder="Company name" />

            {/* Business type — for sellers */}
            {(userRole === 'seller' || userRole === 'seller+buyer') && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Business Type</label>
                <select
                  value={form.business_type}
                  onChange={e => set('business_type', e.target.value)}
                  className="w-full px-4 py-3 text-sm  outline-none"
                  style={{ boxShadow: 'var(--shadow-inset)', borderRadius: 'var(--radius-sm)', background: '#d8d8dc' }}
                >
                  <option value="">Select type</option>
                  {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>
            )}

            <Field label="Email" value={form.email} onChange={() => {}} placeholder="email@example.com" disabled />
            <Field label="Mobile Number" value={form.phone} onChange={v => set('phone', v)} placeholder="+91 98765 43210" type="tel" />
            <Field label="GST Number" value={form.gst_number} onChange={v => set('gst_number', v)} placeholder="22AAAAA0000A1Z5" />

            <div className="grid grid-cols-2 gap-3">
              <Field label="City" value={form.city} onChange={v => set('city', v)} placeholder="Mumbai" />
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">State</label>
                <select
                  value={form.state}
                  onChange={e => set('state', e.target.value)}
                  className="w-full px-4 py-3 text-sm  outline-none"
                  style={{ boxShadow: 'var(--shadow-inset)', borderRadius: 'var(--radius-sm)', background: '#d8d8dc' }}
                >
                  <option value="">Select state</option>
                  {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <Field label="Pincode" value={form.pincode} onChange={v => set('pincode', v)} placeholder="400001" />

            {error && <p className="text-xs text-red-600 bg-red-50 px-3 py-2" style={{ borderRadius: 'var(--radius-xs)' }}>{error}</p>}
            {success && <p className="text-xs text-green-700 bg-green-50 px-3 py-2" style={{ borderRadius: 'var(--radius-xs)' }}>{success}</p>}

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
                disabled={saving || uploading}
                className="flex-1 py-3 text-sm font-bold text-white"
                style={{ background: 'var(--active-bg)', borderRadius: 'var(--radius-pill)', opacity: saving ? 0.6 : 1 }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({
  label, value, onChange, placeholder, required, disabled, type = 'text',
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; required?: boolean; disabled?: boolean; type?: string;
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
        disabled={disabled}
        className="w-full px-4 py-3 text-sm  placeholder-gray-400 outline-none"
        style={{
          boxShadow: 'var(--shadow-inset)', borderRadius: 'var(--radius-sm)', background: '#d8d8dc',
          color: disabled ? 'var(--text-inactive)' : 'var(--text-primary)',
        }}
        onFocus={e => !disabled && (e.currentTarget.style.borderColor = '#000')}
        onBlur={e => (e.currentTarget.style.borderColor = 'var(--surface)')}
      />
    </div>
  );
}
