"use client";

import Link from "next/link";
import { useState } from "react";

const tierInfo = [
  { tier: "Bronze", emoji: "🥉", desc: "New verified sellers", color: "border-orange-300 bg-orange-50" },
  { tier: "Silver", emoji: "🥈", desc: "50+ completed orders", color: "border-gray-300 bg-gray-50" },
  { tier: "Gold", emoji: "🥇", desc: "200+ orders, 4.8+ rating", color: "border-yellow-400 bg-yellow-50" },
];

export default function SellerAuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    businessType: "",
    country: "",
    password: "",
    confirmPassword: "",
    taxId: "",
    website: "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleNext(e: React.FormEvent) {
    e.preventDefault();
    setStep(2);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    alert("Seller registration submitted — connect Supabase to enable auth.");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gray-900 text-white p-12">
        <div className="flex items-center gap-1">
          <span className="text-3xl font-black tracking-tight text-white">Karobarrr</span>
        </div>

        <div>
          <h1 className="text-4xl font-black leading-tight mb-4">
            Reach thousands of<br />
            <span className="text-yellow-400">B2B buyers globally.</span>
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed mb-8">
            Start with a Bronze badge and grow to Gold as your business thrives on Karobarrr.
          </p>

          {/* Tier cards */}
          <div className="space-y-3">
            {tierInfo.map((t) => (
              <div key={t.tier} className="flex items-center gap-3 bg-gray-800 rounded-xl p-4 border border-gray-700">
                <span className="text-2xl">{t.emoji}</span>
                <div>
                  <div className="font-bold text-sm">{t.tier} Seller</div>
                  <div className="text-xs text-gray-400">{t.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-yellow-400/10 rounded-xl border border-yellow-400/20">
            <p className="text-sm text-yellow-300">
              🛡️ All seller accounts are reviewed within 24 hours. Fraud monitoring runs continuously to protect buyers and legitimate sellers.
            </p>
          </div>
        </div>

        <div className="text-xs text-gray-600">
          © 2026 Karobarrr Technologies. All rights reserved.
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-1 mb-8 lg:hidden">
            <Link href="/" className="flex items-center gap-1">
              <span className="text-2xl font-black text-gray-900">Karobarrr</span>
            </Link>
          </div>

          {/* Toggle */}
          <div className="flex rounded-xl bg-gray-100 p-1 mb-8">
            <button
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${mode === "signup" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
              onClick={() => { setMode("signup"); setStep(1); }}
            >
              Register as Seller
            </button>
            <button
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${mode === "login" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
              onClick={() => { setMode("login"); setStep(1); }}
            >
              Seller Login
            </button>
          </div>

          {/* Login form */}
          {mode === "login" && (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-black text-gray-900">Seller Portal</h2>
                <p className="text-gray-500 text-sm mt-1">Sign in to manage your store and orders.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="seller@company.com"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition"
                  />
                </div>
                <div className="text-right">
                  <a href="#" className="text-xs font-medium text-yellow-600 hover:text-yellow-700">Forgot password?</a>
                </div>
                <button type="submit" className="w-full py-3.5 rounded-xl bg-yellow-400 text-gray-900 font-bold text-sm hover:bg-yellow-500 transition-colors">
                  Sign In to Dashboard →
                </button>
              </form>
            </>
          )}

          {/* Signup — Step 1 */}
          {mode === "signup" && step === 1 && (
            <>
              <div className="mb-2">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-2xl font-black text-gray-900">Create Seller Account</h2>
                </div>
                <p className="text-gray-500 text-sm">Step 1 of 2 — Personal & Business Details</p>
                <div className="w-full bg-gray-200 rounded-full h-1 mt-3">
                  <div className="bg-yellow-400 h-1 rounded-full w-1/2" />
                </div>
              </div>

              <form onSubmit={handleNext} className="space-y-4 mt-6">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Jane Doe"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+1 555 0000"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Company / Business Name</label>
                  <input
                    type="text"
                    name="company"
                    value={form.company}
                    onChange={handleChange}
                    placeholder="TechMach Industries Ltd."
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Business Type</label>
                  <select
                    name="businessType"
                    value={form.businessType}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition"
                  >
                    <option value="">Select type...</option>
                    <option value="manufacturer">Manufacturer</option>
                    <option value="distributor">Distributor</option>
                    <option value="wholesaler">Wholesaler</option>
                    <option value="trader">Trading Company</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Country</label>
                  <input
                    type="text"
                    name="country"
                    value={form.country}
                    onChange={handleChange}
                    placeholder="United States"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition"
                  />
                </div>

                <button type="submit" className="w-full py-3.5 rounded-xl bg-gray-900 text-white font-bold text-sm hover:bg-yellow-400 hover:text-gray-900 transition-colors">
                  Continue →
                </button>
              </form>
            </>
          )}

          {/* Signup — Step 2 */}
          {mode === "signup" && step === 2 && (
            <>
              <div className="mb-2">
                <div className="flex items-center gap-2 mb-1">
                  <button onClick={() => setStep(1)} className="text-gray-400 hover:text-gray-600 text-sm">← Back</button>
                  <h2 className="text-2xl font-black text-gray-900">Almost there!</h2>
                </div>
                <p className="text-gray-500 text-sm">Step 2 of 2 — Account Security & Verification</p>
                <div className="w-full bg-gray-200 rounded-full h-1 mt-3">
                  <div className="bg-yellow-400 h-1 rounded-full w-full" />
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="seller@company.com"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Tax ID / Business Registration No.</label>
                  <input
                    type="text"
                    name="taxId"
                    value={form.taxId}
                    onChange={handleChange}
                    placeholder="EIN / VAT / GST number"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Website (optional)</label>
                  <input
                    type="url"
                    name="website"
                    value={form.website}
                    onChange={handleChange}
                    placeholder="https://yourcompany.com"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    minLength={8}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    minLength={8}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition"
                  />
                </div>

                <button type="submit" className="w-full py-3.5 rounded-xl bg-yellow-400 text-gray-900 font-bold text-sm hover:bg-yellow-500 transition-colors">
                  Submit for Verification 🚀
                </button>
              </form>
            </>
          )}

          {/* Switch role */}
          <div className="mt-6 p-4 rounded-xl bg-gray-50 border border-gray-100 text-center">
            <p className="text-xs text-gray-500">
              Looking to buy instead?{" "}
              <Link href="/auth/buyer" className="font-semibold text-yellow-600 hover:text-yellow-700">
                Create a Buyer Account →
              </Link>
            </p>
          </div>

          <p className="text-xs text-gray-400 text-center mt-4">
            By registering, you agree to our{" "}
            <a href="#" className="underline hover:text-gray-600">Terms</a>
            {" "}and{" "}
            <a href="#" className="underline hover:text-gray-600">Seller Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
