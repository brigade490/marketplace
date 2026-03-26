'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Step = 'splash' | 'welcome' | 'account-type' | 'b-basic' | 'b-business' | 'b-categories' | 'b-location' | 'b-prefs' | 'b-payment' | 'b-notifs' | 'b-logo' | 'b-done' | 's-basic' | 's-business' | 's-categories' | 's-location' | 's-gst' | 's-verify' | 's-selling' | 's-bank' | 's-notifs' | 's-logo' | 's-done';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('splash');
  const [dir, setDir] = useState<'fwd' | 'bck'>('fwd');

  // Seller form state
  const [sellerBasic, setSellerBasic] = useState({ name: '', email: '' });
  const [sellerBusiness, setSellerBusiness] = useState({ businessName: '', businessType: '' });
  const [sellerCategories, setSellerCategories] = useState<string[]>([]);
  const [sellerLocation, setSellerLocation] = useState({ city: '', state: '', pincode: '' });
  const [sellerGst, setSellerGst] = useState('');
  const [sellerSelling, setSellerSelling] = useState({ orderType: '', delivery: '', upi: true, bankTransfer: true, emi: false });
  const [sellerBank, setSellerBank] = useState({ upiId: '', accountNumber: '', ifsc: '', holderName: '' });
  const [sellerNotifs, setSellerNotifs] = useState({ buyerRequests: true, orderAlerts: true, paymentAlerts: true });

  // Buyer form state
  const [buyerBasic, setBuyerBasic] = useState({ name: '', email: '' });
  const [buyerBusiness, setBuyerBusiness] = useState({ businessName: '', businessType: '' });
  const [buyerCategories, setBuyerCategories] = useState<string[]>([]);
  const [buyerLocation, setBuyerLocation] = useState({ city: '', state: '', pincode: '' });
  const [buyerPrefs, setBuyerPrefs] = useState({ orderType: '', frequency: '', urgency: '' });
  const [buyerPayment, setBuyerPayment] = useState({ upi: true, bankTransfer: true, emi: false, cod: false });
  const [buyerNotifs, setBuyerNotifs] = useState({ orderUpdates: true, sellerResponses: true, priceAlerts: false, promotions: false });

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

  const sellerProgressMap: Partial<Record<Step, number>> = {
    's-basic': 1,
    's-business': 2,
    's-categories': 3,
    's-location': 4,
    's-gst': 5,
    's-verify': 6,
    's-selling': 7,
    's-bank': 8,
    's-notifs': 9,
    's-logo': 10,
  };
  const totalSellerSteps = 10; // full seller flow length

  const progressMap: Partial<Record<Step, number>> = {
    'b-basic': 1,
    'b-business': 2,
    'b-categories': 3,
    'b-location': 4,
    'b-prefs': 5,
    'b-payment': 6,
    'b-notifs': 7,
    'b-logo': 8,
  };
  const totalBuyerSteps = 8;
  const currentBuyerProgress = progressMap[step];
  const currentSellerProgress = sellerProgressMap[step];

  return (
    <div
      className="fixed inset-0 flex flex-col"
      style={{ background: 'var(--bg)', fontFamily: "-apple-system, 'SF Pro Display', BlinkMacSystemFont, 'Helvetica Neue', sans-serif" }}
    >
      {/* Progress bar */}
      {currentBuyerProgress !== undefined && (
        <div className="w-full h-1.5 shrink-0" style={{ background: 'var(--input-bg)' }}>
          <div className="h-full progress-bar" style={{ width: `${(currentBuyerProgress / totalBuyerSteps) * 100}%`, background: 'var(--active-bg)' }} />
        </div>
      )}
      {currentSellerProgress !== undefined && (
        <div className="w-full h-1.5 shrink-0" style={{ background: 'var(--input-bg)' }}>
          <div className="h-full progress-bar" style={{ width: `${(currentSellerProgress / totalSellerSteps) * 100}%`, background: 'var(--active-bg)' }} />
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
            else goTo('s-basic');
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
          onNext={() => goTo('b-categories')}
        />
      )}

      {step === 'b-categories' && (
        <BuyerCategoriesScreen
          key="b-categories"
          animClass={animClass}
          selected={buyerCategories}
          onChange={setBuyerCategories}
          onBack={() => goBack('b-business')}
          onNext={() => goTo('b-location')}
        />
      )}

      {step === 'b-location' && (
        <BuyerLocationScreen
          key="b-location"
          animClass={animClass}
          values={buyerLocation}
          onChange={setBuyerLocation}
          onBack={() => goBack('b-categories')}
          onNext={() => goTo('b-prefs')}
        />
      )}

      {step === 'b-prefs' && (
        <BuyerPrefsScreen
          key="b-prefs"
          animClass={animClass}
          values={buyerPrefs}
          onChange={setBuyerPrefs}
          onBack={() => goBack('b-location')}
          onNext={() => goTo('b-payment')}
        />
      )}

      {step === 'b-payment' && (
        <BuyerPaymentScreen
          key="b-payment"
          animClass={animClass}
          values={buyerPayment}
          onChange={setBuyerPayment}
          onBack={() => goBack('b-prefs')}
          onNext={() => goTo('b-notifs')}
        />
      )}

      {step === 'b-notifs' && (
        <BuyerNotifsScreen
          key="b-notifs"
          animClass={animClass}
          values={buyerNotifs}
          onChange={setBuyerNotifs}
          onBack={() => goBack('b-payment')}
          onNext={() => goTo('b-logo')}
        />
      )}

      {step === 'b-logo' && (
        <BuyerLogoScreen
          key="b-logo"
          animClass={animClass}
          onBack={() => goBack('b-notifs')}
          onNext={() => goTo('b-done')}
        />
      )}

      {step === 'b-done' && (
        <BuyerDoneScreen key="b-done" onFinish={() => router.push('/')} />
      )}

      {step === 's-basic' && (
        <SellerBasicScreen
          key="s-basic"
          animClass={animClass}
          values={sellerBasic}
          onChange={setSellerBasic}
          onBack={() => goBack('account-type')}
          onNext={() => goTo('s-business')}
        />
      )}

      {step === 's-business' && (
        <SellerBusinessScreen
          key="s-business"
          animClass={animClass}
          values={sellerBusiness}
          onChange={setSellerBusiness}
          onBack={() => goBack('s-basic')}
          onNext={() => goTo('s-categories')}
        />
      )}

      {step === 's-categories' && (
        <SellerCategoriesScreen
          key="s-categories"
          animClass={animClass}
          selected={sellerCategories}
          onChange={setSellerCategories}
          onBack={() => goBack('s-business')}
          onNext={() => goTo('s-location')}
        />
      )}

      {step === 's-location' && (
        <SellerLocationScreen
          key="s-location"
          animClass={animClass}
          values={sellerLocation}
          onChange={setSellerLocation}
          onBack={() => goBack('s-categories')}
          onNext={() => goTo('s-gst')}
        />
      )}

      {step === 's-gst' && (
        <SellerGstScreen
          key="s-gst"
          animClass={animClass}
          value={sellerGst}
          onChange={setSellerGst}
          onBack={() => goBack('s-location')}
          onNext={() => goTo('s-verify')}
          onSkip={() => goTo('s-verify')}
        />
      )}

      {step === 's-verify' && (
        <SellerVerifyScreen
          key="s-verify"
          animClass={animClass}
          onBack={() => goBack('s-gst')}
          onNext={() => goTo('s-selling')}
        />
      )}

      {step === 's-selling' && (
        <SellerSellingScreen
          key="s-selling"
          animClass={animClass}
          values={sellerSelling}
          onChange={setSellerSelling}
          onBack={() => goBack('s-verify')}
          onNext={() => goTo('s-bank')}
        />
      )}

      {step === 's-bank' && (
        <SellerBankScreen
          key="s-bank"
          animClass={animClass}
          values={sellerBank}
          onChange={setSellerBank}
          onBack={() => goBack('s-selling')}
          onNext={() => goTo('s-notifs')}
          onSkip={() => goTo('s-notifs')}
        />
      )}

      {step === 's-notifs' && (
        <SellerNotifsScreen
          key="s-notifs"
          animClass={animClass}
          values={sellerNotifs}
          onChange={setSellerNotifs}
          onBack={() => goBack('s-bank')}
          onNext={() => goTo('s-logo')}
        />
      )}

      {step === 's-logo' && (
        <SellerLogoScreen
          key="s-logo"
          animClass={animClass}
          onBack={() => goBack('s-notifs')}
          onNext={() => goTo('s-done')}
        />
      )}

      {step === 's-done' && (
        <SellerDoneScreen key="s-done" onFinish={() => router.push('/seller/dashboard')} />
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
      style={{ background: 'transparent', color: 'var(--text-primary)', padding: '4px 0', borderRadius: 0, boxShadow: 'none' }}
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
        background: disabled ? 'var(--input-bg)' : 'var(--active-bg)',
        color: disabled ? 'var(--text-muted)' : '#fff',
        borderRadius: 'var(--radius-pill)',
        boxShadow: disabled ? 'var(--shadow-soft)' : 'var(--shadow-active)',
        transition: 'background 200ms ease-out, color 200ms ease-out, box-shadow 200ms ease-out',
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
        className="text-4xl font-black tracking-tight mb-3"
        style={{ color: 'var(--text-primary)', animation: 'fadeSlideUp 500ms 200ms ease-out both' }}
      >
        Karobarrr
      </div>
      <p
        className="text-sm font-medium"
        style={{ color: 'var(--text-muted)', animation: 'fadeSlideUp 500ms 400ms ease-out both' }}
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
        className="mb-8 flex items-center justify-center"
        style={{ width: 160, height: 160, borderRadius: '50%', background: 'var(--surface)', boxShadow: 'var(--shadow-raised)' }}
      >
        <span style={{ fontSize: 64 }}>🤝</span>
      </div>
      <h1 className="text-3xl font-black mb-3 leading-tight" style={{ color: 'var(--text-primary)' }}>
        Welcome to<br />Karobarrr
      </h1>
      <p className="text-base mb-12 leading-relaxed max-w-xs" style={{ color: 'var(--text-body)' }}>
        India's largest B2B marketplace. Buy and sell in bulk — directly with verified businesses.
      </p>
      <div className="w-full max-w-sm flex flex-col gap-3">
        <button
          onClick={onGetStarted}
          className="w-full py-4 text-base font-bold"
          style={{ background: 'var(--active-bg)', color: '#fff', borderRadius: 'var(--radius-pill)' }}
        >
          Get Started
        </button>
        <button
          onClick={onLogin}
          className="w-full py-4 text-base font-semibold"
          style={{ background: 'var(--input-bg)', color: 'var(--text-inactive)', borderRadius: 'var(--radius-pill)', boxShadow: 'var(--shadow-inset)' }}
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
      <h1 className="text-2xl font-black  mb-2">How will you use<br />Karobarrr?</h1>
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
              borderRadius: 'var(--radius-md)',
              boxShadow: selected === key ? 'var(--shadow-active)' : 'var(--shadow-raised)',
              transition: 'border 150ms ease-out, box-shadow 150ms ease-out',
            }}
          >
            <div
              className="flex items-center justify-center shrink-0"
              style={{ width: 56, height: 56, borderRadius: 'var(--radius-sm)', background: 'var(--bg)', fontSize: 28 }}
            >
              {emoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-base font-black  mb-0.5">{title}</div>
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
      <h1 className="text-2xl font-black  mb-2">Your basic details</h1>
      <p className="text-sm text-gray-500 mb-8">Tell us a bit about yourself.</p>

      <div className="flex flex-col gap-4 mb-auto">
        {/* Full Name */}
        <div
          className="float-field"
          style={{ boxShadow: 'var(--shadow-inset)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}
        >
          <input
            type="text"
            placeholder=" "
            value={values.name}
            onChange={(e) => onChange({ ...values, name: e.target.value })}
            className="w-full px-4 text-sm  bg-white"
            style={{ height: 56, paddingTop: 20, paddingBottom: 8, fontSize: 15 }}
          />
          <label>Full Name</label>
        </div>

        {/* Email */}
        <div
          className="float-field"
          style={{ boxShadow: 'var(--shadow-inset)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}
        >
          <input
            type="email"
            placeholder=" "
            value={values.email}
            onChange={(e) => onChange({ ...values, email: e.target.value })}
            className="w-full px-4 text-sm  bg-white"
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
      <h1 className="text-2xl font-black  mb-2">Your business info</h1>
      <p className="text-sm text-gray-500 mb-8">Help us personalise your experience.</p>

      <div className="flex flex-col gap-6 mb-auto">
        {/* Business Name */}
        <div
          className="float-field"
          style={{ boxShadow: 'var(--shadow-inset)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}
        >
          <input
            type="text"
            placeholder=" "
            value={values.businessName}
            onChange={(e) => onChange({ ...values, businessName: e.target.value })}
            className="w-full px-4 text-sm  bg-white"
            style={{ height: 56, paddingTop: 20, paddingBottom: 8, fontSize: 15 }}
          />
          <label>Business Name</label>
        </div>

        {/* Business Type chips */}
        <div>
          <p className="text-xs font-bold  uppercase tracking-widest mb-3">Business Type</p>
          <div className="flex flex-wrap gap-2">
            {BUSINESS_TYPES.map((type) => {
              const active = values.businessType === type;
              return (
                <button
                  key={type}
                  onClick={() => onChange({ ...values, businessType: type })}
                  className="px-4 py-2 text-sm font-semibold"
                  style={{
                    borderRadius: 'var(--radius-pill)',
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

/* ─── Buyer Step 3: Categories ───────────────────────────── */
const CATEGORIES = ['Packaging', 'Electronics', 'Industrial', 'Office Supplies', 'Raw Materials', 'Construction', 'Others'];

function BuyerCategoriesScreen({
  animClass,
  selected,
  onChange,
  onBack,
  onNext,
}: {
  animClass: string;
  selected: string[];
  onChange: (v: string[]) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  function toggle(cat: string) {
    onChange(selected.includes(cat) ? selected.filter((c) => c !== cat) : [...selected, cat]);
  }

  return (
    <div className={`flex-1 flex flex-col px-6 pt-12 pb-8 ${animClass}`}>
      <BackBtn onBack={onBack} />
      <h1 className="text-2xl font-black  mb-2">What do you buy?</h1>
      <p className="text-sm text-gray-500 mb-8">Select all categories that apply.</p>

      <div className="flex flex-wrap gap-2 mb-auto">
        {CATEGORIES.map((cat) => {
          const active = selected.includes(cat);
          return (
            <button
              key={cat}
              onClick={() => toggle(cat)}
              className="px-4 py-2.5 text-sm font-semibold"
              style={{
                borderRadius: 'var(--radius-pill)',
                border: active ? 'none' : '1.5px solid #e5e7eb',
                background: active ? '#000' : '#fff',
                color: active ? '#fff' : '#374151',
                transition: 'all 150ms ease-out',
                transform: active ? 'scale(1.04)' : 'scale(1)',
              }}
            >
              {active && <span className="mr-1.5" style={{ fontSize: 11 }}>✓</span>}
              {cat}
            </button>
          );
        })}
      </div>

      <div className="mt-8">
        <ContinueBtn disabled={selected.length === 0} onClick={onNext} />
      </div>
    </div>
  );
}

/* ─── Buyer Step 4: Location ─────────────────────────────── */
type LocationState = { city: string; state: string; pincode: string };
type DetectStatus = 'idle' | 'detecting' | 'done' | 'error';

function BuyerLocationScreen({
  animClass,
  values,
  onChange,
  onBack,
  onNext,
}: {
  animClass: string;
  values: LocationState;
  onChange: (v: LocationState) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const [detectStatus, setDetectStatus] = useState<DetectStatus>('idle');
  const valid = values.city.trim().length > 0 && values.state.trim().length > 0 && values.pincode.trim().length === 6;

  function handleDetect() {
    setDetectStatus('detecting');
    setTimeout(() => {
      setDetectStatus('done');
      onChange({ city: 'Mumbai', state: 'Maharashtra', pincode: '400001' });
    }, 1800);
  }

  return (
    <div className={`flex-1 flex flex-col px-6 pt-12 pb-8 ${animClass}`}>
      <BackBtn onBack={onBack} />
      <h1 className="text-2xl font-black  mb-2">Your location</h1>
      <p className="text-sm text-gray-500 mb-8">We'll show you nearby suppliers and deals.</p>

      <div className="flex flex-col gap-4 mb-auto">
        {/* Auto-detect button */}
        <button
          onClick={handleDetect}
          disabled={detectStatus === 'detecting'}
          className="flex items-center justify-center gap-2 w-full py-3.5 text-sm font-bold"
          style={{
            borderRadius: 'var(--radius-sm)',
            boxShadow: 'var(--shadow-inset)',
            background: detectStatus === 'done' ? '#f0fdf4' : '#fff',
            color: detectStatus === 'done' ? '#16a34a' : '#111827',
            transition: 'all 200ms ease-out',
          }}
        >
          {detectStatus === 'detecting' && <span className="spinner" style={{ width: 16, height: 16 }} />}
          {detectStatus === 'done' && <span className="check-in" style={{ fontSize: 16 }}>✓</span>}
          {detectStatus === 'idle' && <span style={{ fontSize: 16 }}>📍</span>}
          {detectStatus === 'detecting' ? 'Detecting location…' : detectStatus === 'done' ? 'Location detected' : 'Detect My Location'}
        </button>

        <div
          className="float-field"
          style={{ boxShadow: 'var(--shadow-inset)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}
        >
          <input
            type="text"
            placeholder=" "
            value={values.city}
            onChange={(e) => onChange({ ...values, city: e.target.value })}
            className="w-full px-4  bg-white"
            style={{ height: 56, paddingTop: 20, paddingBottom: 8, fontSize: 15 }}
          />
          <label>City</label>
        </div>

        <div
          className="float-field"
          style={{ boxShadow: 'var(--shadow-inset)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}
        >
          <input
            type="text"
            placeholder=" "
            value={values.state}
            onChange={(e) => onChange({ ...values, state: e.target.value })}
            className="w-full px-4  bg-white"
            style={{ height: 56, paddingTop: 20, paddingBottom: 8, fontSize: 15 }}
          />
          <label>State</label>
        </div>

        <div
          className="float-field"
          style={{ boxShadow: 'var(--shadow-inset)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}
        >
          <input
            type="text"
            placeholder=" "
            inputMode="numeric"
            maxLength={6}
            value={values.pincode}
            onChange={(e) => onChange({ ...values, pincode: e.target.value.replace(/\D/g, '') })}
            className="w-full px-4  bg-white"
            style={{ height: 56, paddingTop: 20, paddingBottom: 8, fontSize: 15 }}
          />
          <label>Pincode</label>
        </div>
      </div>

      <div className="mt-8">
        <ContinueBtn disabled={!valid} onClick={onNext} />
      </div>
    </div>
  );
}

/* ─── Shared: Toggle ─────────────────────────────────────── */
function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <div
      role="switch"
      aria-checked={on}
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={(e) => e.key === 'Enter' && onToggle()}
      style={{
        width: 46,
        height: 26,
        borderRadius: 999,
        background: on ? 'var(--active-bg)' : 'var(--bg)',
        position: 'relative',
        cursor: 'pointer',
        transition: 'background 200ms ease-out',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 3,
          left: on ? 23 : 3,
          width: 20,
          height: 20,
          borderRadius: '50%',
          background: 'var(--surface)',
          transition: 'left 200ms ease-out',
          boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
        }}
      />
    </div>
  );
}

/* ─── Shared: ChipGroup ──────────────────────────────────── */
function ChipGroup({ label, options, value, onChange }: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <p className="text-xs font-bold  uppercase tracking-widest mb-3">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = value === opt;
          return (
            <button
              key={opt}
              onClick={() => onChange(opt)}
              className="px-4 py-2 text-sm font-semibold"
              style={{
                borderRadius: 'var(--radius-pill)',
                border: active ? 'none' : '1.5px solid #e5e7eb',
                background: active ? '#000' : '#fff',
                color: active ? '#fff' : '#374151',
                transition: 'all 150ms ease-out',
                transform: active ? 'scale(1.04)' : 'scale(1)',
              }}
            >
              {active && <span className="mr-1.5" style={{ fontSize: 11 }}>✓</span>}
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Buyer Step 5: Buying Preferences ──────────────────── */
function BuyerPrefsScreen({ animClass, values, onChange, onBack, onNext }: {
  animClass: string;
  values: { orderType: string; frequency: string; urgency: string };
  onChange: (v: { orderType: string; frequency: string; urgency: string }) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const valid = values.orderType !== '' && values.frequency !== '' && values.urgency !== '';
  return (
    <div className={`flex-1 flex flex-col px-6 pt-12 pb-8 overflow-y-auto ${animClass}`}>
      <BackBtn onBack={onBack} />
      <h1 className="text-2xl font-black  mb-2">Buying preferences</h1>
      <p className="text-sm text-gray-500 mb-8">Help us match you with the right sellers.</p>

      <div className="flex flex-col gap-7 mb-auto">
        <ChipGroup
          label="Order Type"
          options={['Bulk', 'Small', 'Both']}
          value={values.orderType}
          onChange={(v) => onChange({ ...values, orderType: v })}
        />
        <ChipGroup
          label="Purchase Frequency"
          options={['One-time', 'Occasional', 'Regular']}
          value={values.frequency}
          onChange={(v) => onChange({ ...values, frequency: v })}
        />
        <ChipGroup
          label="Urgency"
          options={['Standard', 'Fast', 'Flexible']}
          value={values.urgency}
          onChange={(v) => onChange({ ...values, urgency: v })}
        />
      </div>

      <div className="mt-8">
        <ContinueBtn disabled={!valid} onClick={onNext} />
      </div>
    </div>
  );
}

/* ─── Buyer Step 6: Payment Preferences ─────────────────── */
type PaymentState = { upi: boolean; bankTransfer: boolean; emi: boolean; cod: boolean };

function BuyerPaymentScreen({ animClass, values, onChange, onBack, onNext }: {
  animClass: string;
  values: PaymentState;
  onChange: (v: PaymentState) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const rows: { key: keyof PaymentState; label: string; desc: string }[] = [
    { key: 'upi',          label: 'UPI',           desc: 'Pay instantly via UPI apps' },
    { key: 'bankTransfer', label: 'Bank Transfer',  desc: 'NEFT / RTGS / IMPS transfers' },
    { key: 'emi',          label: 'EMI',            desc: 'Pay in monthly instalments' },
    { key: 'cod',          label: 'COD',            desc: 'Cash on delivery' },
  ];
  const anySelected = Object.values(values).some(Boolean);

  return (
    <div className={`flex-1 flex flex-col px-6 pt-12 pb-8 ${animClass}`}>
      <BackBtn onBack={onBack} />
      <h1 className="text-2xl font-black  mb-2">Payment preferences</h1>
      <p className="text-sm text-gray-500 mb-8">Choose your preferred payment methods.</p>

      <div className="flex flex-col gap-3 mb-auto">
        {rows.map(({ key, label, desc }) => (
          <div
            key={key}
            className="flex items-center justify-between p-4 bg-white"
            style={{ borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow-inset)' }}
          >
            <div>
              <p className="text-sm font-bold">{label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
            </div>
            <Toggle on={values[key]} onToggle={() => onChange({ ...values, [key]: !values[key] })} />
          </div>
        ))}
      </div>

      <div className="mt-8">
        <ContinueBtn disabled={!anySelected} onClick={onNext} />
      </div>
    </div>
  );
}

/* ─── Buyer Step 7: Notification Settings ───────────────── */
type NotifsState = { orderUpdates: boolean; sellerResponses: boolean; priceAlerts: boolean; promotions: boolean };

function BuyerNotifsScreen({ animClass, values, onChange, onBack, onNext }: {
  animClass: string;
  values: NotifsState;
  onChange: (v: NotifsState) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const rows: { key: keyof NotifsState; label: string; desc: string }[] = [
    { key: 'orderUpdates',    label: 'Order Updates',     desc: 'Status changes on your orders' },
    { key: 'sellerResponses', label: 'Seller Responses',  desc: 'Replies to your enquiries' },
    { key: 'priceAlerts',     label: 'Price Alerts',      desc: 'Price drops on saved items' },
    { key: 'promotions',      label: 'Promotions',        desc: 'Deals and platform offers' },
  ];

  return (
    <div className={`flex-1 flex flex-col px-6 pt-12 pb-8 ${animClass}`}>
      <BackBtn onBack={onBack} />
      <h1 className="text-2xl font-black  mb-2">Notifications</h1>
      <p className="text-sm text-gray-500 mb-8">Choose what you want to hear about.</p>

      <div className="flex flex-col gap-3 mb-auto">
        {rows.map(({ key, label, desc }) => (
          <div
            key={key}
            className="flex items-center justify-between p-4 bg-white"
            style={{ borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow-inset)' }}
          >
            <div>
              <p className="text-sm font-bold">{label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
            </div>
            <Toggle on={values[key]} onToggle={() => onChange({ ...values, [key]: !values[key] })} />
          </div>
        ))}
      </div>

      <div className="mt-8">
        <ContinueBtn disabled={false} onClick={onNext} />
      </div>
    </div>
  );
}

/* ─── Buyer Step 8: Logo Upload (optional) ───────────────── */
function BuyerLogoScreen({ animClass, onBack, onNext }: {
  animClass: string;
  onBack: () => void;
  onNext: () => void;
}) {
  const [preview, setPreview] = useState<string | null>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
  }

  return (
    <div className={`flex-1 flex flex-col px-6 pt-12 pb-8 ${animClass}`}>
      <BackBtn onBack={onBack} />
      <h1 className="text-2xl font-black  mb-2">Add your logo</h1>
      <p className="text-sm text-gray-500 mb-8">Optional — you can always add it later.</p>

      <div className="flex flex-col items-center gap-5 mb-auto">
        {/* Upload area */}
        <label
          htmlFor="logo-upload"
          className="flex flex-col items-center justify-center cursor-pointer"
          style={{
            width: 140,
            height: 140,
            borderRadius: '50%',
            border: preview ? 'none' : '2px dashed #d1d5db',
            background: preview ? 'transparent' : '#f9fafb',
            overflow: 'hidden',
            transition: 'border 150ms ease-out',
          }}
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Logo preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div className="flex flex-col items-center gap-2">
              <span style={{ fontSize: 32 }}>📷</span>
              <span className="text-xs text-gray-400 font-medium">Tap to upload</span>
            </div>
          )}
        </label>
        <input id="logo-upload" type="file" accept="image/*" className="hidden" onChange={handleFile} />

        {preview && (
          <button
            onClick={() => setPreview(null)}
            className="text-xs font-semibold"
            style={{ background: 'transparent', color: 'var(--text-inactive)', padding: '4px 12px', boxShadow: 'var(--shadow-raised)', borderRadius: 'var(--radius-pill)' }}
          >
            Remove
          </button>
        )}
      </div>

      <div className="mt-8 flex flex-col gap-3">
        <ContinueBtn disabled={false} onClick={onNext} />
        <button
          onClick={onNext}
          className="w-full py-3 text-sm font-semibold"
          style={{ background: 'transparent', color: 'var(--text-inactive)', borderRadius: 'var(--radius-pill)', boxShadow: 'none' }}
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}

/* ─── Buyer Done ─────────────────────────────────────────── */
const CONFETTI_COLORS = ['#f5a623', '#000000', '#22c55e', '#3b82f6', '#ec4899', '#a855f7'];

function BuyerDoneScreen({ onFinish }: { onFinish: () => void }) {
  const pieces = Array.from({ length: 28 });

  useEffect(() => {
    const t = setTimeout(onFinish, 2800);
    return () => clearTimeout(t);
  }, [onFinish]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8 text-center relative overflow-hidden">
      {/* Confetti */}
      {pieces.map((_, i) => (
        <div
          key={i}
          className="confetti-piece"
          style={{
            left: `${10 + Math.random() * 80}%`,
            top: '60%',
            background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
            animationDelay: `${Math.random() * 400}ms`,
            animationDuration: `${700 + Math.random() * 500}ms`,
            transform: `rotate(${Math.random() * 360}deg)`,
          }}
        />
      ))}

      <div className="ready-in flex flex-col items-center gap-4">
        <div style={{ fontSize: 72 }}>🎉</div>
        <h1 className="text-3xl font-black  leading-tight">You're ready!</h1>
        <p className="text-base text-gray-500 max-w-xs leading-relaxed">
          Your buyer account is set up. Start sourcing from verified Indian suppliers.
        </p>
        <div className="mt-4 w-6 h-6 spinner" />
      </div>
    </div>
  );
}

/* ─── Seller Step 1: Basic Details ──────────────────────── */
function SellerBasicScreen({ animClass, values, onChange, onBack, onNext }: {
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
      <h1 className="text-2xl font-black  mb-2">Your basic details</h1>
      <p className="text-sm text-gray-500 mb-8">Tell us a bit about yourself.</p>

      <div className="flex flex-col gap-4 mb-auto">
        <div className="float-field" style={{ boxShadow: 'var(--shadow-inset)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
          <input
            type="text"
            placeholder=" "
            value={values.name}
            onChange={(e) => onChange({ ...values, name: e.target.value })}
            className="w-full px-4  bg-white"
            style={{ height: 56, paddingTop: 20, paddingBottom: 8, fontSize: 15 }}
          />
          <label>Full Name</label>
        </div>

        <div className="float-field" style={{ boxShadow: 'var(--shadow-inset)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
          <input
            type="email"
            placeholder=" "
            value={values.email}
            onChange={(e) => onChange({ ...values, email: e.target.value })}
            className="w-full px-4  bg-white"
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

/* ─── Seller Step 2: Business Info ───────────────────────── */
const SELLER_BUSINESS_TYPES = ['Manufacturer', 'Wholesaler', 'Trader', 'Distributor'];

function SellerBusinessScreen({ animClass, values, onChange, onBack, onNext }: {
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
      <h1 className="text-2xl font-black  mb-2">Your business info</h1>
      <p className="text-sm text-gray-500 mb-8">Help buyers find and trust your business.</p>

      <div className="flex flex-col gap-6 mb-auto">
        <div className="float-field" style={{ boxShadow: 'var(--shadow-inset)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
          <input
            type="text"
            placeholder=" "
            value={values.businessName}
            onChange={(e) => onChange({ ...values, businessName: e.target.value })}
            className="w-full px-4  bg-white"
            style={{ height: 56, paddingTop: 20, paddingBottom: 8, fontSize: 15 }}
          />
          <label>Business Name</label>
        </div>

        <div>
          <p className="text-xs font-bold  uppercase tracking-widest mb-3">Business Type</p>
          <div className="flex flex-wrap gap-2">
            {SELLER_BUSINESS_TYPES.map((type) => {
              const active = values.businessType === type;
              return (
                <button
                  key={type}
                  onClick={() => onChange({ ...values, businessType: type })}
                  className="px-4 py-2 text-sm font-semibold"
                  style={{
                    borderRadius: 'var(--radius-pill)',
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

/* ─── Seller Step 3: Selling Categories ─────────────────── */
function SellerCategoriesScreen({ animClass, selected, onChange, onBack, onNext }: {
  animClass: string;
  selected: string[];
  onChange: (v: string[]) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  function toggle(cat: string) {
    onChange(selected.includes(cat) ? selected.filter((c) => c !== cat) : [...selected, cat]);
  }

  return (
    <div className={`flex-1 flex flex-col px-6 pt-12 pb-8 ${animClass}`}>
      <BackBtn onBack={onBack} />
      <h1 className="text-2xl font-black  mb-2">What do you sell?</h1>
      <p className="text-sm text-gray-500 mb-8">Select all categories that apply.</p>

      <div className="flex flex-wrap gap-2 mb-auto">
        {CATEGORIES.map((cat) => {
          const active = selected.includes(cat);
          return (
            <button
              key={cat}
              onClick={() => toggle(cat)}
              className="px-4 py-2.5 text-sm font-semibold"
              style={{
                borderRadius: 'var(--radius-pill)',
                border: active ? 'none' : '1.5px solid #e5e7eb',
                background: active ? '#000' : '#fff',
                color: active ? '#fff' : '#374151',
                transition: 'all 150ms ease-out',
                transform: active ? 'scale(1.04)' : 'scale(1)',
              }}
            >
              {active && <span className="mr-1.5" style={{ fontSize: 11 }}>✓</span>}
              {cat}
            </button>
          );
        })}
      </div>

      <div className="mt-8">
        <ContinueBtn disabled={selected.length === 0} onClick={onNext} />
      </div>
    </div>
  );
}

/* ─── Seller Step 4: Location ────────────────────────────── */
function SellerLocationScreen({ animClass, values, onChange, onBack, onNext }: {
  animClass: string;
  values: LocationState;
  onChange: (v: LocationState) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const [detectStatus, setDetectStatus] = useState<DetectStatus>('idle');
  const valid = values.city.trim().length > 0 && values.state.trim().length > 0 && values.pincode.trim().length === 6;

  function handleDetect() {
    setDetectStatus('detecting');
    setTimeout(() => {
      setDetectStatus('done');
      onChange({ city: 'Mumbai', state: 'Maharashtra', pincode: '400001' });
    }, 1800);
  }

  return (
    <div className={`flex-1 flex flex-col px-6 pt-12 pb-8 ${animClass}`}>
      <BackBtn onBack={onBack} />
      <h1 className="text-2xl font-black  mb-2">Business location</h1>
      <p className="text-sm text-gray-500 mb-8">Buyers will use this to find local suppliers.</p>

      <div className="flex flex-col gap-4 mb-auto">
        <button
          onClick={handleDetect}
          disabled={detectStatus === 'detecting'}
          className="flex items-center justify-center gap-2 w-full py-3.5 text-sm font-bold"
          style={{
            borderRadius: 'var(--radius-sm)',
            boxShadow: 'var(--shadow-inset)',
            background: detectStatus === 'done' ? '#f0fdf4' : '#fff',
            color: detectStatus === 'done' ? '#16a34a' : '#111827',
            transition: 'all 200ms ease-out',
          }}
        >
          {detectStatus === 'detecting' && <span className="spinner" style={{ width: 16, height: 16 }} />}
          {detectStatus === 'done' && <span className="check-in" style={{ fontSize: 16 }}>✓</span>}
          {detectStatus === 'idle' && <span style={{ fontSize: 16 }}>📍</span>}
          {detectStatus === 'detecting' ? 'Detecting location…' : detectStatus === 'done' ? 'Location detected' : 'Detect My Location'}
        </button>

        <div className="float-field" style={{ boxShadow: 'var(--shadow-inset)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
          <input
            type="text"
            placeholder=" "
            value={values.city}
            onChange={(e) => onChange({ ...values, city: e.target.value })}
            className="w-full px-4  bg-white"
            style={{ height: 56, paddingTop: 20, paddingBottom: 8, fontSize: 15 }}
          />
          <label>City</label>
        </div>

        <div className="float-field" style={{ boxShadow: 'var(--shadow-inset)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
          <input
            type="text"
            placeholder=" "
            value={values.state}
            onChange={(e) => onChange({ ...values, state: e.target.value })}
            className="w-full px-4  bg-white"
            style={{ height: 56, paddingTop: 20, paddingBottom: 8, fontSize: 15 }}
          />
          <label>State</label>
        </div>

        <div className="float-field" style={{ boxShadow: 'var(--shadow-inset)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
          <input
            type="text"
            placeholder=" "
            inputMode="numeric"
            maxLength={6}
            value={values.pincode}
            onChange={(e) => onChange({ ...values, pincode: e.target.value.replace(/\D/g, '') })}
            className="w-full px-4  bg-white"
            style={{ height: 56, paddingTop: 20, paddingBottom: 8, fontSize: 15 }}
          />
          <label>Pincode</label>
        </div>
      </div>

      <div className="mt-8">
        <ContinueBtn disabled={!valid} onClick={onNext} />
      </div>
    </div>
  );
}

/* ─── Seller Step 5: GST Details ─────────────────────────── */
function SellerGstScreen({ animClass, value, onChange, onBack, onNext, onSkip }: {
  animClass: string;
  value: string;
  onChange: (v: string) => void;
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
}) {
  // Basic GSTIN format: 15 alphanumeric chars
  const valid = value.trim().length === 15;

  return (
    <div className={`flex-1 flex flex-col px-6 pt-12 pb-8 ${animClass}`}>
      <BackBtn onBack={onBack} />
      <h1 className="text-2xl font-black  mb-2">GST details</h1>
      <p className="text-sm text-gray-500 mb-8">Add your GSTIN to unlock all seller features.</p>

      <div className="flex flex-col gap-4 mb-auto">
        <div className="float-field" style={{ boxShadow: 'var(--shadow-inset)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
          <input
            type="text"
            placeholder=" "
            maxLength={15}
            value={value}
            onChange={(e) => onChange(e.target.value.toUpperCase())}
            className="w-full px-4  bg-white"
            style={{ height: 56, paddingTop: 20, paddingBottom: 8, fontSize: 15, fontFamily: 'monospace' }}
          />
          <label>GSTIN</label>
        </div>

        {/* Note */}
        <div
          className="flex items-start gap-3 p-4"
          style={{ borderRadius: 'var(--radius-sm)', background: '#fefce8', border: '1.5px solid #fde68a' }}
        >
          <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>⚠️</span>
          <p className="text-xs text-yellow-800 leading-relaxed">
            Some features like bulk orders and verified badge are limited until your GSTIN is added.
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3">
        <ContinueBtn disabled={!valid} onClick={onNext} />
        <button
          onClick={onSkip}
          className="w-full py-3 text-sm font-semibold"
          style={{ background: 'transparent', color: 'var(--text-inactive)', borderRadius: 'var(--radius-pill)', boxShadow: 'none' }}
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}

/* ─── Seller Step 6: Business Verification ───────────────── */
function SellerVerifyScreen({ animClass, onBack, onNext }: {
  animClass: string;
  onBack: () => void;
  onNext: () => void;
}) {
  const [gstCert, setGstCert] = useState<string | null>(null);
  const [bizProof, setBizProof] = useState<string | null>(null);

  function handleFile(setter: (v: string) => void) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.[0]) setter(e.target.files[0].name);
    };
  }

  return (
    <div className={`flex-1 flex flex-col px-6 pt-12 pb-8 ${animClass}`}>
      <BackBtn onBack={onBack} />
      <h1 className="text-2xl font-black  mb-2">Business verification</h1>
      <p className="text-sm text-gray-500 mb-8">Both documents are optional — upload when ready.</p>

      <div className="flex flex-col gap-4 mb-auto">
        {/* Upload row */}
        {([
          { id: 'gst-cert', label: 'GST Certificate', state: gstCert, setter: setGstCert },
          { id: 'biz-proof', label: 'Business Proof', state: bizProof, setter: setBizProof },
        ] as const).map(({ id, label, state, setter }) => (
          <label
            key={id}
            htmlFor={id}
            className="flex items-center justify-between p-4 cursor-pointer"
            style={{ borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow-inset)', background: 'var(--surface)' }}
          >
            <div className="flex items-center gap-3">
              <span style={{ fontSize: 22 }}>{state ? '📄' : '📁'}</span>
              <div>
                <p className="text-sm font-bold">{label}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {state ? state : 'Tap to upload'}
                </p>
              </div>
            </div>
            <div
              className="shrink-0 px-3 py-1 text-xs font-bold"
              style={{
                borderRadius: 'var(--radius-pill)',
                background: state ? '#f0fdf4' : '#f3f4f6',
                color: state ? '#16a34a' : '#6b7280',
              }}
            >
              {state ? 'Uploaded' : 'Pending'}
            </div>
            <input id={id} type="file" accept=".pdf,image/*" className="hidden" onChange={handleFile(setter)} />
          </label>
        ))}

        {/* Review note */}
        <div
          className="flex items-start gap-3 p-4"
          style={{ borderRadius: 'var(--radius-sm)', background: '#f0f9ff', border: '1.5px solid #bae6fd' }}
        >
          <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>🔍</span>
          <p className="text-xs text-blue-800 leading-relaxed">
            A verified badge will be added to your profile after our team reviews your documents (usually within 24 hours).
          </p>
        </div>
      </div>

      <div className="mt-8">
        <ContinueBtn disabled={false} onClick={onNext} />
      </div>
    </div>
  );
}

/* ─── Seller Step 7: Selling Setup ──────────────────────── */
type SellerSellingState = { orderType: string; delivery: string; upi: boolean; bankTransfer: boolean; emi: boolean };

function SellerSellingScreen({ animClass, values, onChange, onBack, onNext }: {
  animClass: string;
  values: SellerSellingState;
  onChange: (v: SellerSellingState) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const valid = values.orderType !== '' && values.delivery !== '';
  const deliveryOptions = [
    { label: 'Self Delivery', disabled: false },
    { label: 'Courier', disabled: false },
    { label: 'Platform Logistics', disabled: true },
  ];
  const paymentRows: { key: keyof Pick<SellerSellingState, 'upi' | 'bankTransfer' | 'emi'>; label: string }[] = [
    { key: 'upi', label: 'UPI' },
    { key: 'bankTransfer', label: 'Bank Transfer' },
    { key: 'emi', label: 'EMI' },
  ];

  return (
    <div className={`flex-1 flex flex-col px-6 pt-12 pb-8 overflow-y-auto ${animClass}`}>
      <BackBtn onBack={onBack} />
      <h1 className="text-2xl font-black  mb-2">Selling setup</h1>
      <p className="text-sm text-gray-500 mb-8">Tell buyers how you operate.</p>

      <div className="flex flex-col gap-7 mb-auto">
        {/* Order type */}
        <ChipGroup
          label="Order Type"
          options={['Bulk', 'Small', 'Both']}
          value={values.orderType}
          onChange={(v) => onChange({ ...values, orderType: v })}
        />

        {/* Delivery */}
        <div>
          <p className="text-xs font-bold  uppercase tracking-widest mb-3">Delivery</p>
          <div className="flex flex-wrap gap-2">
            {deliveryOptions.map(({ label, disabled }) => {
              const active = values.delivery === label;
              return (
                <button
                  key={label}
                  onClick={() => !disabled && onChange({ ...values, delivery: label })}
                  className="px-4 py-2 text-sm font-semibold"
                  style={{
                    borderRadius: 'var(--radius-pill)',
                    border: active ? 'none' : '1.5px solid #e5e7eb',
                    background: disabled ? '#f3f4f6' : active ? '#000' : '#fff',
                    color: disabled ? '#9ca3af' : active ? '#fff' : '#374151',
                    cursor: disabled ? 'default' : 'pointer',
                    transition: 'all 150ms ease-out',
                    transform: active ? 'scale(1.04)' : 'scale(1)',
                  }}
                >
                  {active && !disabled && <span className="mr-1.5" style={{ fontSize: 11 }}>✓</span>}
                  {label}
                  {disabled && <span className="ml-1.5 text-xs" style={{ opacity: 0.6 }}>(soon)</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Payment methods */}
        <div>
          <p className="text-xs font-bold  uppercase tracking-widest mb-3">Payment Methods</p>
          <div className="flex flex-col gap-2">
            {paymentRows.map(({ key, label }) => (
              <div
                key={key}
                className="flex items-center justify-between px-4 py-3 bg-white"
                style={{ borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow-inset)' }}
              >
                <span className="text-sm font-semibold">{label}</span>
                <Toggle on={values[key]} onToggle={() => onChange({ ...values, [key]: !values[key] })} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <ContinueBtn disabled={!valid} onClick={onNext} />
      </div>
    </div>
  );
}

/* ─── Seller Step 8: Bank Details ────────────────────────── */
type SellerBankState = { upiId: string; accountNumber: string; ifsc: string; holderName: string };

function SellerBankScreen({ animClass, values, onChange, onBack, onNext, onSkip }: {
  animClass: string;
  values: SellerBankState;
  onChange: (v: SellerBankState) => void;
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
}) {
  const valid = values.accountNumber.trim().length > 0 && values.ifsc.trim().length === 11 && values.holderName.trim().length > 0;

  const fields: { key: keyof SellerBankState; label: string; mono?: boolean; maxLen?: number; upper?: boolean; numeric?: boolean }[] = [
    { key: 'upiId',         label: 'UPI ID (optional)' },
    { key: 'accountNumber', label: 'Bank Account Number', numeric: true },
    { key: 'ifsc',          label: 'IFSC Code', mono: true, maxLen: 11, upper: true },
    { key: 'holderName',    label: 'Account Holder Name' },
  ];

  return (
    <div className={`flex-1 flex flex-col px-6 pt-12 pb-8 overflow-y-auto ${animClass}`}>
      <BackBtn onBack={onBack} />
      <h1 className="text-2xl font-black  mb-2">Bank details</h1>
      <p className="text-sm text-gray-500 mb-8">Needed to receive payments for your orders.</p>

      <div className="flex flex-col gap-4 mb-auto">
        {fields.map(({ key, label, mono, maxLen, upper, numeric }) => (
          <div key={key} className="float-field" style={{ boxShadow: 'var(--shadow-inset)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
            <input
              type="text"
              placeholder=" "
              maxLength={maxLen}
              inputMode={numeric ? 'numeric' : undefined}
              value={values[key]}
              onChange={(e) => {
                let val = e.target.value;
                if (upper) val = val.toUpperCase();
                if (numeric) val = val.replace(/\D/g, '');
                onChange({ ...values, [key]: val });
              }}
              className="w-full px-4  bg-white"
              style={{ height: 56, paddingTop: 20, paddingBottom: 8, fontSize: 15, fontFamily: mono ? 'monospace' : undefined }}
            />
            <label>{label}</label>
          </div>
        ))}

        {/* Note */}
        <div
          className="flex items-start gap-3 p-4"
          style={{ borderRadius: 'var(--radius-sm)', background: '#f0f9ff', border: '1.5px solid #bae6fd' }}
        >
          <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>💳</span>
          <p className="text-xs text-blue-800 leading-relaxed">
            Required to receive payments. You can add or update bank details anytime from your seller dashboard.
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3">
        <ContinueBtn disabled={!valid} onClick={onNext} />
        <button
          onClick={onSkip}
          className="w-full py-3 text-sm font-semibold"
          style={{ background: 'transparent', color: 'var(--text-inactive)', borderRadius: 'var(--radius-pill)', boxShadow: 'none' }}
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}

/* ─── Seller Step 9: Notification Settings ──────────────── */
type SellerNotifsState = { buyerRequests: boolean; orderAlerts: boolean; paymentAlerts: boolean };

function SellerNotifsScreen({ animClass, values, onChange, onBack, onNext }: {
  animClass: string;
  values: SellerNotifsState;
  onChange: (v: SellerNotifsState) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const rows: { key: keyof SellerNotifsState; label: string; desc: string }[] = [
    { key: 'buyerRequests', label: 'New Buyer Requests', desc: 'When a buyer sends you an enquiry' },
    { key: 'orderAlerts',   label: 'Order Alerts',       desc: 'New orders and status changes' },
    { key: 'paymentAlerts', label: 'Payment Alerts',     desc: 'Payment received or pending' },
  ];

  return (
    <div className={`flex-1 flex flex-col px-6 pt-12 pb-8 ${animClass}`}>
      <BackBtn onBack={onBack} />
      <h1 className="text-2xl font-black  mb-2">Notifications</h1>
      <p className="text-sm text-gray-500 mb-8">Choose what you want to hear about.</p>

      <div className="flex flex-col gap-3 mb-auto">
        {rows.map(({ key, label, desc }) => (
          <div
            key={key}
            className="flex items-center justify-between p-4 bg-white"
            style={{ borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow-inset)' }}
          >
            <div>
              <p className="text-sm font-bold">{label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
            </div>
            <Toggle on={values[key]} onToggle={() => onChange({ ...values, [key]: !values[key] })} />
          </div>
        ))}
      </div>

      <div className="mt-8">
        <ContinueBtn disabled={false} onClick={onNext} />
      </div>
    </div>
  );
}

/* ─── Seller Step 10: Logo / Profile Photo ───────────────── */
function SellerLogoScreen({ animClass, onBack, onNext }: {
  animClass: string;
  onBack: () => void;
  onNext: () => void;
}) {
  const [preview, setPreview] = useState<string | null>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
  }

  return (
    <div className={`flex-1 flex flex-col px-6 pt-12 pb-8 ${animClass}`}>
      <BackBtn onBack={onBack} />
      <h1 className="text-2xl font-black  mb-2">Add your logo</h1>
      <p className="text-sm text-gray-500 mb-8">Optional — builds trust with buyers. Add later anytime.</p>

      <div className="flex flex-col items-center gap-5 mb-auto">
        <label
          htmlFor="seller-logo-upload"
          className="flex flex-col items-center justify-center cursor-pointer"
          style={{
            width: 140,
            height: 140,
            borderRadius: '50%',
            border: preview ? 'none' : '2px dashed #d1d5db',
            background: preview ? 'transparent' : '#f9fafb',
            overflow: 'hidden',
            transition: 'border 150ms ease-out',
          }}
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Logo preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div className="flex flex-col items-center gap-2">
              <span style={{ fontSize: 32 }}>📷</span>
              <span className="text-xs text-gray-400 font-medium">Tap to upload</span>
            </div>
          )}
        </label>
        <input id="seller-logo-upload" type="file" accept="image/*" className="hidden" onChange={handleFile} />

        {preview && (
          <button
            onClick={() => setPreview(null)}
            className="text-xs font-semibold"
            style={{ background: 'transparent', color: 'var(--text-inactive)', padding: '4px 12px', boxShadow: 'var(--shadow-raised)', borderRadius: 'var(--radius-pill)' }}
          >
            Remove
          </button>
        )}
      </div>

      <div className="mt-8 flex flex-col gap-3">
        <ContinueBtn disabled={false} onClick={onNext} />
        <button
          onClick={onNext}
          className="w-full py-3 text-sm font-semibold"
          style={{ background: 'transparent', color: 'var(--text-inactive)', borderRadius: 'var(--radius-pill)', boxShadow: 'none' }}
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}

/* ─── Seller Done ────────────────────────────────────────── */
function SellerDoneScreen({ onFinish }: { onFinish: () => void }) {
  const pieces = Array.from({ length: 28 });

  useEffect(() => {
    const t = setTimeout(onFinish, 2800);
    return () => clearTimeout(t);
  }, [onFinish]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8 text-center relative overflow-hidden">
      {pieces.map((_, i) => (
        <div
          key={i}
          className="confetti-piece"
          style={{
            left: `${10 + Math.random() * 80}%`,
            top: '60%',
            background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
            animationDelay: `${Math.random() * 400}ms`,
            animationDuration: `${700 + Math.random() * 500}ms`,
            transform: `rotate(${Math.random() * 360}deg)`,
          }}
        />
      ))}

      <div className="ready-in flex flex-col items-center gap-4">
        <div style={{ fontSize: 72 }}>🎉</div>
        <h1 className="text-3xl font-black  leading-tight">You're ready!</h1>
        <p className="text-base text-gray-500 max-w-xs leading-relaxed">
          Your seller account is set up. Start listing products and reaching buyers across India.
        </p>
        <div className="mt-4 w-6 h-6 spinner" />
      </div>
    </div>
  );
}
