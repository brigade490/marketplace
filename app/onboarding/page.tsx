'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Step = 'splash' | 'welcome';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('splash');

  // Auto-advance from splash after 1500ms
  useEffect(() => {
    if (step !== 'splash') return;
    const t = setTimeout(() => setStep('welcome'), 1500);
    return () => clearTimeout(t);
  }, [step]);

  return (
    <div
      className="fixed inset-0 flex flex-col bg-white"
      style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
    >
      {step === 'splash' && <SplashScreen />}
      {step === 'welcome' && <WelcomeScreen onNext={() => router.push('/')} />}
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
function WelcomeScreen({ onNext }: { onNext: () => void }) {
  return (
    <div
      className="flex-1 flex flex-col items-center justify-center px-8 text-center"
      style={{ animation: 'fadeSlideUp 280ms ease-out both' }}
    >
      {/* Illustration placeholder */}
      <div
        className="mb-8 flex items-center justify-center bg-gray-50"
        style={{ width: 160, height: 160, borderRadius: '50%' }}
      >
        <span style={{ fontSize: 64 }}>🤝</span>
      </div>

      <h1
        className="text-3xl font-black text-black mb-3 leading-tight"
        style={{ animation: 'fadeSlideUp 280ms 60ms ease-out both' }}
      >
        Welcome to<br />Karobarrr
      </h1>
      <p
        className="text-base text-gray-500 mb-12 leading-relaxed max-w-xs"
        style={{ animation: 'fadeSlideUp 280ms 120ms ease-out both' }}
      >
        India's largest B2B marketplace. Buy and sell in bulk — directly with verified businesses.
      </p>

      {/* CTA */}
      <div
        className="w-full max-w-sm flex flex-col gap-3"
        style={{ animation: 'fadeSlideUp 280ms 180ms ease-out both' }}
      >
        <button
          onClick={onNext}
          className="w-full py-4 text-base font-bold"
          style={{ background: '#000', color: '#fff', borderRadius: '999px' }}
        >
          Get Started
        </button>
        <button
          onClick={onNext}
          className="w-full py-4 text-base font-semibold"
          style={{ background: 'transparent', color: '#6b7280', borderRadius: '999px', border: '1.5px solid #e5e7eb' }}
        >
          I already have an account
        </button>
      </div>
    </div>
  );
}
