'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

const trendingSearches = ['Steel Rods', 'Cotton Fabric', 'Rice Bulk', 'Industrial Bearings', 'Packaging Materials', 'Office Furniture'];
const locations = ['All Locations', 'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata', 'Ahmedabad', 'Surat', 'Jaipur', 'Lucknow'];

interface SearchResult {
  id: string;
  name: string;
  category: string | null;
  price: number | null;
}

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [showDropdown, setShowDropdown] = useState(false);
  const [location, setLocation] = useState('All Locations');
  const [user, setUser] = useState<User | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [userRole, setUserRole] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const searchAreaRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) { setAvatarUrl(null); setUserRole(''); setLocation('All Locations'); return; }
    const supabase = createClient();
    supabase.from('users').select('avatar_url, role, city').eq('id', user.id).single().then(({ data }) => {
      if (data) {
        setAvatarUrl(data.avatar_url ?? null);
        setUserRole(data.role ?? '');
        if (data.city) setLocation(data.city);
      }
    });
  }, [user]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchAreaRef.current && !searchAreaRef.current.contains(e.target as Node)) setShowDropdown(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setShowUserMenu(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSearchInput(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value;
    setSearchQuery(q);
    setShowDropdown(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q.trim()) { setSearchResults([]); setSearching(false); return; }
    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('products')
        .select('id, name, category, price')
        .or(`name.ilike.%${q}%,description.ilike.%${q}%`)
        .eq('is_active', true)
        .limit(6);
      setSearchResults((data as SearchResult[]) ?? []);
      setSearching(false);
    }, 300);
  }

  function handleSearchSubmit() {
    if (!searchQuery.trim()) return;
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    setShowDropdown(false);
    setSearchQuery('');
    setSearchResults([]);
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setShowUserMenu(false);
    router.push('/');
    router.refresh();
  }

  const isSeller = userRole === 'seller' || userRole === 'seller+buyer';
  const isBuyerOnly = userRole === 'buyer';

  // Hide header entirely on onboarding and auth pages
  if (pathname === '/onboarding' || pathname?.startsWith('/onboarding')) return null;

  const menuItems = [
    { label: 'My Account', href: '/profile' },
    { label: 'Settings', href: '/settings' },
    ...(isSeller ? [{ label: 'Dashboard', href: '/seller/dashboard' }] : []),
  ];

  return (
    <header className="sticky top-0 z-50" style={{ background: 'var(--surface)', boxShadow: '0 4px 24px rgba(140,140,152,0.22)' }}>
      <div className="max-w-screen-xl mx-auto px-6 h-16 flex items-center gap-6">

        {/* Logo */}
        <Link href="/" className="shrink-0 text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
          Karobarrr
        </Link>

        {/* Search */}
        <div className="flex-1 relative" ref={searchAreaRef}>
          <div
            className="flex items-stretch h-12 overflow-hidden"
            style={{ background: '#d8d8dc', borderRadius: 'var(--radius-pill)', boxShadow: 'none', transition: 'box-shadow 0.24s ease' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = '6px 6px 16px rgba(140,140,152,0.32), -6px -6px 16px rgba(255,255,255,0.88)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = showDropdown ? '6px 6px 16px rgba(140,140,152,0.32), -6px -6px 16px rgba(255,255,255,0.88)' : 'none'; }}
          >
            <div className="relative flex items-center shrink-0">
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="h-full pl-4 pr-7 text-sm font-medium appearance-none cursor-pointer"
                style={{ background: '#d8d8dc', color: '#4a4a52', WebkitTextFillColor: '#4a4a52', boxShadow: 'none', borderRadius: 0 }}
                autoComplete="off"
              >
                {locations.map((loc) => <option key={loc} value={loc}>{loc}</option>)}
              </select>
              <span className="absolute right-1 pointer-events-none text-xs select-none" style={{ color: 'var(--text-muted)' }}>▾</span>
            </div>

            <div className="w-px my-2.5 shrink-0" style={{ background: 'rgba(140,140,152,0.3)' }} />

            <input
              type="text"
              placeholder="Search products, suppliers..."
              value={searchQuery}
              onChange={handleSearchInput}
              onClick={() => setShowDropdown(true)}
              onFocus={() => setShowDropdown(true)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
              className="flex-1 px-3 text-sm"
              style={{ background: '#d8d8dc', color: '#4a4a52', WebkitTextFillColor: '#4a4a52', boxShadow: 'none', borderRadius: 0 }}
              autoComplete="off"
            />

            <button
              onClick={handleSearchSubmit}
              className="shrink-0 px-6 text-sm font-semibold"
              style={{ background: 'var(--active-bg)', color: '#fff', borderRadius: '0 var(--radius-pill) var(--radius-pill) 0', boxShadow: 'none' }}
            >
              Search
            </button>
          </div>

          {/* Search dropdown */}
          {showDropdown && (
            <div
              className="absolute left-0 right-0 z-50 pt-3 pb-2 dropdown-enter"
              style={{ top: 'calc(100% + 8px)', background: 'var(--surface)', boxShadow: 'var(--shadow-raised)', borderRadius: 'var(--radius-md)' }}
            >
              {searchQuery.trim() ? (
                <>
                  <p className="px-4 pb-2 text-xs font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                    {searching ? 'Searching...' : searchResults.length === 0 ? 'No results found' : 'Products'}
                  </p>
                  {searchResults.map((r) => (
                    <button
                      key={r.id}
                      className="w-full text-left px-4 py-2.5 flex items-center gap-3"
                      style={{ background: 'transparent', boxShadow: 'none', borderRadius: 0, transition: 'background 0.15s' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => { router.push(`/products/${r.id}`); setShowDropdown(false); setSearchQuery(''); setSearchResults([]); }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0" style={{ color: 'var(--text-muted)' }}>
                        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                      </svg>
                      <span className="flex-1 text-sm font-medium truncate" style={{ color: 'var(--text-body)' }}>{r.name}</span>
                      {r.category && <span className="text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>{r.category}</span>}
                      {r.price != null && <span className="text-sm font-semibold shrink-0 ml-2" style={{ color: 'var(--text-primary)' }}>₹{r.price.toLocaleString('en-IN')}</span>}
                    </button>
                  ))}
                </>
              ) : (
                <>
                  <p className="px-4 pb-2 text-xs font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                    Trending Searches
                  </p>
                  {trendingSearches.map((term) => (
                    <button
                      key={term}
                      className="w-full text-left px-4 py-2.5 text-sm font-medium flex items-center gap-2"
                      style={{ background: 'transparent', color: 'var(--text-body)', boxShadow: 'none', borderRadius: 0, transition: 'background 0.15s' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setSearchQuery(term);
                        setSearching(true);
                        if (debounceRef.current) clearTimeout(debounceRef.current);
                        debounceRef.current = setTimeout(async () => {
                          const supabase = createClient();
                          const { data } = await supabase.from('products').select('id, name, category, price').or(`name.ilike.%${term}%,description.ilike.%${term}%`).eq('is_active', true).limit(6);
                          setSearchResults((data as SearchResult[]) ?? []);
                          setSearching(false);
                        }, 100);
                      }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
                        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                      </svg>
                      {term}
                    </button>
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        {/* Right: Start Selling + Cart + Auth */}
        <div className="flex items-center gap-4 shrink-0">
          {isBuyerOnly && (
            <Link
              href="/become-seller"
              className="px-4 py-2 text-sm font-semibold shrink-0"
              style={{ background: 'var(--active-bg)', color: '#fff', borderRadius: 'var(--radius-pill)', boxShadow: 'var(--shadow-active)', whiteSpace: 'nowrap' }}
            >
              Start Selling
            </Link>
          )}
          <Link
            href="/cart"
            aria-label="Cart"
            className="flex items-center justify-center"
            style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--surface)', boxShadow: 'none', color: 'var(--text-primary)', transition: 'transform 0.18s ease' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-1px)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)'; }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
          </Link>

          {user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu((v) => !v)}
                aria-label="User menu"
                className="flex items-center gap-2"
                style={{ background: 'transparent', boxShadow: 'none', padding: 0 }}
              >
                <div
                  className="flex items-center justify-center font-bold text-sm overflow-hidden shrink-0"
                  style={{ width: 38, height: 38, borderRadius: '50%', background: avatarUrl ? 'transparent' : 'var(--active-bg)', color: '#fff', boxShadow: 'var(--shadow-active)' }}
                >
                  {avatarUrl
                    ? <img src={avatarUrl} alt="avatar" style={{ width: 38, height: 38, objectFit: 'cover', borderRadius: '50%' }} />
                    : (user.email?.[0].toUpperCase() ?? 'U')
                  }
                </div>
                {location && location !== 'All Locations' && (
                  <span className="text-xs font-medium hidden sm:block" style={{ color: 'var(--text-inactive)', maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {location}
                  </span>
                )}
              </button>

              {showUserMenu && (
                <div
                  className="absolute right-0 z-50 py-2 min-w-[190px] dropdown-enter"
                  style={{ top: 'calc(100% + 8px)', background: 'var(--surface)', boxShadow: 'var(--shadow-raised)', borderRadius: 'var(--radius-md)' }}
                >
                  <p className="px-4 py-2 text-xs truncate" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
                  <div style={{ height: 1, background: 'var(--input-bg)', margin: '4px 12px' }} />
                  {menuItems.map(({ label, href }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setShowUserMenu(false)}
                      className="block px-4 py-2.5 text-sm font-medium"
                      style={{ color: 'var(--text-body)', background: 'transparent', transition: 'background 0.15s' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      {label}
                    </Link>
                  ))}
                  <div style={{ height: 1, background: 'var(--input-bg)', margin: '4px 12px' }} />
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2.5 text-sm font-medium"
                    style={{ background: 'transparent', color: '#c0392b', boxShadow: 'none', borderRadius: 0, transition: 'background 0.15s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#fff5f5')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/onboarding"
              className="px-5 py-2 text-sm font-semibold"
              style={{ background: 'var(--surface)', color: 'var(--text-primary)', boxShadow: 'none', borderRadius: 'var(--radius-pill)', border: '1px solid #e0e0e0', transition: 'var(--transition)' }}
            >
              Login / Signup
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
