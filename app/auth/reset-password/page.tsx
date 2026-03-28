'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  // The callback route exchanges the code and sets a session; wait for it
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setSessionReady(true);
      else setError('Reset link is invalid or has expired. Please request a new one.');
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setError(''); setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
    } else {
      await supabase.auth.signOut();
      setDone(true);
    }
    setLoading(false);
  }

  const cardStyle = {
    maxWidth: '440px',
    background: 'var(--surface)',
    boxShadow: 'var(--shadow-raised)',
    borderRadius: 'var(--radius-md)',
    padding: '40px 36px',
  };
  const inputStyle: React.CSSProperties = {
    borderRadius: '8px',
    background: '#f0f0f0',
    border: '1px solid #e0e0e0',
    boxShadow: 'none',
    color: '#111',
    outline: 'none',
  };

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-16" style={{ background: 'var(--bg)' }}>
        <div className="w-full text-center" style={{ ...cardStyle, padding: '48px 36px' }}>
          <a href="/" className="block text-center text-2xl font-black mb-8" style={{ color: 'var(--text-primary)' }}>Karobarrr</a>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#f0fff4', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#27ae60" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>Password updated</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-inactive)', lineHeight: 1.6 }}>
            Your password has been changed successfully. You can now log in with your new password.
          </p>
          <button type="button" onClick={() => router.push('/auth/buyer')}
            className="w-full py-3.5 text-sm font-bold"
            style={{ background: 'var(--active-bg)', color: '#fff', borderRadius: 'var(--radius-pill)', boxShadow: 'var(--shadow-active)', cursor: 'pointer' }}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16" style={{ background: 'var(--bg)' }}>
      <div className="w-full" style={cardStyle}>
        <a href="/" className="block text-center text-2xl font-black mb-8" style={{ color: 'var(--text-primary)' }}>Karobarrr</a>
        <h2 className="text-xl font-black mb-1" style={{ color: 'var(--text-primary)' }}>Set new password</h2>
        <p className="text-sm mb-6" style={{ color: 'var(--text-inactive)' }}>Choose a strong password for your account.</p>

        {!sessionReady && !error && (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 spinner" />
          </div>
        )}

        {error && !sessionReady && (
          <div>
            <p className="text-xs px-3 py-2 mb-4" style={{ borderRadius: 'var(--radius-sm)', background: '#fff0f0', color: '#c0392b' }}>{error}</p>
            <a href="/auth/buyer" className="text-sm underline font-semibold" style={{ color: 'var(--text-primary)' }}>
              Request a new reset link
            </a>
          </div>
        )}

        {sessionReady && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-inactive)' }}>New Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" required minLength={6} className="w-full px-4 py-3 text-sm" style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-inactive)' }}>Confirm Password</label>
              <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••" required minLength={6} className="w-full px-4 py-3 text-sm" style={inputStyle} />
            </div>
            {error && (
              <p className="text-xs px-3 py-2" style={{ borderRadius: 'var(--radius-sm)', background: '#fff0f0', color: '#c0392b' }}>{error}</p>
            )}
            <button type="submit" disabled={loading} className="w-full py-3.5 text-sm font-bold"
              style={{ background: 'var(--active-bg)', color: '#fff', borderRadius: 'var(--radius-pill)', boxShadow: 'var(--shadow-active)', opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
