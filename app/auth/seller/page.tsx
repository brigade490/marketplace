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
  const [success, setSuccess] = useState('');

  async function upsertUserProfile(userId: string, userEmail: string) {
    const supabase = createClient();
    await supabase.from('users').upsert(
      { id: userId, email: userEmail, full_name: userEmail.split('@')[0], updated_at: new Date().toISOString() },
      { onConflict: 'id' }
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    const supabase = createClient();
    if (tab === 'login') {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      else if (data.user) { await upsertUserProfile(data.user.id, data.user.email!); router.push('/become-seller'); router.refresh(); }
    } else {
      const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/auth/callback` } });
      if (error) setError(error.message);
      else setSuccess('Check your email to confirm your account, then come back to log in.');
    }
    setLoading(false);
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
              onClick={() => { setTab(t); setError(''); setSuccess(''); }}
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
          {success && (
            <p className="text-xs px-3 py-2" style={{ borderRadius: 'var(--radius-sm)', background: '#f0fff4', color: '#27ae60', boxShadow: 'inset 2px 2px 6px rgba(39,174,96,0.1)' }}>
              {success}
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
