'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface Settings {
  email_notifs: boolean;
  sms_notifs: boolean;
  push_notifs: boolean;
  language: string;
  currency: string;
  profile_visible: boolean;
  contact_visible: boolean;
}

const DEFAULT_SETTINGS: Settings = {
  email_notifs: true,
  sms_notifs: true,
  push_notifs: true,
  language: 'en',
  currency: 'INR',
  profile_visible: true,
  contact_visible: true,
};

const LANGUAGES = [{ code: 'en', label: 'English' }, { code: 'hi', label: 'Hindi' }, { code: 'gu', label: 'Gujarati' }, { code: 'mr', label: 'Marathi' }, { code: 'ta', label: 'Tamil' }];
const CURRENCIES = [{ code: 'INR', label: 'INR (₹)' }, { code: 'USD', label: 'USD ($)' }, { code: 'EUR', label: 'EUR (€)' }];

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [userId, setUserId] = useState('');

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/buyer'); return; }
      setUserId(user.id);

      const { data } = await supabase.from('user_settings').select('*').eq('user_id', user.id).single();
      if (data) {
        setSettings({
          email_notifs: data.email_notifs,
          sms_notifs: data.sms_notifs,
          push_notifs: data.push_notifs,
          language: data.language,
          currency: data.currency,
          profile_visible: data.profile_visible,
          contact_visible: data.contact_visible,
        });
      }
      setLoading(false);
    }
    load();
  }, [router]);

  function toggle(key: keyof Settings) {
    setSettings(s => ({ ...s, [key]: !s[key] }));
  }

  function select(key: keyof Settings, val: string) {
    setSettings(s => ({ ...s, [key]: val }));
  }

  async function handleSave() {
    setSaving(true);
    setSuccess('');
    const supabase = createClient();
    await supabase.from('user_settings').upsert({ ...settings, user_id: userId }, { onConflict: 'user_id' });
    setSuccess('Settings saved successfully!');
    setSaving(false);
    setTimeout(() => setSuccess(''), 3000);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="text-gray-400 text-sm">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4" style={{ background: 'var(--bg)' }}>
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-black  mb-6">Settings</h1>

        {/* Notifications */}
        <Section title="Notifications">
          <ToggleRow
            label="Email Notifications"
            description="Receive order updates, messages, and alerts via email"
            checked={settings.email_notifs}
            onToggle={() => toggle('email_notifs')}
          />
          <ToggleRow
            label="SMS Notifications"
            description="Get SMS alerts for critical updates"
            checked={settings.sms_notifs}
            onToggle={() => toggle('sms_notifs')}
          />
          <ToggleRow
            label="Push Notifications"
            description="Receive browser push notifications"
            checked={settings.push_notifs}
            onToggle={() => toggle('push_notifs')}
          />
        </Section>

        {/* Preferences */}
        <Section title="Account Preferences">
          <div className="py-3">
            <label className="block text-sm font-semibold  mb-2">Language</label>
            <select
              value={settings.language}
              onChange={e => select('language', e.target.value)}
              className="w-full px-4 py-3 text-sm  outline-none"
              style={{ boxShadow: 'var(--shadow-inset)', background: 'var(--input-bg)', borderRadius: '10px' }}
            >
              {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
            </select>
          </div>
          <div className="py-3" style={{  }}>
            <label className="block text-sm font-semibold  mb-2">Currency</label>
            <select
              value={settings.currency}
              onChange={e => select('currency', e.target.value)}
              className="w-full px-4 py-3 text-sm  outline-none"
              style={{ boxShadow: 'var(--shadow-inset)', background: 'var(--input-bg)', borderRadius: '10px' }}
            >
              {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
            </select>
          </div>
        </Section>

        {/* Privacy */}
        <Section title="Privacy">
          <ToggleRow
            label="Public Profile"
            description="Allow other users to view your profile"
            checked={settings.profile_visible}
            onToggle={() => toggle('profile_visible')}
          />
          <ToggleRow
            label="Show Contact Details"
            description="Allow sellers/buyers to see your contact information"
            checked={settings.contact_visible}
            onToggle={() => toggle('contact_visible')}
          />
        </Section>

        {success && (
          <div className="mb-4 px-4 py-3 bg-green-50 text-green-700 text-sm font-semibold" style={{ borderRadius: '10px' }}>
            {success}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3.5 text-sm font-bold text-white"
          style={{ background: 'var(--active-bg)', borderRadius: 'var(--radius-sm)', opacity: saving ? 0.6 : 1 }}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white mb-4" style={{ borderRadius: 'var(--radius-sm)', padding: '20px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
      <h2 className="text-sm font-black  mb-1 uppercase tracking-wider text-xs text-gray-400">{title}</h2>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function ToggleRow({ label, description, checked, onToggle }: {
  label: string; description: string; checked: boolean; onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between py-3" style={{  }}>
      <div className="flex-1 pr-4">
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      </div>
      <button
        type="button"
        onClick={onToggle}
        style={{
          width: '44px', height: '24px', borderRadius: 'var(--radius-pill)', flexShrink: 0,
          background: checked ? 'var(--active-bg)' : '#e5e7eb',
          position: 'relative', transition: 'background 0.2s',
        }}
      >
        <div
          style={{
            position: 'absolute', top: '3px',
            left: checked ? '23px' : '3px',
            width: '18px', height: '18px',
            borderRadius: '50%', background: 'var(--surface)',
            transition: 'left 0.2s',
          }}
        />
      </button>
    </div>
  );
}
