'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Step = 'splash' | 'welcome' | 'account-type' | 'b-basic' | 'b-business' | 'b-categories' | 'b-location' | 'b-prefs' | 'b-payment' | 'b-notifs';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('splash');
  const [dir, setDir] = useState<'fwd' | 'bck'>('fwd');

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

  const progressMap: Partial<Record<Step, number>> = {
    'b-basic': 1,
    'b-business': 2,
    'b-categories': 3,
    'b-location': 4,
    'b-prefs': 5,
    'b-payment': 6,
    'b-notifs': 7,
  };
  const totalBuyerSteps = 7;
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
      <h1 className="text-2xl font-black text-black mb-2">What do you buy?</h1>
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
                borderRadius: '999px',
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
      <h1 className="text-2xl font-black text-black mb-2">Your location</h1>
      <p className="text-sm text-gray-500 mb-8">We'll show you nearby suppliers and deals.</p>

      <div className="flex flex-col gap-4 mb-auto">
        {/* Auto-detect button */}
        <button
          onClick={handleDetect}
          disabled={detectStatus === 'detecting'}
          className="flex items-center justify-center gap-2 w-full py-3.5 text-sm font-bold"
          style={{
            borderRadius: '12px',
            border: '1.5px solid #e5e7eb',
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
          style={{ border: '1.5px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}
        >
          <input
            type="text"
            placeholder=" "
            value={values.city}
            onChange={(e) => onChange({ ...values, city: e.target.value })}
            className="w-full px-4 text-black bg-white"
            style={{ height: 56, paddingTop: 20, paddingBottom: 8, fontSize: 15 }}
          />
          <label>City</label>
        </div>

        <div
          className="float-field"
          style={{ border: '1.5px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}
        >
          <input
            type="text"
            placeholder=" "
            value={values.state}
            onChange={(e) => onChange({ ...values, state: e.target.value })}
            className="w-full px-4 text-black bg-white"
            style={{ height: 56, paddingTop: 20, paddingBottom: 8, fontSize: 15 }}
          />
          <label>State</label>
        </div>

        <div
          className="float-field"
          style={{ border: '1.5px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}
        >
          <input
            type="text"
            placeholder=" "
            inputMode="numeric"
            maxLength={6}
            value={values.pincode}
            onChange={(e) => onChange({ ...values, pincode: e.target.value.replace(/\D/g, '') })}
            className="w-full px-4 text-black bg-white"
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
        background: on ? '#000' : '#d1d5db',
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
          background: '#fff',
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
      <p className="text-xs font-bold text-black uppercase tracking-widest mb-3">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = value === opt;
          return (
            <button
              key={opt}
              onClick={() => onChange(opt)}
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
      <h1 className="text-2xl font-black text-black mb-2">Buying preferences</h1>
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
      <h1 className="text-2xl font-black text-black mb-2">Payment preferences</h1>
      <p className="text-sm text-gray-500 mb-8">Choose your preferred payment methods.</p>

      <div className="flex flex-col gap-3 mb-auto">
        {rows.map(({ key, label, desc }) => (
          <div
            key={key}
            className="flex items-center justify-between p-4 bg-white"
            style={{ borderRadius: '12px', border: '1.5px solid #e5e7eb' }}
          >
            <div>
              <p className="text-sm font-bold text-black">{label}</p>
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
      <h1 className="text-2xl font-black text-black mb-2">Notifications</h1>
      <p className="text-sm text-gray-500 mb-8">Choose what you want to hear about.</p>

      <div className="flex flex-col gap-3 mb-auto">
        {rows.map(({ key, label, desc }) => (
          <div
            key={key}
            className="flex items-center justify-between p-4 bg-white"
            style={{ borderRadius: '12px', border: '1.5px solid #e5e7eb' }}
          >
            <div>
              <p className="text-sm font-bold text-black">{label}</p>
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
