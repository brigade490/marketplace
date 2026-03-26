'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Step = 'splash' | 'welcome' | 'account-type';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('splash');
  const [dir, setDir] = useState<'fwd' | 'bck'>('fwd');

  function goTo(next: Step) {
    setDir('fwd');
    setStep(next);
  }

  // Auto-advance from splash after 1500ms
  useEffect(() => {
    if (step !== 'splash') return;
    const t = setTimeout(() => goTo('welcome'), 1500);
    return () => clearTimeout(t);
  }, [step]);

  const animClass = dir === 'fwd' ? 'step-forward' : 'step-back';

  return (
    <div
      className="fixed inset-0 flex flex-col bg-white"
      style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
    >
      {step === 'splash' && <SplashScreen />}
      {step === 'welcome' && (
        <WelcomeScreen
          key="welcome"
          animClass={animClass}
          onGetStarted={() => goTo('account-type')}
          onLogin={() => router.push('/auth/buyer')}
        />
      )}
      {step === 'account-type' && (
        <AccountTypeScreen
          key="account-type"
          animClass={animClass}
          onBack={() => { setDir('bck'); setStep('welcome'); }}
          onSelect={(type) => router.push(type === 'buyer' ? '/' : '/seller/dashboard')}
        />
      )}
    </div>
  );
}

/* ─── Splash ─────────────────────────────────────────────── */
function SplashScreen() {
  return (
    <div
      className="flex-1 flex flex-col items-center justify-center"
      style={{ animation: 'fadeIn 600ms ease-out both' }}
    >
      <div
        className="text-4xl font-black text-black tracking-tight mb-3"
        style={{ animation: 'fadeSlideUp 500ms 200ms ease-out both' }}
      >
        Karobarrr
      </div>
      <p
        className="text-sm text-gray-400 font-medium"
        style={{ animation: 'fadeSlideUp 500ms 400ms ease-out both' }}
      >
        B2B Marketplace for India
      </p>
    </div>
  );
}

/* ─── Welcome ────────────────────────────────────────────── */
function WelcomeScreen({
  animClass,
  onGetStarted,
  onLogin,
}: {
  animClass: string;
  onGetStarted: () => void;
  onLogin: () => void;
}) {
  return (
    <div
      className={`flex-1 flex flex-col items-center justify-center px-8 text-center ${animClass}`}
    >
      <div
        className="mb-8 flex items-center justify-center bg-gray-50"
        style={{ width: 160, height: 160, borderRadius: '50%' }}
      >
        <span style={{ fontSize: 64 }}>🤝</span>
      </div>

      <h1 className="text-3xl font-black text-black mb-3 leading-tight">
        Welcome to<br />Karobarrr
      </h1>
      <p className="text-base text-gray-500 mb-12 leading-relaxed max-w-xs">
        India's largest B2B marketplace. Buy and sell in bulk — directly with verified businesses.
      </p>

      <div className="w-full max-w-sm flex flex-col gap-3">
        <button
          onClick={onGetStarted}
          className="w-full py-4 text-base font-bold"
          style={{ background: '#000', color: '#fff', borderRadius: '999px' }}
        >
          Get Started
        </button>
        <button
          onClick={onLogin}
          className="w-full py-4 text-base font-semibold"
          style={{ background: 'transparent', color: '#6b7280', borderRadius: '999px', border: '1.5px solid #e5e7eb' }}
        >
          I already have an account
        </button>
      </div>
    </div>
  );
}

/* ─── Account Type ───────────────────────────────────────── */
function AccountTypeScreen({
  animClass,
  onBack,
  onSelect,
}: {
  animClass: string;
  onBack: () => void;
  onSelect: (type: 'buyer' | 'seller') => void;
}) {
  const [selected, setSelected] = useState<'buyer' | 'seller' | null>(null);

  return (
    <div className={`flex-1 flex flex-col px-6 pt-12 pb-8 ${animClass}`}>
      {/* Back button */}
      <button
        onClick={onBack}
        className="self-start mb-8 flex items-center gap-1 text-sm font-semibold"
        style={{ background: 'transparent', color: '#111827', padding: '4px 0', borderRadius: 0 }}
      >
        <span style={{ fontSize: 18, lineHeight: 1 }}>‹</span> Back
      </button>

      <h1 className="text-2xl font-black text-black mb-2">How will you use<br />Karobarrr?</h1>
      <p className="text-sm text-gray-500 mb-8">Choose your account type to get started.</p>

      {/* Cards */}
      <div className="flex flex-col gap-4 mb-10">
        {/* Buyer card */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => setSelected('buyer')}
          onKeyDown={(e) => e.key === 'Enter' && setSelected('buyer')}
          className="card-lift flex items-center gap-5 p-5 bg-white cursor-pointer"
          style={{
            borderRadius: '16px',
            border: selected === 'buyer' ? '2px solid #000' : '1.5px solid #e5e7eb',
            boxShadow: selected === 'buyer' ? '0 4px 20px rgba(0,0,0,0.10)' : '0 2px 8px rgba(0,0,0,0.05)',
            transition: 'border 150ms ease-out, box-shadow 150ms ease-out',
          }}
        >
          <div
            className="flex items-center justify-center shrink-0"
            style={{ width: 56, height: 56, borderRadius: '14px', background: '#f3f4f6', fontSize: 28 }}
          >
            🛒
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-base font-black text-black mb-0.5">I am a Buyer</div>
            <div className="text-sm text-gray-500 leading-snug">Source products and raw materials from verified Indian suppliers.</div>
          </div>
          <div
            className="shrink-0 w-6 h-6 flex items-center justify-center"
            style={{
              borderRadius: '50%',
              background: selected === 'buyer' ? '#000' : '#fff',
              border: selected === 'buyer' ? 'none' : '1.5px solid #d1d5db',
              transition: 'all 150ms ease-out',
            }}
          >
            {selected === 'buyer' && (
              <span className="check-in text-white font-black" style={{ fontSize: 12 }}>✓</span>
            )}
          </div>
        </div>

        {/* Seller card */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => setSelected('seller')}
          onKeyDown={(e) => e.key === 'Enter' && setSelected('seller')}
          className="card-lift flex items-center gap-5 p-5 bg-white cursor-pointer"
          style={{
            borderRadius: '16px',
            border: selected === 'seller' ? '2px solid #000' : '1.5px solid #e5e7eb',
            boxShadow: selected === 'seller' ? '0 4px 20px rgba(0,0,0,0.10)' : '0 2px 8px rgba(0,0,0,0.05)',
            transition: 'border 150ms ease-out, box-shadow 150ms ease-out',
          }}
        >
          <div
            className="flex items-center justify-center shrink-0"
            style={{ width: 56, height: 56, borderRadius: '14px', background: '#f3f4f6', fontSize: 28 }}
          >
            🏭
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-base font-black text-black mb-0.5">I am a Seller</div>
            <div className="text-sm text-gray-500 leading-snug">List your products and reach thousands of B2B buyers across India.</div>
          </div>
          <div
            className="shrink-0 w-6 h-6 flex items-center justify-center"
            style={{
              borderRadius: '50%',
              background: selected === 'seller' ? '#000' : '#fff',
              border: selected === 'seller' ? 'none' : '1.5px solid #d1d5db',
              transition: 'all 150ms ease-out',
            }}
          >
            {selected === 'seller' && (
              <span className="check-in text-white font-black" style={{ fontSize: 12 }}>✓</span>
            )}
          </div>
        </div>
      </div>

      {/* Continue button */}
      <div className="mt-auto">
        <button
          onClick={() => selected && onSelect(selected)}
          className="w-full py-4 text-base font-bold"
          style={{
            background: selected ? '#000' : '#e5e7eb',
            color: selected ? '#fff' : '#9ca3af',
            borderRadius: '999px',
            transition: 'background 200ms ease-out, color 200ms ease-out',
            cursor: selected ? 'pointer' : 'default',
          }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
