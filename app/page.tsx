'use client';

import { useRef } from 'react';
import LanguagePopup from './components/LanguagePopup';

const sections = [
  { id: 'karobar',      title: 'Karobar' },
  { id: 'office',       title: 'Office Supplies' },
  { id: 'raw',          title: 'Raw Materials' },
  { id: 'textile',      title: 'Textile & Fabric' },
  { id: 'construction', title: 'Construction Materials' },
];

function AdBanner() {
  return (
    <div
      style={{
        background: 'var(--surface)',
        boxShadow: 'var(--shadow-raised)',
        borderRadius: 'var(--radius-md)',
        height: '300px',
        margin: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <span style={{ fontSize: '14px', color: 'var(--text-inactive)', fontWeight: 500 }}>Ad Space</span>
    </div>
  );
}

function ProductCard() {
  return (
    <div
      className="shrink-0 card-lift"
      style={{
        minWidth: '360px',
        width: '360px',
        minHeight: '500px',
        height: '500px',
        borderRadius: '24px',
        background: '#f2f2f5',
        boxShadow: '8px 8px 20px rgba(140,140,152,0.42), -8px -8px 20px rgba(255,255,255,1)',
      }}
    >
      {/* Inner overflow clip so corners are rounded without killing the outer shadow */}
      <div style={{ borderRadius: '24px', overflow: 'hidden', height: '100%' }}>
      <div className="relative" style={{ height: '360px', borderRadius: '24px 24px 0 0', overflow: 'hidden', background: '#e4e4e8' }}>
        <div
          className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5"
          style={{ borderRadius: 'var(--radius-pill)', background: 'var(--surface)', boxShadow: 'var(--shadow-raised)' }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
          <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 500 }}>Verified</span>
        </div>
      </div>
      <div className="px-4 pt-4" style={{ height: '140px' }}>
        <p style={{ fontSize: '13px', fontWeight: 400, color: 'var(--text-primary)', lineHeight: 1.4, marginBottom: '6px' }}>Product Name</p>
        <p style={{ fontSize: '18px', fontWeight: 400, color: 'var(--text-primary)' }}>₹0.00</p>
      </div>
      </div>{/* end inner clip wrapper */}
    </div>
  );
}

function ProductSection({ title }: { title: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scroll(direction: 'left' | 'right') {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: direction === 'right' ? 700 : -700, behavior: 'smooth' });
    }
  }

  return (
    <div style={{ background: 'var(--bg)' }}>
      <div className="px-14 pt-8 pb-3">
        <h2 className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>{title}</h2>
      </div>
      <div className="relative pb-8">
        <button
          onClick={() => scroll('left')}
          aria-label={`Scroll ${title} left`}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center"
          style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--surface)', boxShadow: 'var(--shadow-raised)', color: 'var(--text-primary)', fontSize: '22px' }}
        >
          ‹
        </button>

        <div ref={scrollRef} className="no-scrollbar flex gap-4 overflow-x-auto" style={{ paddingLeft: '56px', paddingRight: '56px', paddingTop: '24px', paddingBottom: '24px' }}>
          {Array.from({ length: 10 }).map((_, i) => <ProductCard key={i} />)}
        </div>

        <button
          onClick={() => scroll('right')}
          aria-label={`Scroll ${title} right`}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center"
          style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--surface)', boxShadow: 'var(--shadow-raised)', color: 'var(--text-primary)', fontSize: '22px' }}
        >
          ›
        </button>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div style={{ background: 'var(--bg)' }}>
      <LanguagePopup />
      <AdBanner />
      {sections.map((section) => (
        <ProductSection key={section.id} title={section.title} />
      ))}
    </div>
  );
}
