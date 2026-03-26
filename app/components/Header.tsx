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

export default function Header() {
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const [location, setLocation] = useState('All Locations');
  const [user, setUser] = useState<User | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const searchAreaRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchAreaRef.current && !searchAreaRef.current.contains(e.target as Node)) setShowDropdown(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setShowUserMenu(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setShowUserMenu(false);
    router.push('/');
    router.refresh();
  }

  return (
    <header
      className="sticky top-0 z-50"
      style={{
        background: 'var(--surface)',
        boxShadow: '0 4px 24px rgba(140,140,152,0.22)',
      }}
    >
      <div className="max-w-screen-xl mx-auto px-6 h-16 flex items-center gap-6">

        {/* Logo */}
        <Link
          href="/"
          className="shrink-0 text-2xl font-black tracking-tight"
          style={{ color: 'var(--text-primary)' }}
        >
          Karobarrr
        </Link>

        {/* Search bar */}
        <div className="flex-1 relative" ref={searchAreaRef}>
          <div
            className="flex items-stretch h-12 overflow-hidden"
            style={{
              background: 'var(--input-bg)',
              borderRadius: 'var(--radius-pill)',
              boxShadow: 'none',
              transition: 'box-shadow 0.24s ease',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.boxShadow = '6px 6px 16px rgba(140,140,152,0.32), -6px -6px 16px rgba(255,255,255,0.88)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.boxShadow = showDropdown
                ? '6px 6px 16px rgba(140,140,152,0.32), -6px -6px 16px rgba(255,255,255,0.88)'
                : 'none';
            }}
          >
            {/* Location select */}
            <div className="relative flex items-center shrink-0">
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="h-full pl-4 pr-7 text-sm font-medium appearance-none cursor-pointer"
                style={{
                  background: 'transparent',
                  color: 'var(--text-primary)',
                  boxShadow: 'none',
                  borderRadius: 0,
                }}
                autoComplete="off"
              >
                {locations.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
              <span className="absolute right-1 pointer-events-none text-xs select-none" style={{ color: 'var(--text-muted)' }}>▾</span>
            </div>

            {/* Divider */}
            <div className="w-px my-2.5 shrink-0" style={{ background: 'rgba(140,140,152,0.3)' }} />

            {/* Search input */}
            <input
              type="text"
              placeholder="Search products, suppliers..."
              onClick={() => setShowDropdown(true)}
              onFocus={() => setShowDropdown(true)}
              className="flex-1 px-3 text-sm"
              style={{
                background: 'transparent',
                color: 'var(--text-body)',
                boxShadow: 'none',
                borderRadius: 0,
              }}
              autoComplete="off"
            />

            {/* Search button */}
            <button
              className="shrink-0 px-6 text-sm font-semibold"
              style={{
                background: 'var(--active-bg)',
                color: '#fff',
                borderRadius: '0 var(--radius-pill) var(--radius-pill) 0',
                boxShadow: 'none',
              }}
            >
              Search
            </button>
          </div>

          {/* Trending dropdown */}
          {showDropdown && (
            <div
              className="absolute left-0 right-0 z-50 pt-4 pb-2 dropdown-enter"
              style={{
                top: 'calc(100% + 8px)',
                background: 'var(--surface)',
                boxShadow: 'var(--shadow-raised)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <p className="px-4 pb-2 text-xs font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                Trending Searches
              </p>
              {trendingSearches.map((term) => (
                <button
                  key={term}
                  className="w-full text-left px-4 py-2.5 text-sm font-medium"
                  style={{
                    background: 'transparent',
                    color: 'var(--text-body)',
                    boxShadow: 'none',
                    borderRadius: 0,
                    transition: 'var(--transition)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-body)')}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setShowDropdown(false)}
                >
                  <svg
                    width="13" height="13"
                    viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    className="inline mr-2 opacity-50"
                    style={{ color: 'var(--text-muted)', verticalAlign: 'middle' }}
                  >
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  {term}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Cart + Auth */}
        <div className="flex items-center gap-4 shrink-0">
          {/* Cart */}
          <Link
            href="/cart"
            aria-label="Cart"
            className="flex items-center justify-center"
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'var(--surface)',
              boxShadow: 'var(--shadow-raised)',
              color: 'var(--text-primary)',
              transition: 'var(--transition)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.boxShadow = 'var(--shadow-raised)';
              (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.boxShadow = 'var(--shadow-raised)';
              (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)';
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
          </Link>

          {/* Auth */}
          {user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu((v) => !v)}
                aria-label="User menu"
                className="flex items-center justify-center font-bold text-sm"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: 'var(--active-bg)',
                  color: '#fff',
                  boxShadow: 'var(--shadow-active)',
                  flexShrink: 0,
                  padding: 0,
                }}
              >
                {user.email?.[0].toUpperCase() ?? 'U'}
              </button>

              {showUserMenu && (
                <div
                  className="absolute right-0 z-50 py-2 min-w-[180px] dropdown-enter"
                  style={{
                    top: 'calc(100% + 8px)',
                    background: 'var(--surface)',
                    boxShadow: 'var(--shadow-raised)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <p className="px-4 py-2 text-xs truncate mb-1" style={{ color: 'var(--text-muted)' }}>
                    {user.email}
                  </p>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-sm font-medium"
                    style={{
                      background: 'transparent',
                      color: 'var(--text-body)',
                      boxShadow: 'none',
                      borderRadius: 0,
                      transition: 'var(--transition)',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-body)')}
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/onboarding"
              className="px-5 py-2 text-sm font-semibold"
              style={{
                background: 'var(--surface)',
                color: 'var(--text-primary)',
                boxShadow: 'var(--shadow-raised)',
                borderRadius: 'var(--radius-pill)',
                transition: 'var(--transition)',
              }}
            >
              Login / Signup
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
