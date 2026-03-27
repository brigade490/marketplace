'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import LanguagePopup from './components/LanguagePopup';

const sections = [
  { id: 'karobar',       title: 'Karobar',               slug: 'karobar' },
  { id: 'office',        title: 'Office Supplies',        slug: 'office-supplies' },
  { id: 'raw',           title: 'Raw Materials',          slug: 'raw-materials' },
  { id: 'textile',       title: 'Textile & Fabric',       slug: 'textile-fabric' },
  { id: 'construction',  title: 'Construction Materials', slug: 'construction-materials' },
];

const SLIDES = [
  { bg: '#1a1a2e', label: 'Ad Space' },
  { bg: '#0f3460', label: 'Ad Space' },
  { bg: '#533483', label: 'Ad Space' },
];

function AdBanner() {
  const [current, setCurrent] = useState(0);

  // Auto-advance every 3 seconds
  useEffect(() => {
    const t = setInterval(() => setCurrent(i => (i + 1) % SLIDES.length), 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ margin: '24px', borderRadius: '16px', overflow: 'hidden', height: '250px', position: 'relative' }}>
      {/* Slides track */}
      <div
        style={{
          display: 'flex',
          width: `${SLIDES.length * 100}%`,
          height: '100%',
          transform: `translateX(-${(current * 100) / SLIDES.length}%)`,
          transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {SLIDES.map((slide, i) => (
          <div
            key={i}
            style={{
              width: `${100 / SLIDES.length}%`,
              flexShrink: 0,
              background: slide.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.65)', fontWeight: 500 }}>{slide.label}</span>
          </div>
        ))}
      </div>

      {/* Dots */}
      <div style={{ position: 'absolute', bottom: '14px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px' }}>
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            style={{
              width: i === current ? '20px' : '8px',
              height: '8px',
              borderRadius: '999px',
              background: i === current ? '#fff' : 'rgba(255,255,255,0.4)',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
          />
        ))}
      </div>
    </div>
  );
}

function ProductCard() {
  return (
    <div
      className="shrink-0"
      style={{
        minWidth: '300px',
        width: '300px',
        minHeight: '400px',
        borderRadius: '16px',
        background: '#ffffff',
        border: '1px solid #f0f0f0',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        overflow: 'hidden',
        transition: 'transform 0.2s ease',
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; }}
    >
      {/* Image area */}
      <div style={{ height: '300px', background: '#f5f5f5' }} />
      {/* Content */}
      <div style={{ padding: '14px 16px 18px' }}>
        <p style={{ fontSize: '16px', fontWeight: 600, color: '#111', lineHeight: 1.3, marginBottom: '6px' }}>Product Name</p>
        <p style={{ fontSize: '15px', fontWeight: 700, color: '#111' }}>₹0.00</p>
      </div>
    </div>
  );
}

function ProductSection({ title, slug }: { title: string; slug: string }) {
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
    scrollRef.current?.scrollBy({ left: direction === 'right' ? 700 : -700, behavior: 'smooth' });
  }

  return (
    <div style={{ background: '#ffffff' }}>
      <div className="flex items-center justify-between px-6 pt-8 pb-3">
        <h2 className="text-xl font-black" style={{ color: '#111' }}>{title}</h2>
        <Link
          href={`/products?category=${slug}`}
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
        <ProductSection key={section.id} title={section.title} slug={section.slug} />
      ))}
    </div>
  );
}
