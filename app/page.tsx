'use client';

import { useRef } from 'react';

const sections = [
  { id: 'cafe', title: 'Cafe Needs' },
  { id: 'office', title: 'Office Supplies' },
  { id: 'raw', title: 'Raw Materials' },
  { id: 'textile', title: 'Textile & Fabric' },
  { id: 'construction', title: 'Construction Materials' },
];

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
      {/* Section header: title + arrow buttons */}
      <div className="px-6 pt-8 pb-3 flex items-center justify-between">
        <h2 className="text-xl font-black text-black">{title}</h2>
        <div className="flex gap-2">
          <button
            onClick={() => scroll('left')}
            aria-label={`Scroll ${title} left`}
            className="w-9 h-9 flex items-center justify-center bg-black text-white text-lg font-bold hover:bg-[#dee2e6] hover:text-black transition-colors"
          >
            ‹
          </button>
          <button
            onClick={() => scroll('right')}
            aria-label={`Scroll ${title} right`}
            className="w-9 h-9 flex items-center justify-center bg-black text-white text-lg font-bold hover:bg-[#dee2e6] hover:text-black transition-colors"
          >
            ›
          </button>
        </div>
      </div>

      {/* Horizontally scrollable cards row */}
      <div
        ref={scrollRef}
        className="no-scrollbar flex gap-3 overflow-x-auto px-6 pb-8"
      >
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="shrink-0 bg-white"
            style={{ width: '196px', height: '260px' }}
          />
        ))}
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
