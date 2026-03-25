"use client";

import Link from "next/link";
import { useState } from "react";

export default function BuyerAuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    password: "",
    confirmPassword: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Auth logic will go here once Supabase is connected
    alert(`${mode === "login" ? "Login" : "Sign up"} submitted — connect Supabase to enable auth.`);
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
            Source smarter,<br />
            <span className="text-yellow-400">trade safer.</span>
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed mb-8">
            Join thousands of businesses discovering verified suppliers and closing deals on Karobarrr every day.
          </p>

          <div className="space-y-4">
            {[
              { emoji: "✅", text: "Access 48,000+ verified products" },
              { emoji: "🛡️", text: "Fraud-monitored, secure marketplace" },
              { emoji: "📋", text: "Post requirements & get proposals" },
              { emoji: "🚚", text: "Track every order from placement to delivery" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3">
                <span className="text-lg">{item.emoji}</span>
                <span className="text-gray-300 text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-xs text-gray-600">
          © 2026 Karobarrr Technologies. All rights reserved.
        </div>
      </div>

      {/* Right panel — form */}
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
              onClick={() => setMode("signup")}
            >
              Create Account
            </button>
            <button
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${mode === "login" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
              onClick={() => setMode("login")}
            >
              Sign In
            </button>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-black text-gray-900">
              {mode === "signup" ? "Join Karobarrr as a Buyer" : "Welcome back"}
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              {mode === "signup"
                ? "Create your free buyer account to start sourcing."
                : "Sign in to access your buyer dashboard."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="John Smith"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Company Name</label>
                  <input
                    type="text"
                    name="company"
                    value={form.company}
                    onChange={handleChange}
                    placeholder="Acme Corp Ltd."
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+1 555 000 0000"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email Address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="john@company.com"
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
                minLength={8}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition"
              />
            </div>

            {mode === "signup" && (
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
            )}

            {mode === "login" && (
              <div className="text-right">
                <a href="#" className="text-xs font-medium text-yellow-600 hover:text-yellow-700">
                  Forgot password?
                </a>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-yellow-400 text-gray-900 font-bold text-sm hover:bg-yellow-500 transition-colors mt-2"
            >
              {mode === "signup" ? "Create Buyer Account 🚀" : "Sign In →"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">or continue with</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* OAuth */}
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition">
              🌐 Google
            </button>
            <button className="flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition">
              💼 LinkedIn
            </button>
          </div>

          {/* Switch role */}
          <div className="mt-6 p-4 rounded-xl bg-gray-50 border border-gray-100 text-center">
            <p className="text-xs text-gray-500">
              Want to sell on Karobarrr?{" "}
              <Link href="/auth/seller" className="font-semibold text-yellow-600 hover:text-yellow-700">
                Create a Seller Account →
              </Link>
            </p>
          </div>

          <p className="text-xs text-gray-400 text-center mt-4">
            By signing up, you agree to our{" "}
            <a href="#" className="underline hover:text-gray-600">Terms of Service</a>
            {" "}and{" "}
            <a href="#" className="underline hover:text-gray-600">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
