'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

/*
  This page saves to:
  - users table         → full_name, phone, avatar_url, city, state, pincode, gst_number, business_name
  - sellers/buyers table → company_name, business_type
  - user_settings table  → email_notifs, sms_notifs, push_notifs, language, currency, profile_visible, contact_visible
  - user_preferences table → categories, order preferences, payment methods, bank details
    (create this table in Supabase if it doesn't exist — see SQL below)

  CREATE TABLE IF NOT EXISTS user_preferences (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    categories TEXT[] DEFAULT '{}',
    order_type TEXT,
    frequency TEXT,
    urgency TEXT,
    delivery_methods TEXT[],
    payment_upi BOOLEAN DEFAULT true,
    payment_bank BOOLEAN DEFAULT true,
    payment_emi BOOLEAN DEFAULT false,
    payment_cod BOOLEAN DEFAULT false,
    bank_upi_id TEXT,
    bank_account_number TEXT,
    bank_ifsc TEXT,
    bank_holder_name TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );
  ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Users manage own preferences" ON user_preferences FOR ALL USING (auth.uid() = user_id);
*/

const CATEGORIES = ['Packaging', 'Electronics', 'Industrial', 'Office Supplies', 'Raw Materials', 'Construction', 'Textile & Fabric', 'Food & Agriculture', 'Chemicals', 'Automobile Parts', 'Others'];
const BUSINESS_TYPES = ['manufacturer', 'distributor', 'wholesaler', 'trader', 'retailer', 'service'];
const INDIAN_STATES = ['Andhra Pradesh', 'Assam', 'Bihar', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Odisha', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Other'];
const LANGUAGES = [{ code: 'en', label: 'English' }, { code: 'hi', label: 'Hindi' }, { code: 'gu', label: 'Gujarati' }, { code: 'mr', label: 'Marathi' }, { code: 'ta', label: 'Tamil' }, { code: 'te', label: 'Telugu' }, { code: 'bn', label: 'Bengali' }, { code: 'kn', label: 'Kannada' }];
const ORDER_TYPES = ['One-time Purchase', 'Recurring Monthly', 'Spot Purchase', 'Contract-based'];
const FREQUENCIES = ['Weekly', 'Monthly', 'Quarterly', 'Yearly'];
const URGENCY_OPTS = ['Standard (7–14 days)', 'Urgent (1–3 days)', 'Flexible'];

export default function SettingsPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const [userId, setUserId] = useState('');
  const [userRole, setUserRole] = useState('');

  // Profile
  const [profile, setProfile] = useState({ full_name: '', email: '', phone: '', avatar_url: '', city: '', state: '', pincode: '', gst_number: '', business_name: '' });
  const [avatarPreview, setAvatarPreview] = useState('');

  // Business (sellers)
  const [businessType, setBusinessType] = useState('');

  // Categories
  const [categories, setCategories] = useState<string[]>([]);

  // Buyer preferences
  const [orderType, setOrderType] = useState('');
  const [frequency, setFrequency] = useState('');
  const [urgency, setUrgency] = useState('');

  // Seller selling prefs
  const [deliveryMethods, setDeliveryMethods] = useState<string[]>([]);

  // Payment methods
  const [paymentUpi, setPaymentUpi] = useState(true);
  const [paymentBank, setPaymentBank] = useState(true);
  const [paymentEmi, setPaymentEmi] = useState(false);
  const [paymentCod, setPaymentCod] = useState(false);

  // Bank details (seller)
  const [bankUpiId, setBankUpiId] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [bankIfsc, setBankIfsc] = useState('');
  const [bankHolder, setBankHolder] = useState('');

  // App settings
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [smsNotifs, setSmsNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [language, setLanguage] = useState('en');
  const [currency, setCurrency] = useState('INR');
  const [profileVisible, setProfileVisible] = useState(true);
  const [contactVisible, setContactVisible] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/buyer'); return; }
      setUserId(user.id);

      // Users table
      const { data: u } = await supabase.from('users').select('*').eq('id', user.id).single();
      if (u) {
        setUserRole(u.role ?? '');
        setProfile({
          full_name: u.full_name ?? '',
          email: u.email ?? user.email ?? '',
          phone: u.phone ?? '',
          avatar_url: u.avatar_url ?? '',
          city: u.city ?? '',
          state: u.state ?? '',
          pincode: u.pincode ?? '',
          gst_number: u.gst_number ?? '',
          business_name: u.business_name ?? '',
        });
        setAvatarPreview(u.avatar_url ?? '');

        // Sellers or buyers
        if (u.role === 'seller' || u.role === 'seller+buyer') {
          const { data: s } = await supabase.from('sellers').select('company_name, business_type').eq('user_id', user.id).single();
          if (s) {
            if (s.company_name) setProfile(p => ({ ...p, business_name: s.company_name ?? p.business_name }));
            setBusinessType(s.business_type ?? '');
          }
        } else {
          const { data: b } = await supabase.from('buyers').select('company_name').eq('user_id', user.id).single();
          if (b?.company_name) setProfile(p => ({ ...p, business_name: b.company_name ?? p.business_name }));
        }
      }

      // User settings
      const { data: st } = await supabase.from('user_settings').select('*').eq('user_id', user.id).single();
      if (st) {
        setEmailNotifs(st.email_notifs ?? true);
        setSmsNotifs(st.sms_notifs ?? true);
        setPushNotifs(st.push_notifs ?? true);
        setLanguage(st.language ?? 'en');
        setCurrency(st.currency ?? 'INR');
        setProfileVisible(st.profile_visible ?? true);
        setContactVisible(st.contact_visible ?? true);
      }

      // User preferences
      const { data: pr } = await supabase.from('user_preferences').select('*').eq('user_id', user.id).single();
      if (pr) {
        setCategories(pr.categories ?? []);
        setOrderType(pr.order_type ?? '');
        setFrequency(pr.frequency ?? '');
        setUrgency(pr.urgency ?? '');
        setDeliveryMethods(pr.delivery_methods ?? []);
        setPaymentUpi(pr.payment_upi ?? true);
        setPaymentBank(pr.payment_bank ?? true);
        setPaymentEmi(pr.payment_emi ?? false);
        setPaymentCod(pr.payment_cod ?? false);
        setBankUpiId(pr.bank_upi_id ?? '');
        setBankAccount(pr.bank_account_number ?? '');
        setBankIfsc(pr.bank_ifsc ?? '');
        setBankHolder(pr.bank_holder_name ?? '');
      }

      setLoading(false);
    }
    load();
  }, [router]);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setSaveMsg({ type: 'err', text: 'Image must be under 2MB' }); return; }
    setUploading(true);
    const supabase = createClient();
    const ext = file.name.split('.').pop();
    const path = `avatars/${userId}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('uploads').upload(path, file, { upsert: true });
    if (error) { setSaveMsg({ type: 'err', text: 'Upload failed: ' + error.message }); setUploading(false); return; }
    const { data: { publicUrl } } = supabase.storage.from('uploads').getPublicUrl(path);
    setProfile(p => ({ ...p, avatar_url: publicUrl }));
    setAvatarPreview(publicUrl);
    setUploading(false);
  }

  function toggleCategory(cat: string) {
    setCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  }

  function toggleDelivery(method: string) {
    setDeliveryMethods(prev => prev.includes(method) ? prev.filter(m => m !== method) : [...prev, method]);
  }

  async function handleSave() {
    if (!profile.full_name.trim()) { setSaveMsg({ type: 'err', text: 'Full name is required' }); return; }
    setSaving(true);
    setSaveMsg(null);
    const supabase = createClient();
    const errors: string[] = [];

    // Save to users table
    const { error: uErr } = await supabase.from('users').update({
      full_name: profile.full_name.trim(),
      phone: profile.phone.trim() || null,
      avatar_url: profile.avatar_url || null,
      city: profile.city.trim() || null,
      state: profile.state || null,
      pincode: profile.pincode.trim() || null,
      gst_number: profile.gst_number.trim() || null,
      business_name: profile.business_name.trim() || null,
    }).eq('id', userId);
    if (uErr) errors.push('Profile: ' + uErr.message);

    // Save to sellers or buyers table
    if (userRole === 'seller' || userRole === 'seller+buyer') {
      const { error: sErr } = await supabase.from('sellers').update({
        company_name: profile.business_name.trim() || null,
        business_type: businessType || null,
      }).eq('user_id', userId);
      if (sErr) errors.push('Seller info: ' + sErr.message);
    } else {
      const { error: bErr } = await supabase.from('buyers').update({
        company_name: profile.business_name.trim() || null,
      }).eq('user_id', userId);
      if (bErr) errors.push('Buyer info: ' + bErr.message);
    }

    // Save to user_settings
    const { error: stErr } = await supabase.from('user_settings').upsert({
      user_id: userId,
      email_notifs: emailNotifs,
      sms_notifs: smsNotifs,
      push_notifs: pushNotifs,
      language,
      currency,
      profile_visible: profileVisible,
      contact_visible: contactVisible,
    }, { onConflict: 'user_id' });
    if (stErr) errors.push('Notifications: ' + stErr.message);

    // Save to user_preferences
    const { error: prErr } = await supabase.from('user_preferences').upsert({
      user_id: userId,
      categories,
      order_type: orderType || null,
      frequency: frequency || null,
      urgency: urgency || null,
      delivery_methods: deliveryMethods,
      payment_upi: paymentUpi,
      payment_bank: paymentBank,
      payment_emi: paymentEmi,
      payment_cod: paymentCod,
      bank_upi_id: bankUpiId.trim() || null,
      bank_account_number: bankAccount.trim() || null,
      bank_ifsc: bankIfsc.trim() || null,
      bank_holder_name: bankHolder.trim() || null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });
    if (prErr && prErr.message.includes('does not exist')) {
      errors.push('Preferences not saved — create the user_preferences table in Supabase (see code comment in settings/page.tsx)');
    } else if (prErr) {
      errors.push('Preferences: ' + prErr.message);
    }

    setSaving(false);
    if (errors.length > 0) {
      setSaveMsg({ type: 'err', text: errors.join(' • ') });
    } else {
      setSaveMsg({ type: 'ok', text: 'All changes saved!' });
      setTimeout(() => setSaveMsg(null), 3000);
    }
  }

  const isSeller = userRole === 'seller' || userRole === 'seller+buyer';
  const isBuyer = userRole === 'buyer' || userRole === 'seller+buyer';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="text-sm" style={{ color: 'var(--text-inactive)' }}>Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4" style={{ background: 'var(--bg)' }}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-black mb-7" style={{ color: 'var(--text-primary)' }}>Account Settings</h1>

        {/* ── Profile picture ── */}
        <Card title="Profile Picture">
          <div className="flex items-center gap-5">
            <div
              className="shrink-0 flex items-center justify-center font-black text-2xl overflow-hidden"
              style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--active-bg)', color: '#fff' }}
            >
              {avatarPreview
                ? <img src={avatarPreview} alt="avatar" style={{ width: 80, height: 80, objectFit: 'cover' }} />
                : (profile.full_name?.[0]?.toUpperCase() || profile.email?.[0]?.toUpperCase() || '?')
              }
            </div>
            <div>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="px-5 py-2.5 text-sm font-semibold"
                style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-raised)', borderRadius: 'var(--radius-pill)', color: 'var(--text-primary)', opacity: uploading ? 0.6 : 1 }}
              >
                {uploading ? 'Uploading...' : 'Upload Photo'}
              </button>
              <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>JPG or PNG, max 2 MB</p>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>
          </div>
        </Card>

        {/* ── Personal info ── */}
        <Card title="Personal Information">
          <div className="space-y-4">
            <Field label="Full Name" value={profile.full_name} onChange={v => setProfile(p => ({ ...p, full_name: v }))} placeholder="Your full name" />
            <Field label="Email Address" value={profile.email} onChange={() => {}} placeholder="email@example.com" disabled />
            <Field label="Mobile Number" value={profile.phone} onChange={v => setProfile(p => ({ ...p, phone: v }))} placeholder="+91 98765 43210" type="tel" />
          </div>
        </Card>

        {/* ── Business info ── */}
        <Card title="Business Information">
          <div className="space-y-4">
            <Field label="Business / Company Name" value={profile.business_name} onChange={v => setProfile(p => ({ ...p, business_name: v }))} placeholder="ABC Manufacturers Pvt. Ltd." />
            {isSeller && (
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-inactive)' }}>Business Type</label>
                <select
                  value={businessType}
                  onChange={e => setBusinessType(e.target.value)}
                  className="w-full px-4 py-3 text-sm outline-none"
                  style={{ background: 'var(--input-bg)', boxShadow: 'var(--shadow-inset)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)' }}
                >
                  <option value="">Select type...</option>
                  {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>
            )}
            <Field label="GST Number" value={profile.gst_number} onChange={v => setProfile(p => ({ ...p, gst_number: v }))} placeholder="22AAAAA0000A1Z5" />
          </div>
        </Card>

        {/* ── Location ── */}
        <Card title="Location">
          <div className="space-y-4">
            <Field label="City" value={profile.city} onChange={v => setProfile(p => ({ ...p, city: v }))} placeholder="Mumbai" />
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-inactive)' }}>State</label>
              <select
                value={profile.state}
                onChange={e => setProfile(p => ({ ...p, state: e.target.value }))}
                className="w-full px-4 py-3 text-sm outline-none"
                style={{ background: 'var(--input-bg)', boxShadow: 'var(--shadow-inset)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)' }}
              >
                <option value="">Select state...</option>
                {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <Field label="Pincode" value={profile.pincode} onChange={v => setProfile(p => ({ ...p, pincode: v }))} placeholder="400001" />
          </div>
        </Card>

        {/* ── Categories ── */}
        <Card title="Product Categories">
          <p className="text-xs mb-3" style={{ color: 'var(--text-inactive)' }}>Select all categories you buy or sell in.</p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => {
              const active = categories.includes(cat);
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className="px-3 py-1.5 text-sm font-medium"
                  style={{
                    borderRadius: 'var(--radius-pill)',
                    background: active ? 'var(--active-bg)' : 'var(--input-bg)',
                    color: active ? '#fff' : 'var(--text-body)',
                    boxShadow: active ? 'var(--shadow-active)' : 'var(--shadow-soft)',
                    transition: 'all 0.18s ease',
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </Card>

        {/* ── Buyer preferences ── */}
        {isBuyer && (
          <Card title="Buying Preferences">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-inactive)' }}>Order Type</label>
                <select value={orderType} onChange={e => setOrderType(e.target.value)} className="w-full px-4 py-3 text-sm outline-none" style={{ background: 'var(--input-bg)', boxShadow: 'var(--shadow-inset)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)' }}>
                  <option value="">Select...</option>
                  {ORDER_TYPES.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-inactive)' }}>Purchase Frequency</label>
                <select value={frequency} onChange={e => setFrequency(e.target.value)} className="w-full px-4 py-3 text-sm outline-none" style={{ background: 'var(--input-bg)', boxShadow: 'var(--shadow-inset)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)' }}>
                  <option value="">Select...</option>
                  {FREQUENCIES.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-inactive)' }}>Delivery Urgency</label>
                <select value={urgency} onChange={e => setUrgency(e.target.value)} className="w-full px-4 py-3 text-sm outline-none" style={{ background: 'var(--input-bg)', boxShadow: 'var(--shadow-inset)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)' }}>
                  <option value="">Select...</option>
                  {URGENCY_OPTS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>
          </Card>
        )}

        {/* ── Seller delivery ── */}
        {isSeller && (
          <Card title="Delivery Options">
            <p className="text-xs mb-3" style={{ color: 'var(--text-inactive)' }}>Which delivery methods can you offer?</p>
            <div className="flex flex-wrap gap-2">
              {['Within City', 'State-wide', 'Pan-India', 'International'].map(method => {
                const active = deliveryMethods.includes(method);
                return (
                  <button key={method} type="button" onClick={() => toggleDelivery(method)}
                    className="px-3 py-1.5 text-sm font-medium"
                    style={{ borderRadius: 'var(--radius-pill)', background: active ? 'var(--active-bg)' : 'var(--input-bg)', color: active ? '#fff' : 'var(--text-body)', boxShadow: active ? 'var(--shadow-active)' : 'var(--shadow-soft)', transition: 'all 0.18s ease' }}
                  >
                    {method}
                  </button>
                );
              })}
            </div>
          </Card>
        )}

        {/* ── Payment methods ── */}
        <Card title="Payment Methods">
          <p className="text-xs mb-3" style={{ color: 'var(--text-inactive)' }}>Which payment methods do you accept / prefer?</p>
          <div className="space-y-1">
            {[
              { label: 'UPI', desc: 'Google Pay, PhonePe, Paytm', value: paymentUpi, setter: setPaymentUpi },
              { label: 'Bank Transfer / NEFT / RTGS', desc: 'Direct account transfer', value: paymentBank, setter: setPaymentBank },
              { label: 'EMI / Credit', desc: 'Equated monthly installments', value: paymentEmi, setter: setPaymentEmi },
              { label: 'Cash on Delivery', desc: 'Pay on receipt', value: paymentCod, setter: setPaymentCod },
            ].map(({ label, desc, value, setter }) => (
              <ToggleRow key={label} label={label} desc={desc} checked={value} onToggle={() => setter(v => !v)} />
            ))}
          </div>
        </Card>

        {/* ── Bank details (sellers) ── */}
        {isSeller && (
          <Card title="Bank & Payment Details">
            <p className="text-xs mb-4" style={{ color: 'var(--text-inactive)' }}>Used for receiving payments from buyers.</p>
            <div className="space-y-4">
              <Field label="UPI ID" value={bankUpiId} onChange={setBankUpiId} placeholder="yourname@upi" />
              <Field label="Account Holder Name" value={bankHolder} onChange={setBankHolder} placeholder="As per bank records" />
              <Field label="Account Number" value={bankAccount} onChange={setBankAccount} placeholder="12-digit account number" />
              <Field label="IFSC Code" value={bankIfsc} onChange={setBankIfsc} placeholder="HDFC0001234" />
            </div>
          </Card>
        )}

        {/* ── Notifications ── */}
        <Card title="Notifications">
          <div className="space-y-1">
            <ToggleRow label="Email Notifications" desc="Order updates, messages, and alerts via email" checked={emailNotifs} onToggle={() => setEmailNotifs(v => !v)} />
            <ToggleRow label="SMS Notifications" desc="Critical alerts via text message" checked={smsNotifs} onToggle={() => setSmsNotifs(v => !v)} />
            <ToggleRow label="Push Notifications" desc="Browser push notifications" checked={pushNotifs} onToggle={() => setPushNotifs(v => !v)} />
          </div>
        </Card>

        {/* ── App preferences ── */}
        <Card title="App Preferences">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-inactive)' }}>Language</label>
              <select value={language} onChange={e => setLanguage(e.target.value)} className="w-full px-4 py-3 text-sm outline-none" style={{ background: 'var(--input-bg)', boxShadow: 'var(--shadow-inset)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)' }}>
                {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-inactive)' }}>Currency</label>
              <select value={currency} onChange={e => setCurrency(e.target.value)} className="w-full px-4 py-3 text-sm outline-none" style={{ background: 'var(--input-bg)', boxShadow: 'var(--shadow-inset)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)' }}>
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>
          </div>
        </Card>

        {/* ── Privacy ── */}
        <Card title="Privacy">
          <div className="space-y-1">
            <ToggleRow label="Public Profile" desc="Allow other users to view your profile" checked={profileVisible} onToggle={() => setProfileVisible(v => !v)} />
            <ToggleRow label="Show Contact Details" desc="Allow sellers/buyers to see your contact information" checked={contactVisible} onToggle={() => setContactVisible(v => !v)} />
          </div>
        </Card>

        {/* Save message */}
        {saveMsg && (
          <div
            className="mb-4 px-4 py-3 text-sm font-medium"
            style={{
              borderRadius: 'var(--radius-sm)',
              background: saveMsg.type === 'ok' ? '#f0fdf4' : '#fff5f5',
              color: saveMsg.type === 'ok' ? '#15803d' : '#c0392b',
            }}
          >
            {saveMsg.text}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving || uploading}
          className="w-full py-4 text-base font-bold mb-10"
          style={{
            background: (saving || uploading) ? 'var(--input-bg)' : 'var(--active-bg)',
            color: (saving || uploading) ? 'var(--text-muted)' : '#fff',
            borderRadius: 'var(--radius-pill)',
            boxShadow: (saving || uploading) ? 'var(--shadow-soft)' : 'var(--shadow-active)',
            transition: 'all 0.2s ease',
          }}
        >
          {saving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4" style={{ background: 'var(--surface)', borderRadius: 'var(--radius-md)', padding: '24px 28px', boxShadow: 'var(--shadow-raised)' }}>
      <h2 className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, value, onChange, placeholder, disabled, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; disabled?: boolean; type?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-inactive)' }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full px-4 py-3 text-sm outline-none"
        style={{
          background: disabled ? 'var(--bg)' : 'var(--input-bg)',
          boxShadow: 'var(--shadow-inset)',
          borderRadius: 'var(--radius-sm)',
          color: disabled ? 'var(--text-muted)' : 'var(--text-primary)',
        }}
      />
    </div>
  );
}

function ToggleRow({ label, desc, checked, onToggle }: { label: string; desc: string; checked: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1 pr-4">
        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{label}</p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-inactive)' }}>{desc}</p>
      </div>
      <button
        type="button"
        onClick={onToggle}
        style={{
          width: 60, height: 33, borderRadius: 'var(--radius-pill)', flexShrink: 0,
          background: checked ? 'linear-gradient(150deg, #2e2e36, #0e0e12)' : 'var(--input-bg)',
          boxShadow: checked ? 'var(--shadow-active)' : 'var(--shadow-inset)',
          position: 'relative', transition: 'background 0.22s, box-shadow 0.22s',
        }}
      >
        <div style={{
          position: 'absolute', top: 4,
          left: checked ? 31 : 4,
          width: 25, height: 25, borderRadius: '50%',
          background: 'var(--surface)',
          boxShadow: '2px 2px 6px rgba(0,0,0,0.18)',
          transition: 'left 0.22s cubic-bezier(0.4,0,0.2,1)',
        }} />
      </button>
    </div>
  );
}
