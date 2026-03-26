'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Step = 'splash' | 'welcome' | 'account-type' | 'b-basic' | 'b-business';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('splash');
  const [dir, setDir] = useState<'fwd' | 'bck'>('fwd');

  // Buyer form state
  const [buyerBasic, setBuyerBasic] = useState({ name: '', email: '' });
  const [buyerBusiness, setBuyerBusiness] = useState({ businessName: '', businessType: '' });

  function goTo(next: Step) {
    setDir('fwd');
    setStep(next);
  }
  function goBack(prev: Step) {
    setDir('bck');
    setStep(prev);
  }

  // Auto-advance from splash after 1500ms
  useEffect(() => {
    if (step !== 'splash') return;
    const t = setTimeout(() => goTo('welcome'), 1500);
    return () => clearTimeout(t);
  }, [step]);

  const animClass = dir === 'fwd' ? 'step-forward' : 'step-back';

  // Progress bar — step index out of total buyer steps (2 so far after account-type)
  const progressMap: Partial<Record<Step, number>> = {
    'b-basic': 1,
    'b-business': 2,
  };
  const totalBuyerSteps = 2;
  const currentProgress = progressMap[step];

  return (
    <div
      className="fixed inset-0 flex flex-col bg-white"
      style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
    >
      {/* Progress bar — only shown during buyer steps */}
      {currentProgress !== undefined && (
        <div className="w-full h-1 bg-gray-100 shrink-0">
          <div
            className="h-full bg-black progress-bar"
            style={{ width: `${(currentProgress / totalBuyerSteps) * 100}%` }}
          />
        </div>
      )}

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
          onBack={() => goBack('welcome')}
          onSelect={(type) => {
            if (type === 'buyer') goTo('b-basic');
            else router.push('/seller/dashboard');
          }}
        />
      )}

      {step === 'b-basic' && (
        <BuyerBasicScreen
          key="b-basic"
          animClass={animClass}
          values={buyerBasic}
          onChange={(v) => setBuyerBasic(v)}
          onBack={() => goBack('account-type')}
          onNext={() => goTo('b-business')}
        />
      )}

      {step === 'b-business' && (
        <BuyerBusinessScreen
          key="b-business"
          animClass={animClass}
          values={buyerBusiness}
          onChange={(v) => setBuyerBusiness(v)}
          onBack={() => goBack('b-basic')}
          onNext={() => router.push('/')}
        />
      )}
    </div>
  );
}

/* ─── Shared: Back button ────────────────────────────────── */
function BackBtn({ onBack }: { onBack: () => void }) {
  return (
    <button
      onClick={onBack}
      className="self-start mb-8 flex items-center gap-1 text-sm font-semibold"
      style={{ background: 'transparent', color: '#111827', padding: '4px 0', borderRadius: 0 }}
    >
      <span style={{ fontSize: 18, lineHeight: 1 }}>‹</span> Back
    </button>
  );
}

/* ─── Shared: Continue button ───────────────────────────── */
function ContinueBtn({ disabled, onClick }: { disabled: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full py-4 text-base font-bold"
      style={{
        background: disabled ? '#e5e7eb' : '#000',
        color: disabled ? '#9ca3af' : '#fff',
        borderRadius: '999px',
        transition: 'background 200ms ease-out, color 200ms ease-out',
        cursor: disabled ? 'default' : 'pointer',
      }}
    >
      Continue
    </button>
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
    <div className={`flex-1 flex flex-col items-center justify-center px-8 text-center ${animClass}`}>
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
      <BackBtn onBack={onBack} />
      <h1 className="text-2xl font-black text-black mb-2">How will you use<br />Karobarrr?</h1>
      <p className="text-sm text-gray-500 mb-8">Choose your account type to get started.</p>

      <div className="flex flex-col gap-4 mb-10">
        {([
          { key: 'buyer', emoji: '🛒', title: 'I am a Buyer', desc: 'Source products and raw materials from verified Indian suppliers.' },
          { key: 'seller', emoji: '🏭', title: 'I am a Seller', desc: 'List your products and reach thousands of B2B buyers across India.' },
        ] as const).map(({ key, emoji, title, desc }) => (
          <div
            key={key}
            role="button"
            tabIndex={0}
            onClick={() => setSelected(key)}
            onKeyDown={(e) => e.key === 'Enter' && setSelected(key)}
            className="card-lift flex items-center gap-5 p-5 bg-white cursor-pointer"
            style={{
              borderRadius: '16px',
              border: selected === key ? '2px solid #000' : '1.5px solid #e5e7eb',
              boxShadow: selected === key ? '0 4px 20px rgba(0,0,0,0.10)' : '0 2px 8px rgba(0,0,0,0.05)',
              transition: 'border 150ms ease-out, box-shadow 150ms ease-out',
            }}
          >
            <div
              className="flex items-center justify-center shrink-0"
              style={{ width: 56, height: 56, borderRadius: '14px', background: '#f3f4f6', fontSize: 28 }}
            >
              {emoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-base font-black text-black mb-0.5">{title}</div>
              <div className="text-sm text-gray-500 leading-snug">{desc}</div>
            </div>
            <div
              className="shrink-0 w-6 h-6 flex items-center justify-center"
              style={{
                borderRadius: '50%',
                background: selected === key ? '#000' : '#fff',
                border: selected === key ? 'none' : '1.5px solid #d1d5db',
                transition: 'all 150ms ease-out',
              }}
            >
              {selected === key && (
                <span className="check-in text-white font-black" style={{ fontSize: 12 }}>✓</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto">
        <ContinueBtn disabled={!selected} onClick={() => selected && onSelect(selected)} />
      </div>
    </div>
  );
}

/* ─── Buyer Step 1: Basic Details ────────────────────────── */
function BuyerBasicScreen({
  animClass,
  values,
  onChange,
  onBack,
  onNext,
}: {
  animClass: string;
  values: { name: string; email: string };
  onChange: (v: { name: string; email: string }) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const valid = values.name.trim().length > 0 && values.email.trim().includes('@');

  return (
    <div className={`flex-1 flex flex-col px-6 pt-12 pb-8 ${animClass}`}>
      <BackBtn onBack={onBack} />
      <h1 className="text-2xl font-black text-black mb-2">Your basic details</h1>
      <p className="text-sm text-gray-500 mb-8">Tell us a bit about yourself.</p>

      <div className="flex flex-col gap-4 mb-auto">
        {/* Full Name */}
        <div
          className="float-field"
          style={{ border: '1.5px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}
        >
          <input
            type="text"
            placeholder=" "
            value={values.name}
            onChange={(e) => onChange({ ...values, name: e.target.value })}
            className="w-full px-4 text-sm text-black bg-white"
            style={{ height: 56, paddingTop: 20, paddingBottom: 8, fontSize: 15 }}
          />
          <label>Full Name</label>
        </div>

        {/* Email */}
        <div
          className="float-field"
          style={{ border: '1.5px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}
        >
          <input
            type="email"
            placeholder=" "
            value={values.email}
            onChange={(e) => onChange({ ...values, email: e.target.value })}
            className="w-full px-4 text-sm text-black bg-white"
            style={{ height: 56, paddingTop: 20, paddingBottom: 8, fontSize: 15 }}
          />
          <label>Email Address</label>
        </div>
      </div>

      <div className="mt-8">
        <ContinueBtn disabled={!valid} onClick={onNext} />
      </div>
    </div>
  );
}

/* ─── Buyer Step 2: Business Info ────────────────────────── */
const BUSINESS_TYPES = ['Retailer', 'Trader', 'Service Provider', 'Others'];

function BuyerBusinessScreen({
  animClass,
  values,
  onChange,
  onBack,
  onNext,
}: {
  animClass: string;
  values: { businessName: string; businessType: string };
  onChange: (v: { businessName: string; businessType: string }) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const valid = values.businessName.trim().length > 0 && values.businessType !== '';

  return (
    <div className={`flex-1 flex flex-col px-6 pt-12 pb-8 ${animClass}`}>
      <BackBtn onBack={onBack} />
      <h1 className="text-2xl font-black text-black mb-2">Your business info</h1>
      <p className="text-sm text-gray-500 mb-8">Help us personalise your experience.</p>

      <div className="flex flex-col gap-6 mb-auto">
        {/* Business Name */}
        <div
          className="float-field"
          style={{ border: '1.5px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}
        >
          <input
            type="text"
            placeholder=" "
            value={values.businessName}
            onChange={(e) => onChange({ ...values, businessName: e.target.value })}
            className="w-full px-4 text-sm text-black bg-white"
            style={{ height: 56, paddingTop: 20, paddingBottom: 8, fontSize: 15 }}
          />
          <label>Business Name</label>
        </div>

        {/* Business Type chips */}
        <div>
          <p className="text-xs font-bold text-black uppercase tracking-widest mb-3">Business Type</p>
          <div className="flex flex-wrap gap-2">
            {BUSINESS_TYPES.map((type) => {
              const active = values.businessType === type;
              return (
                <button
                  key={type}
                  onClick={() => onChange({ ...values, businessType: type })}
                  className="px-4 py-2 text-sm font-semibold"
                  style={{
                    borderRadius: '999px',
                    border: active ? 'none' : '1.5px solid #e5e7eb',
                    background: active ? '#000' : '#fff',
                    color: active ? '#fff' : '#374151',
                    transition: 'all 150ms ease-out',
                    transform: active ? 'scale(1.04)' : 'scale(1)',
                  }}
                >
                  {active && <span className="mr-1.5" style={{ fontSize: 11 }}>✓</span>}
                  {type}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <ContinueBtn disabled={!valid} onClick={onNext} />
      </div>
    </div>
  );
}
