"use client";

import Link from "next/link";
import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Map URL slugs from homepage "See All" links to display category names
const SLUG_TO_CATEGORY: Record<string, string> = {
  'karobar':                'All',
  'office-supplies':        'Office Supplies',
  'raw-materials':          'Raw Materials',
  'textile-fabric':         'Textiles & Apparel',
  'construction-materials': 'Construction Materials',
};

const demoProducts = [
  { id: "1", name: "Industrial Conveyor Belt System", seller: "TechMach Industries", verified: true, tier: "Gold", price: "₹4,200", numPrice: 4200, unit: "unit", minOrder: "Min. 5 units", rating: 4.9, reviews: 128, location: "Mumbai", category: "Industrial Equipment" },
  { id: "2", name: "Commercial LED Display Panels", seller: "BrightView Corp", verified: true, tier: "Silver", price: "₹890", numPrice: 890, unit: "panel", minOrder: "Min. 10 units", rating: 4.7, reviews: 94, location: "Delhi", category: "Electronics & Tech" },
  { id: "3", name: "Stainless Steel Fasteners Set", seller: "MetalPro Solutions", verified: true, tier: "Gold", price: "₹145", numPrice: 145, unit: "kg", minOrder: "Min. 50 kg", rating: 4.8, reviews: 203, location: "Pune", category: "Industrial Equipment" },
  { id: "4", name: "Organic Fertilizer Blend", seller: "GreenGrow Exports", verified: false, tier: "Bronze", price: "₹55", numPrice: 55, unit: "bag", minOrder: "Min. 100 bags", rating: 4.5, reviews: 67, location: "Ahmedabad", category: "Agriculture" },
  { id: "5", name: "100% Cotton Fabric Roll", seller: "PrimeTex Mills", verified: true, tier: "Gold", price: "₹3.20", numPrice: 3.2, unit: "meter", minOrder: "Min. 500 m", rating: 4.6, reviews: 189, location: "Surat", category: "Textiles & Apparel" },
  { id: "6", name: "Reinforced Concrete Blocks", seller: "BuildCo Materials", verified: false, tier: "Silver", price: "₹12", numPrice: 12, unit: "piece", minOrder: "Min. 1,000 pcs", rating: 4.4, reviews: 51, location: "Hyderabad", category: "Construction Materials" },
  { id: "7", name: "Paracetamol API Bulk Supply", seller: "PharmGrade Labs", verified: true, tier: "Gold", price: "₹28", numPrice: 28, unit: "kg", minOrder: "Min. 25 kg", rating: 4.9, reviews: 312, location: "Bangalore", category: "Pharmaceuticals" },
  { id: "8", name: "Brake Pad Set — OEM Compatible", seller: "AutoParts Direct", verified: true, tier: "Silver", price: "₹65", numPrice: 65, unit: "set", minOrder: "Min. 20 sets", rating: 4.7, reviews: 147, location: "Chennai", category: "Auto Parts" },
  { id: "9", name: "Freeze-Dried Fruit Assortment", seller: "NaturePack Co.", verified: false, tier: "Bronze", price: "₹18", numPrice: 18, unit: "kg", minOrder: "Min. 50 kg", rating: 4.3, reviews: 38, location: "Kolkata", category: "Food & Beverages" },
  { id: "10", name: "Industrial Touch Screen Panels", seller: "SmartDisplay Tech", verified: true, tier: "Gold", price: "₹1,250", numPrice: 1250, unit: "unit", minOrder: "Min. 3 units", rating: 4.8, reviews: 76, location: "Jaipur", category: "Electronics & Tech" },
  { id: "11", name: "Precision CNC Machine Parts", seller: "MachCraft Works", verified: true, tier: "Silver", price: "₹320", numPrice: 320, unit: "batch", minOrder: "Min. 10 batches", rating: 4.6, reviews: 93, location: "Lucknow", category: "Industrial Equipment" },
  { id: "12", name: "Neem Oil Cold Pressed", seller: "NatureExtracts Ltd", verified: false, tier: "Bronze", price: "₹8", numPrice: 8, unit: "liter", minOrder: "Min. 200 L", rating: 4.4, reviews: 44, location: "Mumbai", category: "Agriculture" },
];

type Product = typeof demoProducts[0];

const categories = ["All", "Industrial Equipment", "Electronics & Tech", "Textiles & Apparel", "Agriculture", "Construction Materials", "Pharmaceuticals", "Auto Parts", "Food & Beverages"];
const locationOptions = ["All Locations", "Mumbai", "Delhi", "Bangalore", "Chennai", "Hyderabad", "Pune", "Kolkata", "Ahmedabad", "Surat", "Jaipur", "Lucknow"];
const sortOptions = ["Relevance", "Price: Low to High", "Price: High to Low", "Rating", "Most Reviews"];

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < full;
        const isHalf = !filled && i === full && half;
        return (
          <svg key={i} width="12" height="12" viewBox="0 0 12 12" fill="none">
            <defs>
              <linearGradient id={`half-${i}`} x1="0" x2="1" y1="0" y2="0">
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="50%" stopColor="#d1d5db" />
              </linearGradient>
            </defs>
            <path
              d="M6 1l1.236 2.506 2.764.402-2 1.948.472 2.75L6 7.506l-2.472 1.1.472-2.75-2-1.948 2.764-.402z"
              fill={filled ? '#f59e0b' : isHalf ? `url(#half-${i})` : '#d1d5db'}
            />
          </svg>
        );
      })}
    </span>
  );
}

function ProductsPageInner() {
  const searchParams = useSearchParams();
  const initialCategory = SLUG_TO_CATEGORY[searchParams.get('category') ?? ''] ?? 'All';

  const [allProducts, setAllProducts] = useState<Product[]>(demoProducts);
  const [category, setCategory] = useState(initialCategory);
  const [location, setLocation] = useState("All Locations");
  const [sort, setSort] = useState("Relevance");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minRating, setMinRating] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const tabBarRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ dragging: false, startX: 0, scrollLeft: 0 });

  useEffect(() => {
    async function fetchProducts() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("products")
        .select("id, name, category, price, price_unit, min_order_qty, min_order_unit, location, avg_rating, review_count, sellers(company_name, tier, verified)")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (!error && data && data.length > 0) {
        setAllProducts(
          data.map((p) => {
            const seller = p.sellers as unknown as { company_name: string; tier: string; verified?: boolean } | null;
            return {
              id: p.id,
              name: p.name,
              seller: seller?.company_name ?? "Karobarrr Seller",
              verified: seller?.verified ?? false,
              tier: seller?.tier ?? "Bronze",
              price: `₹${Number(p.price).toLocaleString("en-IN")}`,
              numPrice: Number(p.price),
              unit: p.price_unit ?? "unit",
              minOrder: `Min. ${p.min_order_qty} ${p.min_order_unit}`,
              rating: Number(p.avg_rating) || 4.5,
              reviews: p.review_count || 0,
              location: p.location ?? "India",
              category: p.category,
            };
          })
        );
      }
    }
    fetchProducts();
  }, []);

  // Drag-to-scroll for category tab bar
  useEffect(() => {
    const el = tabBarRef.current;
    if (!el) return;
    const d = dragRef.current;
    const onDown = (e: MouseEvent) => { d.dragging = true; d.startX = e.pageX - el.offsetLeft; d.scrollLeft = el.scrollLeft; el.style.cursor = 'grabbing'; };
    const onUp   = () => { d.dragging = false; el.style.cursor = 'grab'; };
    const onMove = (e: MouseEvent) => { if (!d.dragging) return; e.preventDefault(); el.scrollLeft = d.scrollLeft - (e.pageX - el.offsetLeft - d.startX); };
    const onTouch     = (e: TouchEvent) => { d.startX = e.touches[0].pageX - el.offsetLeft; d.scrollLeft = el.scrollLeft; };
    const onTouchMove = (e: TouchEvent) => { el.scrollLeft = d.scrollLeft - (e.touches[0].pageX - el.offsetLeft - d.startX); };
    el.addEventListener('mousedown', onDown);
    el.addEventListener('mouseleave', onUp);
    el.addEventListener('mouseup', onUp);
    el.addEventListener('mousemove', onMove);
    el.addEventListener('touchstart', onTouch, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: true });
    return () => {
      el.removeEventListener('mousedown', onDown);
      el.removeEventListener('mouseleave', onUp);
      el.removeEventListener('mouseup', onUp);
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('touchstart', onTouch);
      el.removeEventListener('touchmove', onTouchMove);
    };
  }, []);

  let filtered = allProducts.filter((p) => {
    const matchCat    = category === "All" || p.category === category;
    const matchLoc    = location === "All Locations" || p.location === location;
    const matchMin    = !minPrice || p.numPrice >= Number(minPrice);
    const matchMax    = !maxPrice || p.numPrice <= Number(maxPrice);
    const matchRating = p.rating >= minRating;
    return matchCat && matchLoc && matchMin && matchMax && matchRating;
  });

  if (sort === "Price: Low to High")  filtered = [...filtered].sort((a, b) => a.numPrice - b.numPrice);
  else if (sort === "Price: High to Low") filtered = [...filtered].sort((a, b) => b.numPrice - a.numPrice);
  else if (sort === "Rating")         filtered = [...filtered].sort((a, b) => b.rating - a.rating);
  else if (sort === "Most Reviews")   filtered = [...filtered].sort((a, b) => b.reviews - a.reviews);

  const sidebarInputStyle: React.CSSProperties = {
    width: '100%',
    padding: '9px 12px',
    fontSize: '13px',
    background: '#fff',
    border: '1px solid #e5e5e5',
    borderRadius: '10px',
    color: '#333',
    outline: 'none',
  };

  return (
    <div className="min-h-screen" style={{ background: '#f7f7f8' }}>

      {/* ── Sticky category chips bar ─────────────────────── */}
      <div
        className="sticky top-[60px] z-20"
        style={{ background: '#f7f7f8', borderBottom: '1px solid #ebebeb' }}
      >
        <div className="max-w-screen-xl mx-auto px-6">
          <div
            ref={tabBarRef}
            className="no-scrollbar"
            style={{
              display: 'flex',
              gap: '8px',
              overflowX: 'auto',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              cursor: 'grab',
              padding: '12px 0',
            } as React.CSSProperties}
          >
            {categories.map((cat) => {
              const active = category === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  style={{
                    background: active ? '#111' : '#fff',
                    color: active ? '#fff' : '#555',
                    border: active ? '1px solid #111' : '1px solid #e0e0e0',
                    borderRadius: '999px',
                    padding: '7px 18px',
                    fontSize: '13px',
                    fontWeight: active ? 600 : 500,
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Main layout ──────────────────────────────────── */}
      <div className="max-w-screen-xl mx-auto px-6 py-6">
        <div className="flex gap-6 items-start">

          {/* ── Sidebar ───────────────────────────────────── */}
          <aside className={`${showFilters ? "block" : "hidden"} lg:block shrink-0`} style={{ width: '220px' }}>
            <div
              className="sticky"
              style={{
                top: '120px',
                background: '#fff',
                border: '1px solid #ebebeb',
                borderRadius: '16px',
                padding: '20px 16px',
              }}
            >
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#111', marginBottom: '16px', letterSpacing: '0.02em', textTransform: 'uppercase' }}>Filters</p>

              {/* Sort */}
              <div style={{ marginBottom: '18px' }}>
                <p style={{ fontSize: '11px', fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>Sort By</p>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  style={sidebarInputStyle}
                >
                  {sortOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* City */}
              <div style={{ marginBottom: '18px' }}>
                <p style={{ fontSize: '11px', fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>City</p>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  style={sidebarInputStyle}
                >
                  {locationOptions.map((loc) => <option key={loc} value={loc}>{loc}</option>)}
                </select>
              </div>

              {/* Price Range */}
              <div style={{ marginBottom: '18px' }}>
                <p style={{ fontSize: '11px', fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>Price Range (₹)</p>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    style={{ ...sidebarInputStyle, width: '50%' }}
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    style={{ ...sidebarInputStyle, width: '50%' }}
                  />
                </div>
              </div>

              {/* Rating */}
              <div style={{ marginBottom: '20px' }}>
                <p style={{ fontSize: '11px', fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>Min. Rating</p>
                <div className="flex gap-2 flex-wrap">
                  {[{ val: 0, label: 'All' }, { val: 4, label: '4+' }, { val: 4.5, label: '4.5+' }, { val: 4.8, label: '4.8+' }].map(({ val, label }) => {
                    const active = minRating === val;
                    return (
                      <button
                        key={val}
                        onClick={() => setMinRating(val)}
                        style={{
                          background: active ? '#111' : '#fff',
                          color: active ? '#fff' : '#555',
                          border: active ? '1px solid #111' : '1px solid #e0e0e0',
                          borderRadius: '999px',
                          padding: '5px 12px',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.18s',
                        }}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Divider */}
              <div style={{ borderTop: '1px solid #ebebeb', marginBottom: '12px' }} />

              {/* Clear */}
              <button
                onClick={() => { setCategory("All"); setLocation("All Locations"); setMinPrice(""); setMaxPrice(""); setMinRating(0); setSort("Relevance"); }}
                style={{
                  width: '100%',
                  padding: '8px',
                  background: 'transparent',
                  color: '#999',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#e03030')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#999')}
              >
                Clear All Filters
              </button>

              {/* Mobile close */}
              <button
                className="lg:hidden"
                onClick={() => setShowFilters(false)}
                style={{
                  width: '100%',
                  marginTop: '8px',
                  padding: '8px',
                  background: '#f7f7f8',
                  color: '#555',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </aside>

          {/* ── Product grid ──────────────────────────────── */}
          <div className="flex-1 min-w-0">

            {/* Top bar: count + mobile filter button */}
            <div className="flex items-center justify-between mb-5">
              <p style={{ fontSize: '13px', color: '#888' }}>
                <span style={{ fontWeight: 700, color: '#111' }}>{filtered.length}</span> products found
              </p>
              <button
                className="lg:hidden px-4 py-2 text-xs font-semibold"
                onClick={() => setShowFilters(!showFilters)}
                style={{
                  background: '#111',
                  color: '#fff',
                  borderRadius: '999px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 600,
                  padding: '8px 16px',
                }}
              >
                Filters
              </button>
            </div>

            {filtered.length === 0 ? (
              <div
                className="text-center py-20"
                style={{ background: '#fff', borderRadius: '16px', border: '1px solid #ebebeb' }}
              >
                <div style={{ fontSize: '40px', marginBottom: '12px', color: '#ccc' }}>—</div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#333', marginBottom: '6px' }}>No products found</h3>
                <p style={{ fontSize: '13px', color: '#999' }}>Try adjusting your filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.map((product) => (
                  <div
                    key={product.id}
                    style={{
                      background: '#fff',
                      border: '1px solid #ebebeb',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'box-shadow 0.2s ease',
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; }}
                  >
                    {/* Image area */}
                    <Link href={`/products/${product.id}`} className="block">
                      <div
                        style={{
                          height: '200px',
                          background: '#f5f5f5',
                          borderRadius: '16px 16px 0 0',
                        }}
                      />
                    </Link>

                    {/* Content */}
                    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>

                      {/* Product name */}
                      <Link href={`/products/${product.id}`} className="block">
                        <h3
                          style={{
                            fontSize: '15px',
                            fontWeight: 700,
                            color: '#111',
                            lineHeight: 1.35,
                            marginBottom: '8px',
                          }}
                          className="line-clamp-2"
                        >
                          {product.name}
                        </h3>
                      </Link>

                      {/* Seller + verified */}
                      <div className="flex items-center gap-1.5" style={{ marginBottom: '8px' }}>
                        <span style={{ fontSize: '12px', color: '#666' }}>{product.seller}</span>
                        {product.verified && (
                          <span
                            style={{
                              fontSize: '10px',
                              fontWeight: 700,
                              color: '#0a7aff',
                              background: '#e8f2ff',
                              borderRadius: '999px',
                              padding: '2px 7px',
                            }}
                          >
                            Verified
                          </span>
                        )}
                      </div>

                      {/* Star rating + review count */}
                      <div className="flex items-center gap-1.5" style={{ marginBottom: '10px' }}>
                        <StarRating rating={product.rating} />
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#333' }}>{product.rating}</span>
                        <span style={{ fontSize: '12px', color: '#999' }}>({product.reviews})</span>
                      </div>

                      {/* Price */}
                      <div className="flex items-baseline gap-1" style={{ marginBottom: '4px' }}>
                        <span style={{ fontSize: '22px', fontWeight: 800, color: '#111' }}>{product.price}</span>
                        <span style={{ fontSize: '13px', color: '#888' }}>/ {product.unit}</span>
                      </div>

                      {/* Min order */}
                      <p style={{ fontSize: '12px', color: '#999', marginBottom: '6px' }}>{product.minOrder}</p>

                      {/* Location */}
                      <p style={{ fontSize: '12px', color: '#888', marginBottom: '14px' }}>{product.location}</p>

                      {/* Spacer */}
                      <div style={{ flex: 1 }} />

                      {/* Buttons */}
                      <div className="flex gap-2">
                        <button
                          style={{
                            flex: 1,
                            padding: '10px 0',
                            background: '#000',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '999px',
                            fontSize: '13px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'opacity 0.18s',
                          }}
                          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = '0.85')}
                          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = '1')}
                        >
                          Add to Cart
                        </button>
                        <button
                          style={{
                            flex: 1,
                            padding: '10px 0',
                            background: '#fff',
                            color: '#000',
                            border: '1.5px solid #000',
                            borderRadius: '999px',
                            fontSize: '13px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'background 0.18s, color 0.18s',
                          }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#f5f5f5'; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#fff'; }}
                        >
                          Get a Quote
                        </button>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return <Suspense><ProductsPageInner /></Suspense>;
}
