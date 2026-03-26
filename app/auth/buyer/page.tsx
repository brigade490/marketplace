'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function AuthPage() {
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
      {
        id: userId,
        email: userEmail,
        full_name: userEmail.split('@')[0],
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const supabase = createClient();

    if (tab === 'login') {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
      } else if (data.user) {
        await upsertUserProfile(data.user.id, data.user.email!);
        router.push('/');
        router.refresh();
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) {
        setError(error.message);
      } else {
        setSuccess('Check your email to confirm your account, then come back to log in.');
      }
    }

    setLoading(false);
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-16"
      style={{ background: '#f7f7f8' }}
    >
      <div
        className="w-full bg-white"
        style={{
          maxWidth: '440px',
          borderRadius: '16px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.09)',
          padding: '40px 36px',
        }}
      >
        {/* Logo */}
        <a href="/" className="block text-center text-2xl font-black text-black mb-8">
          Karobarrr
        </a>

        {/* Tab toggle */}
        <div
          className="flex mb-8 p-1"
          style={{ background: '#f7f7f8', borderRadius: '10px' }}
        >
          {(['login', 'signup'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => { setTab(t); setError(''); setSuccess(''); }}
              style={{
                flex: 1,
                padding: '8px 0',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                transition: 'all 0.15s',
                background: tab === t ? '#000000' : 'transparent',
                color: tab === t ? '#ffffff' : '#6b7280',
              }}
            >
              {t === 'login' ? 'Login' : 'Sign Up'}
            </button>
          ))}
        </div>

        <h2 className="text-xl font-black text-black mb-1">
          {tab === 'login' ? 'Welcome back' : 'Create your account'}
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          {tab === 'login'
            ? 'Sign in to your Karobarrr account.'
            : 'Join thousands of B2B businesses on Karobarrr.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              className="w-full px-4 py-3 text-sm text-black placeholder-gray-400 outline-none transition"
              style={{ border: '1.5px solid #e5e7eb', borderRadius: '10px', background: '#ffffff' }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#000000')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#e5e7eb')}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full px-4 py-3 text-sm text-black placeholder-gray-400 outline-none transition"
              style={{ border: '1.5px solid #e5e7eb', borderRadius: '10px', background: '#ffffff' }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#000000')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#e5e7eb')}
            />
          </div>

          {tab === 'login' && (
            <div className="text-right">
              <a href="#" className="text-xs text-gray-500 hover:text-black transition-colors">
                Forgot password?
              </a>
            </div>
          )}

          {error && (
            <p className="text-xs text-red-600 bg-red-50 px-3 py-2" style={{ borderRadius: '8px' }}>
              {error}
            </p>
          )}

          {success && (
            <p className="text-xs text-green-700 bg-green-50 px-3 py-2" style={{ borderRadius: '8px' }}>
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 text-sm font-bold text-white transition-opacity"
            style={{
              background: '#000000',
              borderRadius: '999px',
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Please wait...' : tab === 'login' ? 'Login' : 'Create Account'}
          </button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-6">
          By continuing, you agree to our{' '}
          <a href="#" className="underline hover:text-black">Terms of Service</a>{' '}
          and{' '}
          <a href="#" className="underline hover:text-black">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}
