'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function parseAuthError(msg: string): string {
  if (msg.includes('Invalid login credentials')) return 'Incorrect password, please try again.';
  if (msg.includes('user not found') || msg.includes('User not found') || msg.includes('no rows')) return 'No account found with this email.';
  if (msg.includes('Email not confirmed')) return 'Please confirm your email before logging in.';
  if (msg.includes('Too many requests')) return 'Too many attempts, please try again later.';
  if (msg.includes('Password should be at least')) return 'Password must be at least 6 characters.';
  return msg;
}

type View = 'choose' | 'login' | 'signup-email' | 'signup-password' | 'login-found' | 'forgot' | 'email-sent' | 'forgot-sent';

const inputCls = 'w-full px-4 py-3 text-sm';
const inputSt: React.CSSProperties = { borderRadius: '14px', background: '#d8d8dc', border: 'none', outline: 'none', boxShadow: 'inset 4px 4px 10px rgba(140,140,152,0.4), inset -4px -4px 10px rgba(255,255,255,0.9)', color: '#4a4a52', fontSize: '15px' };

export default function AuthPage() {
  const router = useRouter();
  const [view, setView] = useState<View>('choose');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function go(v: View) { setView(v); setError(''); }

  async function upsertUser(userId: string, userEmail: string) {
    const supabase = createClient();
    await supabase.from('users').upsert(
      { id: userId, email: userEmail, full_name: userEmail.split('@')[0], updated_at: new Date().toISOString() },
      { onConflict: 'id' }
    );
  }

  async function redirectAfterLogin(userId: string, supabase: ReturnType<typeof createClient>) {
    const { data } = await supabase.from('users').select('onboarding_completed').eq('id', userId).single();
    router.push(data?.onboarding_completed ? '/' : '/onboarding');
    router.refresh();
  }

  // "I am new here" — check if email already exists, then route accordingly
  async function handleEmailContinue(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setLoading(true);
    const supabase = createClient();
    // Try the users table (works if RLS allows; gracefully falls back)
    const { data: existing } = await supabase.from('users').select('id').eq('email', email.trim().toLowerCase()).maybeSingle();
    setLoading(false);
    if (existing) {
      go('login-found'); // email found — show login form with message
    } else {
      go('signup-password'); // genuinely new — show password creation
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(parseAuthError(error.message)); setLoading(false); return; }
    if (data.user) {
      await upsertUser(data.user.id, data.user.email!);
      await redirectAfterLogin(data.user.id, supabase);
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      if (error.message.toLowerCase().includes('already registered') || error.message.toLowerCase().includes('already exists')) {
        // Auto sign-in — account exists with this password
        const { data: ld, error: le } = await supabase.auth.signInWithPassword({ email, password });
        if (le) { setError('An account with this email already exists. Please log in instead.'); setLoading(false); return; }
        if (ld.user) { await upsertUser(ld.user.id, ld.user.email!); await redirectAfterLogin(ld.user.id, supabase); return; }
      } else { setError(parseAuthError(error.message)); setLoading(false); return; }
    } else if (data.session) {
      await upsertUser(data.user!.id, data.user!.email!);
      router.push('/onboarding'); router.refresh();
    } else {
      go('email-sent');
    }
    setLoading(false);
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
    });
    if (error) setError(parseAuthError(error.message));
    else go('forgot-sent');
    setLoading(false);
  }

  const card = { maxWidth: '440px', background: 'var(--surface)', boxShadow: 'var(--shadow-raised)', borderRadius: 'var(--radius-md)', padding: '40px 36px' };
  const btnPrimary: React.CSSProperties = { background: '#000', color: '#fff', borderRadius: '999px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 };
  const errBox = <p className="text-xs px-3 py-2" style={{ borderRadius: '8px', background: '#fff0f0', color: '#c0392b' }}>{error}</p>;

  // ── Choose view ──────────────────────────────────────────
  if (view === 'choose') return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16" style={{ background: 'var(--bg)' }}>
      <div className="w-full" style={card}>
        <a href="/" className="block text-center text-2xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>Karobarrr</a>
        <p className="text-center text-sm mb-10" style={{ color: 'var(--text-inactive)' }}>B2B Marketplace for India</p>
        <div className="flex flex-col gap-3">
          <button onClick={() => go('login')} className="w-full py-4 text-sm font-bold"
            style={{ background: '#000', color: '#fff', borderRadius: '999px', border: 'none', cursor: 'pointer' }}>
            I have an account
          </button>
          <button onClick={() => go('signup-email')} className="w-full py-4 text-sm font-bold"
            style={{ background: '#fff', color: '#000', borderRadius: '999px', border: '1.5px solid #000', cursor: 'pointer' }}>
            I am new here
          </button>
        </div>
        <p className="text-xs text-center mt-6" style={{ color: 'var(--text-inactive)' }}>
          Are you a seller?{' '}<a href="/auth/seller" className="underline font-semibold" style={{ color: 'var(--text-primary)' }}>Seller login</a>
        </p>
      </div>
    </div>
  );

  // ── Login view ───────────────────────────────────────────
  if (view === 'login') return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16" style={{ background: 'var(--bg)' }}>
      <div className="w-full" style={card}>
        <a href="/" className="block text-center text-2xl font-black mb-8" style={{ color: 'var(--text-primary)' }}>Karobarrr</a>
        <h2 className="text-xl font-black mb-1" style={{ color: 'var(--text-primary)' }}>Welcome back</h2>
        <p className="text-sm mb-6" style={{ color: 'var(--text-inactive)' }}>Sign in to your account.</p>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-inactive)' }}>Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required className={inputCls} style={inputSt} />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-inactive)' }}>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} className={inputCls} style={inputSt} />
          </div>
          <div className="text-right">
            <button type="button" onClick={() => { go('forgot'); setForgotEmail(email); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-inactive)', fontSize: '12px', textDecoration: 'underline' }}>
              Forgot password?
            </button>
          </div>
          {error && errBox}
          <button type="submit" disabled={loading} className="w-full py-3.5 text-sm font-bold" style={btnPrimary}>
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>
        <button type="button" onClick={() => go('choose')} className="w-full text-xs text-center mt-4"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-inactive)', textDecoration: 'underline' }}>
          ← Back
        </button>
      </div>
    </div>
  );

  // ── New user — email check ───────────────────────────────
  if (view === 'signup-email') return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16" style={{ background: 'var(--bg)' }}>
      <div className="w-full" style={card}>
        <a href="/" className="block text-center text-2xl font-black mb-8" style={{ color: 'var(--text-primary)' }}>Karobarrr</a>
        <h2 className="text-xl font-black mb-1" style={{ color: 'var(--text-primary)' }}>Create your account</h2>
        <p className="text-sm mb-6" style={{ color: 'var(--text-inactive)' }}>Enter your email to get started.</p>
        <form onSubmit={handleEmailContinue} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-inactive)' }}>Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required className={inputCls} style={inputSt} />
          </div>
          {error && errBox}
          <button type="submit" disabled={loading} className="w-full py-3.5 text-sm font-bold" style={btnPrimary}>
            {loading ? 'Checking...' : 'Continue'}
          </button>
        </form>
        <button type="button" onClick={() => go('choose')} className="w-full text-xs text-center mt-4"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-inactive)', textDecoration: 'underline' }}>
          ← Back
        </button>
      </div>
    </div>
  );

  // ── Existing email found — ask them to log in ────────────
  if (view === 'login-found') return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16" style={{ background: 'var(--bg)' }}>
      <div className="w-full" style={card}>
        <a href="/" className="block text-center text-2xl font-black mb-8" style={{ color: 'var(--text-primary)' }}>Karobarrr</a>
        <div className="mb-5 px-3 py-3" style={{ background: '#fff8e1', borderRadius: '8px', border: '1px solid #ffe082' }}>
          <p className="text-sm font-semibold" style={{ color: '#5d4037' }}>Account already exists</p>
          <p className="text-xs mt-0.5" style={{ color: '#795548' }}>
            <strong>{email}</strong> is already registered. Enter your password to log in.
          </p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-inactive)' }}>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} className={inputCls} style={inputSt} autoFocus />
          </div>
          <div className="text-right">
            <button type="button" onClick={() => { go('forgot'); setForgotEmail(email); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-inactive)', fontSize: '12px', textDecoration: 'underline' }}>
              Forgot password?
            </button>
          </div>
          {error && errBox}
          <button type="submit" disabled={loading} className="w-full py-3.5 text-sm font-bold" style={btnPrimary}>
            {loading ? 'Signing in...' : 'Log in to my account'}
          </button>
        </form>
        <button type="button" onClick={() => go('signup-email')} className="w-full text-xs text-center mt-4"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-inactive)', textDecoration: 'underline' }}>
          ← Use a different email
        </button>
      </div>
    </div>
  );

  // ── New user — create password ───────────────────────────
  if (view === 'signup-password') return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16" style={{ background: 'var(--bg)' }}>
      <div className="w-full" style={card}>
        <a href="/" className="block text-center text-2xl font-black mb-8" style={{ color: 'var(--text-primary)' }}>Karobarrr</a>
        <h2 className="text-xl font-black mb-1" style={{ color: 'var(--text-primary)' }}>Create a password</h2>
        <p className="text-sm mb-6" style={{ color: 'var(--text-inactive)' }}>
          Creating account for <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>
        </p>
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-inactive)' }}>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 6 characters" required minLength={6} className={inputCls} style={inputSt} autoFocus />
          </div>
          {error && errBox}
          <button type="submit" disabled={loading} className="w-full py-3.5 text-sm font-bold" style={btnPrimary}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <button type="button" onClick={() => go('signup-email')} className="w-full text-xs text-center mt-4"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-inactive)', textDecoration: 'underline' }}>
          ← Change email
        </button>
      </div>
    </div>
  );

  // ── Email sent ───────────────────────────────────────────
  if (view === 'email-sent') return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16" style={{ background: 'var(--bg)' }}>
      <div className="w-full text-center" style={{ ...card, padding: '48px 36px' }}>
        <a href="/" className="block text-center text-2xl font-black mb-8" style={{ color: 'var(--text-primary)' }}>Karobarrr</a>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#f0fff4', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#27ae60" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>Check your email</h2>
        <p className="text-sm mb-6" style={{ color: 'var(--text-inactive)', lineHeight: 1.6 }}>
          We sent a confirmation link to <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>. Click it to activate your account.
        </p>
        <button type="button" onClick={() => go('login')} className="text-xs underline font-semibold"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}>
          Already confirmed? Sign in
        </button>
      </div>
    </div>
  );

  // ── Forgot password ──────────────────────────────────────
  if (view === 'forgot') return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16" style={{ background: 'var(--bg)' }}>
      <div className="w-full" style={card}>
        <a href="/" className="block text-center text-2xl font-black mb-8" style={{ color: 'var(--text-primary)' }}>Karobarrr</a>
        <h2 className="text-xl font-black mb-1" style={{ color: 'var(--text-primary)' }}>Reset your password</h2>
        <p className="text-sm mb-6" style={{ color: 'var(--text-inactive)' }}>Enter your email and we'll send a reset link.</p>
        <form onSubmit={handleForgotPassword} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-inactive)' }}>Email Address</label>
            <input type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} placeholder="you@company.com" required className={inputCls} style={inputSt} />
          </div>
          {error && errBox}
          <button type="submit" disabled={loading} className="w-full py-3.5 text-sm font-bold" style={btnPrimary}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
          <button type="button" onClick={() => go('login')} className="w-full text-sm"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-inactive)', textDecoration: 'underline' }}>
            Back to login
          </button>
        </form>
      </div>
    </div>
  );

  // ── Forgot sent ──────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16" style={{ background: 'var(--bg)' }}>
      <div className="w-full text-center" style={{ ...card, padding: '48px 36px' }}>
        <a href="/" className="block text-center text-2xl font-black mb-8" style={{ color: 'var(--text-primary)' }}>Karobarrr</a>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#f0fff4', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#27ae60" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>Reset link sent</h2>
        <p className="text-sm mb-6" style={{ color: 'var(--text-inactive)', lineHeight: 1.6 }}>
          Check your inbox at <strong style={{ color: 'var(--text-primary)' }}>{forgotEmail}</strong> for the reset link.
        </p>
        <button type="button" onClick={() => go('login')} className="text-sm underline font-semibold"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}>
          Back to login
        </button>
      </div>
    </div>
  );
}
