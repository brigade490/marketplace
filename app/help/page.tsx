'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const FAQS = [
  {
    q: 'How do I place an order?',
    a: 'Browse products, click on a product to view details, then contact the seller or request a quote. Once agreed, the seller will create an order for you.',
  },
  {
    q: 'How can I become a seller?',
    a: 'Click "Start Selling" in the header or go to your account and select "Become a Seller". Fill in your business details and you\'ll be set up immediately.',
  },
  {
    q: 'What is the verification process?',
    a: 'Go to Verification Status in your account, upload your GST certificate and business proof. Our team reviews documents within 1–3 business days.',
  },
  {
    q: 'How do payments work?',
    a: 'Payments are handled directly between buyers and sellers. You can save your UPI ID or bank account in the Payments & Billing section for reference.',
  },
  {
    q: 'How do I track my orders?',
    a: 'Go to My Orders to see all your orders and their current status. Sellers update order status as it progresses.',
  },
  {
    q: 'Can I post a buying requirement?',
    a: 'Yes! Go to Post Requirement and describe what you need. Sellers will send you competitive quotes and proposals.',
  },
  {
    q: 'How do I contact a seller?',
    a: 'You can message sellers directly through the Messages section, or click "Contact Seller" on any product or order detail page.',
  },
  {
    q: 'Is my data secure?',
    a: "Yes, we use industry-standard encryption and Supabase's secure database infrastructure. Your data is protected with Row Level Security policies.",
  },
];

export default function HelpPage() {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setIsLoggedIn(!!data.user));
  }, []);

  async function handleTicket(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) { setError('Please fill in all fields'); return; }

    setSubmitting(true);
    setError('');
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) { router.push('/auth/buyer'); return; }

    const { error: err } = await supabase.from('support_tickets').insert({
      user_id: user.id,
      subject: subject.trim(),
      description: description.trim(),
    });

    if (err) { setError(err.message); setSubmitting(false); return; }

    setSubmitted(true);
    setSubject('');
    setDescription('');
    setSubmitting(false);
  }

  return (
    <div className="min-h-screen py-10 px-4" style={{ background: 'var(--bg)' }}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-black  mb-2">Help & Support</h1>
        <p className="text-gray-500 text-sm mb-8">Find answers to common questions or reach out to our support team.</p>

        {/* FAQ */}
        <div className="bg-white mb-8" style={{ borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-raised)', overflow: 'hidden' }}>
          <div className="px-6 pt-6 pb-2">
            <h2 className="text-lg font-black">Frequently Asked Questions</h2>
          </div>
          <div>
            {FAQS.map((faq, idx) => (
              <div key={idx} style={{ borderTop: idx === 0 ? 'none' : '1px solid #f3f4f6' }}>
                <button
                  className="w-full text-left px-6 py-4 flex items-center justify-between gap-3"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                >
                  <span className="text-sm font-semibold">{faq.q}</span>
                  <span
                    className="flex-shrink-0 text-gray-400 text-lg transition-transform"
                    style={{ transform: openFaq === idx ? 'rotate(180deg)' : 'none' }}
                  >
                    ▾
                  </span>
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-5">
                    <p className="text-sm text-gray-600 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact section */}
        <div className="bg-white mb-6" style={{ borderRadius: 'var(--radius-md)', padding: '28px', boxShadow: 'var(--shadow-raised)' }}>
          <h2 className="text-lg font-black  mb-1">Contact Support</h2>
          <p className="text-sm text-gray-500 mb-4">Can't find your answer? Reach out to us directly.</p>
          <div className="flex flex-wrap gap-4">
            <a
              href="mailto:support@karobarrr.com"
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold"
              style={{ boxShadow: 'var(--shadow-raised)', borderRadius: 'var(--radius-pill)', color: '#000', background: 'var(--surface)' }}
            >
              📧 Email Support
            </a>
            <a
              href="#"
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white"
              style={{ background: 'var(--active-bg)', borderRadius: 'var(--radius-pill)' }}
            >
              💬 Live Chat
            </a>
          </div>
        </div>

        {/* Raise ticket */}
        <div className="bg-white" style={{ borderRadius: 'var(--radius-md)', padding: '28px', boxShadow: 'var(--shadow-raised)' }}>
          <h2 className="text-lg font-black  mb-1">Raise a Ticket</h2>
          <p className="text-sm text-gray-500 mb-5">Submit a support ticket and we'll get back to you within 24 hours.</p>

          {submitted ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">✅</div>
              <h3 className="font-black  mb-1">Ticket Submitted!</h3>
              <p className="text-sm text-gray-500">We'll respond to your query within 24 hours.</p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-4 text-sm font-semibold  underline"
              >
                Submit another ticket
              </button>
            </div>
          ) : (
            <form onSubmit={handleTicket} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Subject *</label>
                <input
                  type="text"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="Brief description of your issue"
                  required
                  className="w-full px-4 py-3 text-sm  placeholder-gray-400 outline-none"
                  style={{ borderRadius: 'var(--radius-sm)' }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#000')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'var(--surface)')}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Description *</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Describe your issue in detail..."
                  rows={4}
                  required
                  className="w-full px-4 py-3 text-sm  placeholder-gray-400 outline-none resize-none"
                  style={{ borderRadius: 'var(--radius-sm)' }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#000')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'var(--surface)')}
                />
              </div>

              {error && <p className="text-xs text-red-600 bg-red-50 px-3 py-2" style={{ borderRadius: 'var(--radius-xs)' }}>{error}</p>}

              {!isLoggedIn && (
                <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2" style={{ borderRadius: 'var(--radius-xs)' }}>
                  You need to be logged in to submit a ticket. <a href="/auth/buyer" className="font-semibold underline">Login here</a>.
                </p>
              )}

              <button
                type="submit"
                disabled={submitting || !isLoggedIn}
                className="w-full py-3.5 text-sm font-bold text-white"
                style={{ background: 'var(--active-bg)', borderRadius: 'var(--radius-pill)', opacity: (submitting || !isLoggedIn) ? 0.6 : 1 }}
              >
                {submitting ? 'Submitting...' : 'Submit Ticket'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
