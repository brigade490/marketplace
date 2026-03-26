'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

interface Profile {
  id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  role: string;
  is_verified: boolean;
  city: string | null;
  state: string | null;
  pincode: string | null;
  business_name: string | null;
  gst_number: string | null;
}

interface SellerInfo {
  company_name: string | null;
  business_type: string | null;
  tier: string;
  is_verified: boolean;
  avg_rating: number;
  total_orders: number;
}

interface BuyerInfo {
  company_name: string | null;
  total_orders: number;
  total_spent: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [sellerInfo, setSellerInfo] = useState<SellerInfo | null>(null);
  const [buyerInfo, setBuyerInfo] = useState<BuyerInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/buyer'); return; }

      const { data: p } = await supabase.from('users').select('*').eq('id', user.id).single();
      setProfile(p);

      if (p?.role === 'seller' || p?.role === 'seller+buyer') {
        const { data: s } = await supabase.from('sellers').select('company_name, business_type, tier, is_verified, avg_rating, total_orders').eq('user_id', user.id).single();
        setSellerInfo(s);
      }
      if (p?.role === 'buyer' || p?.role === 'seller+buyer') {
        const { data: b } = await supabase.from('buyers').select('company_name, total_orders, total_spent').eq('user_id', user.id).single();
        setBuyerInfo(b);
      }
      setLoading(false);
    }
    load();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f7f7f8' }}>
        <div className="text-gray-400 text-sm">Loading profile...</div>
      </div>
    );
  }

  if (!profile) return null;

  const isSeller = profile.role === 'seller' || profile.role === 'seller+buyer';
  const tierEmoji = sellerInfo?.tier === 'Gold' ? '🥇' : sellerInfo?.tier === 'Silver' ? '🥈' : '🥉';

  return (
    <div className="min-h-screen py-10 px-4" style={{ background: '#f7f7f8' }}>
      <div className="max-w-2xl mx-auto">

        {/* Header card */}
        <div className="bg-white mb-4" style={{ borderRadius: '16px', padding: '32px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-5">
              {/* Avatar */}
              <div
                className="flex items-center justify-center font-black text-2xl"
                style={{
                  width: '80px', height: '80px', borderRadius: '50%',
                  background: '#000000', color: '#ffffff', flexShrink: 0, overflow: 'hidden',
                }}
              >
                {profile.avatar_url
                  ? <img src={profile.avatar_url} alt="avatar" style={{ width: '80px', height: '80px', objectFit: 'cover' }} />
                  : (profile.full_name?.[0]?.toUpperCase() ?? profile.email[0].toUpperCase())
                }
              </div>
              <div>
                <h1 className="text-2xl font-black text-black">
                  {profile.full_name || 'Your Name'}
                </h1>
                {(sellerInfo?.company_name || buyerInfo?.company_name || profile.business_name) && (
                  <p className="text-gray-600 text-sm mt-0.5">
                    {sellerInfo?.company_name || buyerInfo?.company_name || profile.business_name}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className="px-2.5 py-0.5 text-xs font-semibold"
                    style={{
                      borderRadius: '999px',
                      background: isSeller ? '#000000' : '#f3f4f6',
                      color: isSeller ? '#fbbf24' : '#6b7280',
                    }}
                  >
                    {profile.role === 'seller+buyer' ? 'Seller & Buyer' : profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                  </span>
                  {(profile.is_verified || sellerInfo?.is_verified) && (
                    <span className="px-2.5 py-0.5 text-xs font-semibold text-green-700 bg-green-50" style={{ borderRadius: '999px' }}>
                      ✓ GST Verified
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Link
              href="/edit-profile"
              className="px-4 py-2 text-sm font-semibold transition-colors"
              style={{ background: '#000000', color: '#ffffff', borderRadius: '999px' }}
            >
              Edit Profile
            </Link>
          </div>

          {/* Stats for sellers */}
          {isSeller && sellerInfo && (
            <div className="grid grid-cols-3 gap-4 mb-6 pt-4" style={{ borderTop: '1px solid #f3f4f6' }}>
              <div className="text-center">
                <div className="text-xl font-black text-black">{tierEmoji} {sellerInfo.tier}</div>
                <div className="text-xs text-gray-500 mt-0.5">Seller Tier</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-black text-black">{sellerInfo.avg_rating?.toFixed(1) || '—'}</div>
                <div className="text-xs text-gray-500 mt-0.5">Avg Rating</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-black text-black">{sellerInfo.total_orders}</div>
                <div className="text-xs text-gray-500 mt-0.5">Total Orders</div>
              </div>
            </div>
          )}
        </div>

        {/* Details card */}
        <div className="bg-white" style={{ borderRadius: '16px', padding: '28px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
          <h2 className="text-base font-black text-black mb-5">Contact & Details</h2>
          <div className="space-y-4">
            <InfoRow icon="📧" label="Email" value={profile.email} />
            <InfoRow icon="📱" label="Mobile" value={profile.phone || 'Not added'} />
            {sellerInfo?.business_type && (
              <InfoRow icon="🏢" label="Business Type" value={sellerInfo.business_type.charAt(0).toUpperCase() + sellerInfo.business_type.slice(1)} />
            )}
            {profile.gst_number && (
              <InfoRow icon="📄" label="GST Number" value={profile.gst_number} />
            )}
            {(profile.city || profile.state) && (
              <InfoRow
                icon="📍"
                label="Location"
                value={[profile.city, profile.state, profile.pincode].filter(Boolean).join(', ')}
              />
            )}
          </div>

          <div className="mt-6 pt-5" style={{ borderTop: '1px solid #f3f4f6' }}>
            <div className="flex gap-3 flex-wrap">
              <Link href="/verification" className="text-sm font-semibold text-black underline">
                Verification Status →
              </Link>
              <Link href="/addresses" className="text-sm font-semibold text-black underline">
                Manage Addresses →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-lg w-6 flex-shrink-0 mt-0.5">{icon}</span>
      <div>
        <div className="text-xs text-gray-500">{label}</div>
        <div className="text-sm font-semibold text-black">{value}</div>
      </div>
    </div>
  );
}
