'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

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

  // File uploads lifted from child screens
  const [sellerGstCertFile, setSellerGstCertFile] = useState<File | null>(null);
  const [sellerBizProofFile, setSellerBizProofFile] = useState<File | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  function goTo(next: Step) {
    setDir('fwd');
    setStep(next);
    // Save progress after each forward step (fire-and-forget)
    if (next !== 'b-done' && next !== 's-done' && next !== 'splash' && next !== 'welcome' && next !== 'account-type') {
      saveStepProgress(next).catch(console.error);
    }
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

  // Auth check on mount: pre-fill known fields, skip if already onboarded, resume if mid-flow
  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('users')
          .select('onboarding_completed, role, full_name, email, city, state, pincode, business_name, gst_number, onboarding_step')
          .eq('id', user.id)
          .single();
        if (data?.onboarding_completed) {
          router.replace(data.role === 'seller' ? '/seller/dashboard' : '/');
          return;
        }
        // Pre-fill email from auth
        const prefillEmail = user.email ?? '';
        const prefillName = data?.full_name ?? '';
        setBuyerBasic(v => ({ ...v, email: prefillEmail, name: v.name || prefillName }));
        setSellerBasic(v => ({ ...v, email: prefillEmail, name: v.name || prefillName }));

        // Resume from saved step if available
        const savedStep = data?.onboarding_step as Step | undefined;
        if (savedStep && (savedStep.startsWith('b-') || savedStep.startsWith('s-'))) {
          const isBuyer = savedStep.startsWith('b-');
          if (isBuyer) {
            const { data: bd } = await supabase.from('buyers').select('*').eq('user_id', user.id).maybeSingle();
            if (bd) {
              setBuyerBusiness({ businessName: bd.company_name || '', businessType: bd.business_type || '' });
              setBuyerCategories(bd.categories || []);
              setBuyerLocation({ city: bd.city || data?.city || '', state: bd.state || data?.state || '', pincode: bd.pincode || data?.pincode || '' });
              if (bd.preferences && typeof bd.preferences === 'object') setBuyerPrefs(bd.preferences as { orderType: string; frequency: string; urgency: string });
              if (bd.payment_methods && typeof bd.payment_methods === 'object') setBuyerPayment(bd.payment_methods as { upi: boolean; bankTransfer: boolean; emi: boolean; cod: boolean });
              if (bd.notifications && typeof bd.notifications === 'object') setBuyerNotifs(bd.notifications as { orderUpdates: boolean; sellerResponses: boolean; priceAlerts: boolean; promotions: boolean });
            }
          } else {
            const { data: sd } = await supabase.from('sellers').select('*').eq('user_id', user.id).maybeSingle();
            if (sd) {
              setSellerBusiness({ businessName: sd.company_name || '', businessType: sd.business_type || '' });
              setSellerCategories(sd.categories || []);
              setSellerLocation({ city: sd.city || data?.city || '', state: sd.state || data?.state || '', pincode: sd.pincode || data?.pincode || '' });
              setSellerGst(sd.gstin || data?.gst_number || '');
              if (sd.preferences && typeof sd.preferences === 'object') setSellerSelling(sd.preferences as typeof sellerSelling);
              if (sd.bank_details && typeof sd.bank_details === 'object') setSellerBank(sd.bank_details as typeof sellerBank);
              if (sd.notifications && typeof sd.notifications === 'object') setSellerNotifs(sd.notifications as typeof sellerNotifs);
            }
          }
          setStep(savedStep);
        }
      }
      setAuthChecked(true);
    }
    checkAuth();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Upload helper ──────────────────────────────────────────
  async function uploadFile(supabase: ReturnType<typeof createClient>, file: File, prefix: string): Promise<string | undefined> {
    const ext = file.name.split('.').pop() ?? 'bin';
    const path = `${prefix}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { data: up, error } = await supabase.storage.from('uploads').upload(path, file, { upsert: true });
    if (error || !up) return undefined;
    return supabase.storage.from('uploads').getPublicUrl(up.path).data.publicUrl;
  }

  // ── Save step progress (called on each forward navigation) ──
  async function saveStepProgress(nextStep: Step) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const isBuyer = nextStep.startsWith('b-');
    const isSeller = nextStep.startsWith('s-');
    if (!isBuyer && !isSeller) return;
    try {
      // Build users update — only include non-empty values
      const userFields: Record<string, unknown> = {
        id: user.id, email: user.email,
        onboarding_step: nextStep,
        role: isBuyer ? 'buyer' : 'seller',
        updated_at: new Date().toISOString(),
      };
      const src = isBuyer
        ? { name: buyerBasic.name, loc: buyerLocation, biz: buyerBusiness, gst: '' }
        : { name: sellerBasic.name, loc: sellerLocation, biz: sellerBusiness, gst: sellerGst };
      if (src.name) userFields.full_name = src.name;
      if (src.loc.city) userFields.city = src.loc.city;
      if (src.loc.state) userFields.state = src.loc.state;
      if (src.loc.pincode) userFields.pincode = src.loc.pincode;
      if (src.biz.businessName) userFields.business_name = src.biz.businessName;
      if (src.gst) userFields.gst_number = src.gst;
      await supabase.from('users').upsert(userFields, { onConflict: 'id' });

      if (isBuyer) {
        const buyerFields: Record<string, unknown> = { user_id: user.id };
        if (buyerBusiness.businessName) buyerFields.company_name = buyerBusiness.businessName;
        if (buyerBusiness.businessType) buyerFields.business_type = buyerBusiness.businessType;
        if (buyerCategories.length) buyerFields.categories = buyerCategories;
        if (buyerLocation.city) buyerFields.city = buyerLocation.city;
        if (buyerLocation.state) buyerFields.state = buyerLocation.state;
        if (buyerLocation.pincode) buyerFields.pincode = buyerLocation.pincode;
        buyerFields.preferences = { orderType: buyerPrefs.orderType, frequency: buyerPrefs.frequency, urgency: buyerPrefs.urgency };
        buyerFields.payment_methods = buyerPayment;
        buyerFields.notifications = buyerNotifs;
        await supabase.from('buyers').upsert(buyerFields, { onConflict: 'user_id' });
      } else {
        const sellerFields: Record<string, unknown> = { user_id: user.id, company_name: sellerBusiness.businessName || 'My Business' };
        if (sellerBusiness.businessType) sellerFields.business_type = sellerBusiness.businessType;
        if (sellerCategories.length) sellerFields.categories = sellerCategories;
        if (sellerLocation.city) sellerFields.city = sellerLocation.city;
        if (sellerLocation.state) sellerFields.state = sellerLocation.state;
        if (sellerLocation.pincode) sellerFields.pincode = sellerLocation.pincode;
        if (sellerGst) sellerFields.gstin = sellerGst;
        sellerFields.preferences = { orderType: sellerSelling.orderType, delivery: sellerSelling.delivery, upi: sellerSelling.upi, bankTransfer: sellerSelling.bankTransfer, emi: sellerSelling.emi };
        sellerFields.bank_details = { upiId: sellerBank.upiId || null, accountNumber: sellerBank.accountNumber || null, ifsc: sellerBank.ifsc || null, holderName: sellerBank.holderName || null };
        sellerFields.notifications = sellerNotifs;
        await supabase.from('sellers').upsert(sellerFields, { onConflict: 'user_id' });
      }
    } catch (err) { console.error('saveStepProgress error:', err); }
  }

  // ── Save buyer data on completion ─────────────────────────
  async function handleBuyerComplete(logoFile?: File) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { goTo('b-done'); return; }
    try {
      const logoUrl = logoFile ? await uploadFile(supabase, logoFile, 'logos') : undefined;
      await supabase.from('users').upsert({
        id: user.id,
        email: buyerBasic.email || user.email,
        full_name: buyerBasic.name || undefined,
        city: buyerLocation.city || undefined,
        state: buyerLocation.state || undefined,
        pincode: buyerLocation.pincode || undefined,
        business_name: buyerBusiness.businessName || undefined,
        role: 'buyer',
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });
      await supabase.from('buyers').upsert({
        user_id: user.id,
        company_name: buyerBusiness.businessName || undefined,
        business_type: buyerBusiness.businessType || undefined,
        categories: buyerCategories,
        city: buyerLocation.city || undefined,
        state: buyerLocation.state || undefined,
        pincode: buyerLocation.pincode || undefined,
        preferences: { orderType: buyerPrefs.orderType, frequency: buyerPrefs.frequency, urgency: buyerPrefs.urgency },
        payment_methods: buyerPayment,
        notifications: buyerNotifs,
        ...(logoUrl ? { logo_url: logoUrl } : {}),
      }, { onConflict: 'user_id' });
    } catch (err) { console.error('Buyer onboarding save error:', err); }
    goTo('b-done');
  }

  // ── Save seller data on completion ────────────────────────
  async function handleSellerComplete(logoFile?: File) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { goTo('s-done'); return; }
    try {
      const [logoUrl, gstCertUrl, bizProofUrl] = await Promise.all([
        logoFile ? uploadFile(supabase, logoFile, 'logos') : Promise.resolve(undefined),
        sellerGstCertFile ? uploadFile(supabase, sellerGstCertFile, 'gst-certs') : Promise.resolve(undefined),
        sellerBizProofFile ? uploadFile(supabase, sellerBizProofFile, 'biz-proofs') : Promise.resolve(undefined),
      ]);
      await supabase.from('users').upsert({
        id: user.id,
        email: sellerBasic.email || user.email,
        full_name: sellerBasic.name || undefined,
        city: sellerLocation.city || undefined,
        state: sellerLocation.state || undefined,
        pincode: sellerLocation.pincode || undefined,
        business_name: sellerBusiness.businessName || undefined,
        gst_number: sellerGst || undefined,
        role: 'seller',
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });
      await supabase.from('sellers').upsert({
        user_id: user.id,
        company_name: sellerBusiness.businessName || 'My Business',
        business_type: sellerBusiness.businessType.toLowerCase() || undefined,
        categories: sellerCategories,
        city: sellerLocation.city || undefined,
        state: sellerLocation.state || undefined,
        pincode: sellerLocation.pincode || undefined,
        gstin: sellerGst || undefined,
        is_verified: false,
        preferences: {
          orderType: sellerSelling.orderType,
          delivery: sellerSelling.delivery,
          upi: sellerSelling.upi,
          bankTransfer: sellerSelling.bankTransfer,
          emi: sellerSelling.emi,
        },
        bank_details: {
          upiId: sellerBank.upiId || undefined,
          accountNumber: sellerBank.accountNumber || undefined,
          ifsc: sellerBank.ifsc || undefined,
          holderName: sellerBank.holderName || undefined,
        },
        notifications: sellerNotifs,
        ...(logoUrl ? { logo_url: logoUrl } : {}),
        ...(gstCertUrl ? { gst_certificate_url: gstCertUrl } : {}),
        ...(bizProofUrl ? { business_proof_url: bizProofUrl } : {}),
      }, { onConflict: 'user_id' });
    } catch (err) { console.error('Seller onboarding save error:', err); }
    goTo('s-done');
  }

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

  if (!authChecked) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="w-6 h-6 spinner" />
      </div>
    );
  }

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

      <div className="flex-1 flex flex-col items-center overflow-y-auto">
      <div className="w-full flex-1 flex flex-col" style={{ maxWidth: '480px' }}>

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
          onNext={(file) => handleBuyerComplete(file)}
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
          onGstCertChange={setSellerGstCertFile}
          onBizProofChange={setSellerBizProofFile}
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
          onNext={(file) => handleSellerComplete(file)}
        />
      )}

      {step === 's-done' && (
        <SellerDoneScreen key="s-done" onFinish={() => router.push('/seller/dashboard')} />
      )}

      </div>
      </div>
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
        background: disabled ? '#e0e0e0' : '#000',
        color: disabled ? '#aaa' : '#fff',
        borderRadius: 'var(--radius-pill)',
        boxShadow: 'none',
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
    <div className={`flex-1 flex flex-col px-6 pt-6 pb-6 ${animClass}`}>
      <BackBtn onBack={onBack} />
      <div style={{ maxWidth: '600px', width: '100%', margin: '0 auto' }}>
      <h1 className="text-xl font-black mb-1">How will you use Karobarrr?</h1>
      <p className="text-sm text-gray-500 mb-5">Choose your account type to get started.</p>

      <div className="flex flex-col gap-3 mb-6">
        {([
          { key: 'buyer', emoji: '🛒', title: 'I am a Buyer', desc: 'Source products from verified Indian suppliers.' },
          { key: 'seller', emoji: '🏭', title: 'I am a Seller', desc: 'List products and reach thousands of B2B buyers.' },
        ] as const).map(({ key, emoji, title, desc }) => (
          <div
            key={key}
            role="button"
            tabIndex={0}
            onClick={() => setSelected(key)}
            onKeyDown={(e) => e.key === 'Enter' && setSelected(key)}
            className="flex items-center gap-4 cursor-pointer"
            style={{
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              boxShadow: selected === key ? 'var(--shadow-active)' : 'var(--shadow-raised)',
              background: 'var(--surface)',
              transition: 'box-shadow 150ms ease-out',
            }}
          >
            <div
              className="flex items-center justify-center shrink-0"
              style={{ width: 44, height: 44, borderRadius: 'var(--radius-sm)', background: 'var(--bg)', fontSize: 22 }}
            >
              {emoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-black mb-0.5">{title}</div>
              <div className="text-xs text-gray-500 leading-snug">{desc}</div>
            </div>
            <div
              className="shrink-0 w-5 h-5 flex items-center justify-center"
              style={{
                borderRadius: '50%',
                background: selected === key ? '#000' : 'transparent',
                border: selected === key ? 'none' : '1.5px solid #d1d5db',
                transition: 'all 150ms ease-out',
              }}
            >
              {selected === key && (
                <span className="check-in text-white font-black" style={{ fontSize: 10 }}>✓</span>
              )}
            </div>
          </div>
        ))}
      </div>

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
          style={{ borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}
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
          style={{ borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}
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
          style={{ borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}
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
          style={{ borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}
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
          style={{ borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}
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
          style={{ borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}
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
  onNext: (file?: File) => void;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | undefined>(undefined);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  return (
    <div className={`flex-1 flex flex-col px-6 pt-12 pb-8 ${animClass}`}>
      <BackBtn onBack={onBack} />
      <h1 className="text-2xl font-black  mb-2">Add your logo</h1>
      <p className="text-sm text-gray-500 mb-8">Optional — you can always add it later.</p>

      <div className="flex flex-col items-center gap-5 mb-auto">
        <label
          htmlFor="logo-upload"
          className="flex flex-col items-center justify-center cursor-pointer"
          style={{
            width: 140, height: 140, borderRadius: '50%',
            border: preview ? 'none' : '2px dashed #d1d5db',
            background: preview ? 'transparent' : '#f9fafb',
            overflow: 'hidden', transition: 'border 150ms ease-out',
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
          <button onClick={() => { setPreview(null); setFile(undefined); }} className="text-xs font-semibold"
            style={{ background: 'transparent', color: 'var(--text-inactive)', padding: '4px 12px', boxShadow: 'var(--shadow-raised)', borderRadius: 'var(--radius-pill)' }}>
            Remove
          </button>
        )}
      </div>

      <div className="mt-8 flex flex-col gap-3">
        <ContinueBtn disabled={false} onClick={() => onNext(file)} />
        <button onClick={() => onNext(undefined)} className="w-full py-3 text-sm font-semibold"
          style={{ background: 'transparent', color: 'var(--text-inactive)', borderRadius: 'var(--radius-pill)', boxShadow: 'none' }}>
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
        <div className="float-field" style={{ borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
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

        <div className="float-field" style={{ borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
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
        <div className="float-field" style={{ borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
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

        <div className="float-field" style={{ borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
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

        <div className="float-field" style={{ borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
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

        <div className="float-field" style={{ borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
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
        <div className="float-field" style={{ borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
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
function SellerVerifyScreen({ animClass, onBack, onNext, onGstCertChange, onBizProofChange }: {
  animClass: string;
  onBack: () => void;
  onNext: () => void;
  onGstCertChange: (file: File | null) => void;
  onBizProofChange: (file: File | null) => void;
}) {
  const [gstCert, setGstCert] = useState<string | null>(null);
  const [bizProof, setBizProof] = useState<string | null>(null);

  function handleFile(nameSetter: (v: string) => void, fileSetter: (f: File | null) => void) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0] ?? null;
      if (f) { nameSetter(f.name); fileSetter(f); }
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
          { id: 'gst-cert', label: 'GST Certificate', state: gstCert, nameSetter: setGstCert, fileSetter: onGstCertChange },
          { id: 'biz-proof', label: 'Business Proof', state: bizProof, nameSetter: setBizProof, fileSetter: onBizProofChange },
        ] as const).map(({ id, label, state, nameSetter, fileSetter }) => (
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
                <p className="text-xs text-gray-400 mt-0.5">{state ? state : 'Tap to upload'}</p>
              </div>
            </div>
            <div className="shrink-0 px-3 py-1 text-xs font-bold"
              style={{ borderRadius: 'var(--radius-pill)', background: state ? '#f0fdf4' : '#f3f4f6', color: state ? '#16a34a' : '#6b7280' }}>
              {state ? 'Uploaded' : 'Pending'}
            </div>
            <input id={id} type="file" accept=".pdf,image/*" className="hidden" onChange={handleFile(nameSetter, fileSetter)} />
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
          <div key={key} className="float-field" style={{ borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
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
  onNext: (file?: File) => void;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | undefined>(undefined);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  return (
    <div className={`flex-1 flex flex-col px-6 pt-12 pb-8 ${animClass}`}>
      <BackBtn onBack={onBack} />
      <h1 className="text-2xl font-black  mb-2">Add your logo</h1>
      <p className="text-sm text-gray-500 mb-8">Optional — builds trust with buyers. Add later anytime.</p>

      <div className="flex flex-col items-center gap-5 mb-auto">
        <label htmlFor="seller-logo-upload" className="flex flex-col items-center justify-center cursor-pointer"
          style={{ width: 140, height: 140, borderRadius: '50%', border: preview ? 'none' : '2px dashed #d1d5db',
            background: preview ? 'transparent' : '#f9fafb', overflow: 'hidden', transition: 'border 150ms ease-out' }}>
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
          <button onClick={() => { setPreview(null); setFile(undefined); }} className="text-xs font-semibold"
            style={{ background: 'transparent', color: 'var(--text-inactive)', padding: '4px 12px', boxShadow: 'var(--shadow-raised)', borderRadius: 'var(--radius-pill)' }}>
            Remove
          </button>
        )}
      </div>

      <div className="mt-8 flex flex-col gap-3">
        <ContinueBtn disabled={false} onClick={() => onNext(file)} />
        <button onClick={() => onNext(undefined)} className="w-full py-3 text-sm font-semibold"
          style={{ background: 'transparent', color: 'var(--text-inactive)', borderRadius: 'var(--radius-pill)', boxShadow: 'none' }}>
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
