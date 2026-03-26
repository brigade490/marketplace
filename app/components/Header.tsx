'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

const trendingSearches = [
  'Steel Rods',
  'Cotton Fabric',
  'Rice Bulk',
  'Industrial Bearings',
  'Packaging Materials',
  'Office Furniture',
];

const locations = ['All Locations', 'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata', 'Ahmedabad', 'Surat', 'Jaipur', 'Lucknow'];

interface UserProfile {
  full_name: string | null;
  avatar_url: string | null;
  role: string;
}

interface DropdownItemProps {
  href: string;
  icon: string;
  label: string;
  onClick?: () => void;
}

function DropdownItem({ href, icon, label, onClick }: DropdownItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
      style={{ color: '#111827', textDecoration: 'none' }}
      onMouseEnter={(e) => (e.currentTarget.style.background = '#f7f7f8')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      <span className="text-base w-5 text-center">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

export default function Header() {
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const [location, setLocation] = useState('All Locations');
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const searchAreaRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();

    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      if (data.user) {
        const { data: profile } = await supabase
          .from('users')
          .select('full_name, avatar_url, role')
          .eq('id', data.user.id)
          .single();
        setUserProfile(profile);
      }
    }

    loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const { data: profile } = await supabase
          .from('users')
          .select('full_name, avatar_url, role')
          .eq('id', session.user.id)
          .single();
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchAreaRef.current && !searchAreaRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setShowUserMenu(false);
    setShowLogoutModal(false);
    setUser(null);
    setUserProfile(null);
    router.push('/');
    router.refresh();
  }

  const role = userProfile?.role ?? null;
  const isSeller = role === 'seller' || role === 'seller+buyer';
  const isBuyer = role === 'buyer' || role === 'seller+buyer';
  const showStartSelling = !user || (!isSeller);

  const avatarInitial = userProfile?.full_name
    ? userProfile.full_name[0].toUpperCase()
    : (user?.email?.[0].toUpperCase() ?? 'U');

  function handleStartSelling() {
    if (!user) {
      router.push('/auth/seller');
    } else {
      router.push('/become-seller');
    }
  }

  return (
    <>
      <header className="sticky top-0 z-50 bg-black">
        <div className="max-w-screen-xl mx-auto px-6 h-16 flex items-center gap-6">

          {/* Left: Logo */}
          <Link href="/" className="shrink-0 text-2xl font-black text-white tracking-tight">
            Karobarrr
          </Link>

          {/* Center: Location selector + Search bar */}
          <div className="flex-1 relative" ref={searchAreaRef}>
            <div className="flex items-stretch bg-white h-11 overflow-hidden" style={{ borderRadius: '8px' }}>

              {/* Location selector */}
              <div className="relative flex items-center shrink-0">
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="h-full pl-3 pr-7 text-sm font-medium text-black bg-transparent outline-none appearance-none cursor-pointer"
                >
                  {locations.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
                <span className="absolute right-1 pointer-events-none text-gray-500 text-xs select-none">▾</span>
              </div>

              {/* Divider */}
              <div className="w-px bg-gray-200 my-2 shrink-0" />

              {/* Search input */}
              <input
                type="text"
                placeholder="Search products, suppliers..."
                onClick={() => setShowDropdown(true)}
                onFocus={() => setShowDropdown(true)}
                className="flex-1 px-3 text-sm text-black bg-transparent outline-none placeholder-gray-400"
              />

              {/* Search button */}
              <button
                className="shrink-0 px-6 text-sm font-semibold text-white transition-colors"
                style={{ background: '#000000', color: '#ffffff', borderRadius: '0 8px 8px 0' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#222222')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#000000')}
              >
                Search
              </button>
            </div>

            {/* Trending Searches Dropdown */}
            {showDropdown && (
              <div
                className="absolute left-0 right-0 bg-white z-50 pt-4 pb-2"
                style={{ top: 'calc(100% + 4px)', borderRadius: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}
              >
                <p className="px-4 pb-2 text-xs font-black text-black uppercase tracking-widest">
                  Trending Searches
                </p>
                {trendingSearches.map((term) => (
                  <button
                    key={term}
                    className="w-full text-left px-4 py-2.5 text-sm transition-colors"
                    style={{ background: '#ffffff', color: '#111827', borderRadius: '0' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f7f7f8')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '#ffffff')}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setShowDropdown(false)}
                  >
                    {term}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Start Selling + Cart + Auth */}
          <div className="flex items-center gap-4 shrink-0">

            {/* Start Selling button */}
            {showStartSelling && (
              <button
                onClick={handleStartSelling}
                className="px-4 py-2 text-sm font-semibold transition-colors"
                style={{ background: '#fbbf24', color: '#000000', borderRadius: '999px' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#f59e0b')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#fbbf24')}
              >
                Start Selling
              </button>
            )}

            {/* Cart */}
            <Link href="/cart" aria-label="Cart" className="text-white hover:text-gray-300 transition-colors">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
            </Link>

            {/* Auth: dropdown when logged in, login button when not */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu((v) => !v)}
                  aria-label="User menu"
                  className="flex items-center justify-center font-bold text-sm transition-colors"
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: '#ffffff',
                    color: '#000000',
                    flexShrink: 0,
                    overflow: 'hidden',
                  }}
                >
                  {userProfile?.avatar_url ? (
                    <img src={userProfile.avatar_url} alt="avatar" style={{ width: '36px', height: '36px', objectFit: 'cover' }} />
                  ) : (
                    avatarInitial
                  )}
                </button>

                {showUserMenu && (
                  <div
                    className="absolute right-0 bg-white z-50 py-2"
                    style={{ top: 'calc(100% + 8px)', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)', minWidth: '220px', maxHeight: '80vh', overflowY: 'auto' }}
                  >
                    {/* User info header */}
                    <div className="px-4 py-3 border-b border-gray-100 mb-1">
                      <p className="text-sm font-semibold text-black truncate">
                        {userProfile?.full_name || 'My Account'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      {role && (
                        <span
                          className="inline-block mt-1 px-2 py-0.5 text-xs font-semibold"
                          style={{
                            borderRadius: '999px',
                            background: isSeller ? '#000000' : '#f3f4f6',
                            color: isSeller ? '#fbbf24' : '#6b7280',
                          }}
                        >
                          {role === 'seller+buyer' ? 'Seller & Buyer' : role.charAt(0).toUpperCase() + role.slice(1)}
                        </span>
                      )}
                    </div>

                    {/* My Profile & Edit Profile — always visible */}
                    <DropdownItem href="/profile" icon="👤" label="My Profile" onClick={() => setShowUserMenu(false)} />
                    <DropdownItem href="/edit-profile" icon="✏️" label="Edit Profile" onClick={() => setShowUserMenu(false)} />

                    <div className="my-1 border-t border-gray-100" />

                    {/* Buyer-specific */}
                    {(isBuyer || !isSeller) && (
                      <>
                        <DropdownItem href="/my-orders" icon="📦" label="My Orders" onClick={() => setShowUserMenu(false)} />
                      </>
                    )}

                    {/* Seller-specific */}
                    {isSeller && (
                      <>
                        <DropdownItem href="/my-products" icon="🏪" label="My Products" onClick={() => setShowUserMenu(false)} />
                        <DropdownItem href="/add-product" icon="➕" label="Add Product" onClick={() => setShowUserMenu(false)} />
                        <DropdownItem href="/orders-received" icon="📋" label="Orders Received" onClick={() => setShowUserMenu(false)} />
                      </>
                    )}

                    <div className="my-1 border-t border-gray-100" />

                    {/* Common items */}
                    <DropdownItem href="/my-requirements" icon="📝" label="My Requirements" onClick={() => setShowUserMenu(false)} />
                    <DropdownItem href="/post-requirement" icon="📤" label="Post Requirement" onClick={() => setShowUserMenu(false)} />
                    <DropdownItem href="/wishlist" icon="❤️" label="Saved / Wishlist" onClick={() => setShowUserMenu(false)} />
                    <DropdownItem href="/messages" icon="💬" label="Messages" onClick={() => setShowUserMenu(false)} />
                    <DropdownItem href="/notifications" icon="🔔" label="Notifications" onClick={() => setShowUserMenu(false)} />

                    <div className="my-1 border-t border-gray-100" />

                    <DropdownItem href="/addresses" icon="📍" label="Addresses" onClick={() => setShowUserMenu(false)} />
                    <DropdownItem href="/payments" icon="💳" label="Payments & Billing" onClick={() => setShowUserMenu(false)} />
                    <DropdownItem href="/invoices" icon="🧾" label="Invoices" onClick={() => setShowUserMenu(false)} />
                    <DropdownItem href="/verification" icon="✅" label="Verification Status" onClick={() => setShowUserMenu(false)} />

                    <div className="my-1 border-t border-gray-100" />

                    <DropdownItem href="/settings" icon="⚙️" label="Settings" onClick={() => setShowUserMenu(false)} />
                    <DropdownItem href="/help" icon="❓" label="Help & Support" onClick={() => setShowUserMenu(false)} />

                    <div className="my-1 border-t border-gray-100" />

                    {/* Logout */}
                    <button
                      onClick={() => { setShowUserMenu(false); setShowLogoutModal(true); }}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm transition-colors"
                      style={{ color: '#dc2626', background: 'transparent' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#fef2f2')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <span className="text-base w-5 text-center">🚪</span>
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth/buyer"
                className="px-5 py-2 text-sm font-semibold transition-colors"
                style={{ background: '#ffffff', color: '#000000', borderRadius: '999px' }}
              >
                Login / Signup
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowLogoutModal(false); }}
        >
          <div
            className="bg-white p-8 text-center"
            style={{ borderRadius: '16px', maxWidth: '380px', width: '100%', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}
          >
            <div className="text-4xl mb-4">👋</div>
            <h3 className="text-xl font-black text-black mb-2">Logging out?</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to logout from your Karobarrr account?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-3 text-sm font-semibold transition-colors"
                style={{ border: '1.5px solid #e5e7eb', borderRadius: '999px', background: '#ffffff', color: '#111827' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#f7f7f8')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#ffffff')}
              >
                Cancel
              </button>
              <button
                onClick={handleSignOut}
                className="flex-1 py-3 text-sm font-semibold text-white transition-colors"
                style={{ background: '#dc2626', borderRadius: '999px', border: 'none' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#b91c1c')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#dc2626')}
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
