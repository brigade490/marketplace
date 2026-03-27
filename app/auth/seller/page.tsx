'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function SellerAuthPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  async function upsertUserProfile(userId: string, userEmail: string) {
    const supabase = createClient();
    await supabase.from('users').upsert(
      { id: userId, email: userEmail, full_name: userEmail.split('@')[0], updated_at: new Date().toISOString() },
      { onConflict: 'id' }
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setLoading(true);
    const supabase = createClient();
    if (tab === 'login') {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setError(error.message); }
      else if (data.user) {
        await upsertUserProfile(data.user.id, data.user.email!);
        const { data: userData } = await supabase.from('users').select('onboarding_completed, role').eq('id', data.user.id).single();
        if (userData?.onboarding_completed) {
          router.push(userData.role === 'seller' ? '/seller/dashboard' : '/');
        } else {
          router.push('/onboarding');
        }
        router.refresh();
      }
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/auth/callback` } });
      if (error) {
        setError(error.message);
      } else if (data.session) {
        // Email confirmation disabled — session returned immediately
        await upsertUserProfile(data.user!.id, data.user!.email!);
        router.push('/onboarding');
        router.refresh();
        return;
      } else {
        // Email confirmation required
        setEmailSent(true);
      }
    }
    setLoading(false);
  }

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-16" style={{ background: 'var(--bg)' }}>
        <div
          className="w-full text-center"
          style={{ maxWidth: '440px', background: 'var(--surface)', boxShadow: 'var(--shadow-raised)', borderRadius: 'var(--radius-md)', padding: '48px 36px' }}
        >
          <a href="/" className="block text-center text-2xl font-black mb-8" style={{ color: 'var(--text-primary)' }}>
            Karobarrr
          </a>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#f0fff4', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#27ae60" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>Check your email</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-inactive)', lineHeight: '1.6' }}>
            We sent a confirmation link to <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>. Click the link to activate your account and continue to onboarding.
          </p>
          <p className="text-xs" style={{ color: 'var(--text-inactive)' }}>
            Already confirmed?{' '}
            <button
              type="button"
              onClick={() => { setEmailSent(false); setTab('login'); }}
              className="underline font-semibold"
              style={{ color: 'var(--text-primary)', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16" style={{ background: 'var(--bg)' }}>
      <div
        className="w-full"
        style={{ maxWidth: '440px', background: 'var(--surface)', boxShadow: 'var(--shadow-raised)', borderRadius: 'var(--radius-md)', padding: '40px 36px' }}
      >
        <a href="/" className="block text-center text-2xl font-black mb-8" style={{ color: 'var(--text-primary)' }}>
          Karobarrr
        </a>

        <div className="neu-tab-bar mb-8">
          {(['login', 'signup'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => { setTab(t); setError(''); }}
              className={`neu-tab flex-1${tab === t ? ' active' : ''}`}
            >
              {t === 'login' ? 'Login' : 'Sign Up'}
            </button>
          ))}
        </div>

        <h2 className="text-xl font-black mb-1" style={{ color: 'var(--text-primary)' }}>
          {tab === 'login' ? 'Seller login' : 'Create seller account'}
        </h2>
        <p className="text-sm mb-6" style={{ color: 'var(--text-inactive)' }}>
          {tab === 'login' ? 'Sign in to manage your store.' : 'Join thousands of sellers on Karobarrr.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-inactive)' }}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              className="w-full px-4 py-3 text-sm"
              style={{ borderRadius: 'var(--radius-sm)', background: 'var(--input-bg)', boxShadow: 'var(--shadow-inset)', color: 'var(--text-primary)' }}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-inactive)' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full px-4 py-3 text-sm"
              style={{ borderRadius: 'var(--radius-sm)', background: 'var(--input-bg)', boxShadow: 'var(--shadow-inset)', color: 'var(--text-primary)' }}
            />
          </div>

          {error && (
            <p className="text-xs px-3 py-2" style={{ borderRadius: 'var(--radius-sm)', background: '#fff0f0', color: '#c0392b', boxShadow: 'inset 2px 2px 6px rgba(192,57,43,0.1)' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 text-sm font-bold"
            style={{ background: 'var(--active-bg)', color: '#fff', borderRadius: 'var(--radius-pill)', boxShadow: 'var(--shadow-active)', opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Please wait...' : tab === 'login' ? 'Login' : 'Create Account'}
          </button>
        </form>

        <p className="text-xs text-center mt-6" style={{ color: 'var(--text-inactive)' }}>
          Looking to buy?{' '}
          <a href="/auth/buyer" className="underline font-semibold">Buyer login</a>
        </p>
      </div>
    </div>
  );
}
