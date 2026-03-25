'use client';

import { useRef } from 'react';

const sections = [
  { id: 'karobar', title: 'Karobar' },
  { id: 'office', title: 'Office Supplies' },
  { id: 'raw', title: 'Raw Materials' },
  { id: 'textile', title: 'Textile & Fabric' },
  { id: 'construction', title: 'Construction Materials' },
];

function ProductCard() {
  return (
    <div
      className="shrink-0 bg-white relative"
      style={{
        minWidth: '280px',
        width: '280px',
        minHeight: '380px',
        height: '380px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      }}
    >
      {/* Top 60% — image placeholder */}
      <div
        className="relative bg-white"
        style={{ height: '260px', borderRadius: '12px 12px 0 0' }}
      >
        {/* Verified badge — absolute top right of image area */}
        <div
          className="absolute top-2 right-2 flex items-center gap-1 bg-white px-2 py-0.5"
          style={{ borderRadius: '20px' }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
          <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 500 }}>
            Verified
          </span>
        </div>
      </div>

      {/* Bottom 40% — product info */}
      <div className="px-3 pt-3" style={{ height: '120px' }}>
        <p style={{ fontSize: '13px', fontWeight: 400, color: '#111827', lineHeight: 1.4, marginBottom: '6px' }}>
          Product Name
        </p>
        <p style={{ fontSize: '18px', fontWeight: 400, color: '#111827' }}>
          $0.00
        </p>
      </div>
    </div>
  );
}

function ProductSection({ title }: { title: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scroll(direction: 'left' | 'right') {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === 'right' ? 700 : -700,
        behavior: 'smooth',
      });
    }
  }

  return (
    <div className="bg-[#f8f9fa]">
      {/* Section heading */}
      <div className="px-14 pt-8 pb-3">
        <h2 className="text-xl font-black text-black">{title}</h2>
      </div>

      {/* Scroll area with absolute arrow buttons on left/right edges */}
      <div className="relative pb-8">
        {/* Left arrow */}
        <button
          onClick={() => scroll('left')}
          aria-label={`Scroll ${title} left`}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center bg-white hover:bg-gray-50 transition-colors"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: '1px solid #dee2e6',
            fontSize: '22px',
            color: '#111',
          }}
        >
          ‹
        </button>

        {/* Horizontally scrollable cards row */}
        <div
          ref={scrollRef}
          className="no-scrollbar flex gap-4 overflow-x-auto"
          style={{ paddingLeft: '56px', paddingRight: '56px' }}
        >
          {Array.from({ length: 10 }).map((_, i) => (
            <ProductCard key={i} />
          ))}
        </div>

        {/* Right arrow */}
        <button
          onClick={() => scroll('right')}
          aria-label={`Scroll ${title} right`}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center bg-white hover:bg-gray-50 transition-colors"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: '1px solid #dee2e6',
            fontSize: '22px',
            color: '#111',
          }}
        >
          ›
        </button>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="bg-[#f8f9fa]">
      {sections.map((section) => (
        <ProductSection key={section.id} title={section.title} />
      ))}
    </div>
  );
}
