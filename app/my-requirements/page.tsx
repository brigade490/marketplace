'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

interface Requirement {
  id: string;
  title: string;
  category: string | null;
  quantity_text: string | null;
  budget_display: string | null;
  is_urgent: boolean;
  is_open: boolean;
  proposal_count: number;
  created_at: string;
}

export default function MyRequirementsPage() {
  const router = useRouter();
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/buyer'); return; }

      const { data: buyer } = await supabase.from('buyers').select('id').eq('user_id', user.id).single();
      if (!buyer) { setLoading(false); return; }

      const { data } = await supabase
        .from('requirements')
        .select('id, title, category, quantity_text, budget_display, is_urgent, is_open, proposal_count, created_at')
        .eq('buyer_id', buyer.id)
        .order('created_at', { ascending: false });

      setRequirements((data as Requirement[]) || []);
      setLoading(false);
    }
    load();
  }, [router]);

  async function handleDelete(reqId: string) {
    setDeleting(reqId);
    const supabase = createClient();
    await supabase.from('requirements').delete().eq('id', reqId);
    setRequirements(prev => prev.filter(r => r.id !== reqId));
    setDeleting(null);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="text-gray-400 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4" style={{ background: 'var(--bg)' }}>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black>My Requirements</h1>
          <Link
            href="/post-requirement"
            className="px-5 py-2.5 text-sm font-bold text-white"
            style={{ background: 'var(--active-bg)', borderRadius: 'var(--radius-pill)' }}
          >
            + Post Requirement
          </Link>
        </div>

        {requirements.length === 0 ? (
          <div className="bg-white text-center py-16" style={{ borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-raised)' }}>
            <div className="text-4xl mb-3">📝</div>
            <h3 className="font-black  mb-2">No requirements posted</h3>
            <p className="text-gray-400 text-sm mb-6">Post what you're looking to buy and let sellers come to you.</p>
            <Link
              href="/post-requirement"
              className="inline-block px-6 py-3 text-sm font-bold text-white"
              style={{ background: 'var(--active-bg)', borderRadius: 'var(--radius-pill)' }}
            >
              Post Requirement
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {requirements.map(req => (
              <div key={req.id} className="bg-white" style={{ borderRadius: 'var(--radius-sm)', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: '20px' }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold>{req.title}</h3>
                      {req.is_urgent && (
                        <span className="px-2 py-0.5 text-xs font-bold text-red-700 bg-red-50" style={{ borderRadius: 'var(--radius-pill)' }}>
                          URGENT
                        </span>
                      )}
                      <span
                        className="px-2 py-0.5 text-xs font-semibold"
                        style={{
                          borderRadius: 'var(--radius-pill)',
                          background: req.is_open ? '#dcfce7' : '#fee2e2',
                          color: req.is_open ? '#166534' : '#991b1b',
                        }}
                      >
                        {req.is_open ? 'Open' : 'Closed'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      {req.category && <span>{req.category}</span>}
                      {req.quantity_text && <span>· {req.quantity_text}</span>}
                      {req.budget_display && <span>· Budget: {req.budget_display}</span>}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(req.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      · {req.proposal_count} {req.proposal_count === 1 ? 'proposal' : 'proposals'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(req.id)}
                    disabled={deleting === req.id}
                    className="text-xs font-semibold text-red-500 flex-shrink-0"
                  >
                    {deleting === req.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
