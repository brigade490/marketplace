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

const locations = ['All Locations', 'India', 'China', 'USA', 'Germany', 'Brazil', 'UAE'];

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
    router.push('/');
    router.refresh();
  }

  return (
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

            {/* Search button — inside bar, right side */}
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

        {/* Right: Cart icon + Auth */}
        <div className="flex items-center gap-4 shrink-0">
          {/* Cart */}
          <Link href="/cart" aria-label="Cart" className="text-white hover:text-gray-300 transition-colors">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
          </Link>

          {/* Auth: profile icon when logged in, login button when not */}
          {user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu((v) => !v)}
                aria-label="User menu"
                className="flex items-center justify-center text-black font-bold text-sm transition-colors"
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: '#ffffff',
                  color: '#000000',
                  flexShrink: 0,
                }}
              >
                {user.email?.[0].toUpperCase() ?? 'U'}
              </button>

              {showUserMenu && (
                <div
                  className="absolute right-0 bg-white z-50 py-2 min-w-[180px]"
                  style={{ top: 'calc(100% + 8px)', borderRadius: '10px', boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}
                >
                  <p className="px-4 py-2 text-xs text-gray-500 truncate border-b border-gray-100 mb-1">
                    {user.email}
                  </p>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-sm"
                    style={{ background: '#ffffff', color: '#111827' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f7f7f8')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '#ffffff')}
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/auth/buyer"
              className="px-5 py-2 text-sm font-semibold text-white transition-colors"
              style={{ background: '#000000', borderRadius: '999px', border: '1.5px solid #ffffff33' }}
            >
              Login / Signup
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
