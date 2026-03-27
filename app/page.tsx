'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import LanguagePopup from './components/LanguagePopup';

const sections = [
  { id: 'karobar',      title: 'Karobar' },
  { id: 'office',       title: 'Office Supplies' },
  { id: 'raw',          title: 'Raw Materials' },
  { id: 'textile',      title: 'Textile & Fabric' },
  { id: 'construction', title: 'Construction Materials' },
];

const AD_COLORS = ['#1a1a2e', '#16213e', '#0f3460', '#533483'];

function AdBanner() {
  const [colorIdx, setColorIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setColorIdx(i => (i + 1) % AD_COLORS.length), 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      style={{
        background: AD_COLORS[colorIdx],
        borderRadius: '16px',
        height: '250px',
        margin: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background 0.8s ease',
      }}
    >
      <span style={{ fontSize: '14px', color: '#ffffff', fontWeight: 500, opacity: 0.7 }}>Ad Space</span>
    </div>
  );
}

function ProductCard() {
  return (
    <div
      className="shrink-0"
      style={{
        minWidth: '220px',
        width: '220px',
        borderRadius: '16px',
        background: '#ffffff',
        border: '1px solid #f0f0f0',
        overflow: 'hidden',
        transition: 'transform 0.2s ease',
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; }}
    >
      {/* Image area */}
      <div style={{ height: '160px', background: '#f5f5f5' }} />
      {/* Content */}
      <div style={{ padding: '12px 14px 16px' }}>
        <p style={{ fontSize: '16px', fontWeight: 600, color: '#111', lineHeight: 1.3, marginBottom: '6px' }}>Product Name</p>
        <p style={{ fontSize: '15px', fontWeight: 700, color: '#111' }}>₹0.00</p>
      </div>
    </div>
  );
}

function ProductSection({ title }: { title: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    function update() {
      if (!el) return;
      setCanScrollLeft(el.scrollLeft > 4);
      setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
    }
    update();
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    return () => { el.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, []);

  function scroll(direction: 'left' | 'right') {
    scrollRef.current?.scrollBy({ left: direction === 'right' ? 600 : -600, behavior: 'smooth' });
  }

  return (
    <div style={{ background: '#ffffff' }}>
      {/* Section header */}
      <div className="flex items-center justify-between px-6 pt-8 pb-3">
        <h2 className="text-xl font-black" style={{ color: '#111' }}>{title}</h2>
        <Link
          href="/products"
          className="text-sm font-semibold"
          style={{ color: '#2563eb' }}
        >
          See All
        </Link>
      </div>

      <div className="relative pb-8">
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            aria-label={`Scroll ${title} left`}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center"
            style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#fff', border: '1px solid #e5e5e5', color: '#333', fontSize: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
          >
            ‹
          </button>
        )}

        <div
          ref={scrollRef}
          className="no-scrollbar flex gap-4 overflow-x-auto"
          style={{ paddingLeft: '24px', paddingRight: '24px', paddingTop: '8px', paddingBottom: '16px' }}
        >
          {Array.from({ length: 10 }).map((_, i) => <ProductCard key={i} />)}
        </div>

        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            aria-label={`Scroll ${title} right`}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center"
            style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#fff', border: '1px solid #e5e5e5', color: '#333', fontSize: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
          >
            ›
          </button>
        )}
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div style={{ background: '#ffffff', minHeight: '100vh' }}>
      <LanguagePopup />
      <AdBanner />
      {sections.map((section) => (
        <ProductSection key={section.id} title={section.title} />
      ))}
    </div>
  );
}
