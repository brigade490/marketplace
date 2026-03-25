'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

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
  const [showDropdown, setShowDropdown] = useState(false);
  const [location, setLocation] = useState('All Locations');
  const searchAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchAreaRef.current && !searchAreaRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-black">
      <div className="max-w-screen-xl mx-auto px-6 h-16 flex items-center gap-6">

        {/* Left: Logo */}
        <Link href="/" className="shrink-0 text-2xl font-black text-white tracking-tight">
          Karobarrr
        </Link>

        {/* Center: Location selector + Search bar */}
        <div className="relative" style={{ width: '60%' }} ref={searchAreaRef}>
          <div className="flex items-stretch bg-white h-11 overflow-hidden" style={{ borderRadius: '25px' }}>

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
            <button className="px-6 text-sm font-semibold text-black bg-white hover:bg-gray-100 transition-colors shrink-0">
              Search
            </button>
          </div>

          {/* Trending Searches Dropdown */}
          {showDropdown && (
            <div className="absolute top-full left-0 right-0 bg-white z-50 pt-4 pb-2">
              <p className="px-4 pb-2 text-xs font-black text-black uppercase tracking-widest">
                Trending Searches
              </p>
              {trendingSearches.map((term) => (
                <button
                  key={term}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-[#f8f9fa] transition-colors"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setShowDropdown(false)}
                >
                  {term}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Cart icon + Login/Signup */}
        <div className="flex items-center gap-4 shrink-0">
          <button aria-label="Cart" className="text-white hover:text-gray-300 transition-colors">
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
          </button>

          <Link
            href="/auth/buyer"
            className="px-5 py-2 text-sm font-semibold text-black bg-white hover:bg-gray-100 transition-colors rounded-full"
          >
            Login / Signup
          </Link>
        </div>
      </div>
    </header>
  );
}
