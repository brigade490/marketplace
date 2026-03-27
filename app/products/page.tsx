"use client";

import Link from "next/link";
import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const SLUG_TO_CATEGORY: Record<string, string> = {
  'karobar':                'All',
  'office-supplies':        'Office Supplies',
  'raw-materials':          'Raw Materials',
  'textile-fabric':         'Textiles & Apparel',
  'construction-materials': 'Construction Materials',
};

const demoProducts = [
  { id: "1", name: "Industrial Conveyor Belt System", seller: "TechMach Industries", verified: true, freeDelivery: true, price: "₹4,200", numPrice: 4200, unit: "unit", minOrder: "Min. 5 units", rating: 4.9, reviews: 128, location: "Mumbai", category: "Industrial Equipment" },
  { id: "2", name: "Commercial LED Display Panels", seller: "BrightView Corp", verified: true, freeDelivery: false, price: "₹890", numPrice: 890, unit: "panel", minOrder: "Min. 10 units", rating: 4.7, reviews: 94, location: "Delhi", category: "Electronics & Tech" },
  { id: "3", name: "Stainless Steel Fasteners Set", seller: "MetalPro Solutions", verified: true, freeDelivery: true, price: "₹145", numPrice: 145, unit: "kg", minOrder: "Min. 50 kg", rating: 4.8, reviews: 203, location: "Pune", category: "Industrial Equipment" },
  { id: "4", name: "Organic Fertilizer Blend", seller: "GreenGrow Exports", verified: false, freeDelivery: false, price: "₹55", numPrice: 55, unit: "bag", minOrder: "Min. 100 bags", rating: 4.5, reviews: 67, location: "Ahmedabad", category: "Agriculture" },
  { id: "5", name: "100% Cotton Fabric Roll", seller: "PrimeTex Mills", verified: true, freeDelivery: true, price: "₹3.20", numPrice: 3.2, unit: "meter", minOrder: "Min. 500 m", rating: 4.6, reviews: 189, location: "Surat", category: "Textiles & Apparel" },
  { id: "6", name: "Reinforced Concrete Blocks", seller: "BuildCo Materials", verified: false, freeDelivery: false, price: "₹12", numPrice: 12, unit: "piece", minOrder: "Min. 1,000 pcs", rating: 4.4, reviews: 51, location: "Hyderabad", category: "Construction Materials" },
  { id: "7", name: "Paracetamol API Bulk Supply", seller: "PharmGrade Labs", verified: true, freeDelivery: false, price: "₹28", numPrice: 28, unit: "kg", minOrder: "Min. 25 kg", rating: 4.9, reviews: 312, location: "Bangalore", category: "Pharmaceuticals" },
  { id: "8", name: "Brake Pad Set — OEM Compatible", seller: "AutoParts Direct", verified: true, freeDelivery: true, price: "₹65", numPrice: 65, unit: "set", minOrder: "Min. 20 sets", rating: 4.7, reviews: 147, location: "Chennai", category: "Auto Parts" },
  { id: "9", name: "Freeze-Dried Fruit Assortment", seller: "NaturePack Co.", verified: false, freeDelivery: false, price: "₹18", numPrice: 18, unit: "kg", minOrder: "Min. 50 kg", rating: 4.3, reviews: 38, location: "Kolkata", category: "Food & Beverages" },
  { id: "10", name: "Industrial Touch Screen Panels", seller: "SmartDisplay Tech", verified: true, freeDelivery: false, price: "₹1,250", numPrice: 1250, unit: "unit", minOrder: "Min. 3 units", rating: 4.8, reviews: 76, location: "Jaipur", category: "Electronics & Tech" },
  { id: "11", name: "Precision CNC Machine Parts", seller: "MachCraft Works", verified: true, freeDelivery: true, price: "₹320", numPrice: 320, unit: "batch", minOrder: "Min. 10 batches", rating: 4.6, reviews: 93, location: "Lucknow", category: "Industrial Equipment" },
  { id: "12", name: "Neem Oil Cold Pressed", seller: "NatureExtracts Ltd", verified: false, freeDelivery: false, price: "₹8", numPrice: 8, unit: "liter", minOrder: "Min. 200 L", rating: 4.4, reviews: 44, location: "Mumbai", category: "Agriculture" },
];

type Product = typeof demoProducts[0];

const categories = ["All", "Industrial Equipment", "Electronics & Tech", "Textiles & Apparel", "Agriculture", "Construction Materials", "Pharmaceuticals", "Auto Parts", "Food & Beverages"];
const locationOptions = ["All Locations", "Mumbai", "Delhi", "Bangalore", "Chennai", "Hyderabad", "Pune", "Kolkata", "Ahmedabad", "Surat", "Jaipur", "Lucknow"];
const sortOptions = ["Relevance", "Price: Low to High", "Price: High to Low", "Rating", "Most Reviews"];

const PRICE_MAX = 10000;

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="11" height="11" viewBox="0 0 12 12" fill="none">
          <path
            d="M6 1l1.236 2.506 2.764.402-2 1.948.472 2.75L6 7.506l-2.472 1.1.472-2.75-2-1.948 2.764-.402z"
            fill={i < Math.round(rating) ? '#f59e0b' : '#e0e0e0'}
          />
        </svg>
      ))}
    </span>
  );
}

const filterLabel: React.CSSProperties = {
  fontSize: '10px',
  fontWeight: 600,
  color: '#aaa',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  marginBottom: '6px',
};

const divider: React.CSSProperties = {
  borderTop: '1px solid #f0f0f0',
  margin: '10px 0',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '6px 8px',
  fontSize: '12px',
  background: '#fafafa',
  border: '1px solid #e8e8e8',
  borderRadius: '6px',
  color: '#333',
  outline: 'none',
};

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
  const [freeDelivery, setFreeDelivery] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const tabBarRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ dragging: false, startX: 0, scrollLeft: 0 });

  // Derived slider positions (0–100%)
  const sliderMin = minPrice ? Math.min((Number(minPrice) / PRICE_MAX) * 100, 100) : 0;
  const sliderMax = maxPrice ? Math.min((Number(maxPrice) / PRICE_MAX) * 100, 100) : 100;

  useEffect(() => {
    async function fetchProducts() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("products")
        .select("id, name, category, price, price_unit, min_order_qty, min_order_unit, location, avg_rating, review_count, sellers(company_name, verified)")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (!error && data && data.length > 0) {
        setAllProducts(
          data.map((p) => {
            const seller = p.sellers as unknown as { company_name: string; verified?: boolean } | null;
            return {
              id: p.id,
              name: p.name,
              seller: seller?.company_name ?? "Karobarrr Seller",
              verified: seller?.verified ?? false,
              freeDelivery: false,
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

  // Drag-to-scroll for category chips
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
    const matchCat      = category === "All" || p.category === category;
    const matchLoc      = location === "All Locations" || p.location === location;
    const matchMin      = !minPrice || p.numPrice >= Number(minPrice);
    const matchMax      = !maxPrice || p.numPrice <= Number(maxPrice);
    const matchRating   = p.rating >= minRating;
    const matchDelivery = !freeDelivery || p.freeDelivery;
    const matchVerified = !verifiedOnly || p.verified;
    return matchCat && matchLoc && matchMin && matchMax && matchRating && matchDelivery && matchVerified;
  });

  if (sort === "Price: Low to High")      filtered = [...filtered].sort((a, b) => a.numPrice - b.numPrice);
  else if (sort === "Price: High to Low") filtered = [...filtered].sort((a, b) => b.numPrice - a.numPrice);
  else if (sort === "Rating")             filtered = [...filtered].sort((a, b) => b.rating - a.rating);
  else if (sort === "Most Reviews")       filtered = [...filtered].sort((a, b) => b.reviews - a.reviews);

  function clearAll() {
    setCategory("All"); setLocation("All Locations"); setMinPrice(""); setMaxPrice("");
    setMinRating(0); setSort("Relevance"); setFreeDelivery(false); setVerifiedOnly(false);
  }

  return (
    <div className="min-h-screen" style={{ background: '#f7f7f8' }}>

      {/* ── Sticky category chips ─────────────────────────── */}
      <div className="sticky top-[60px] z-20" style={{ background: '#f7f7f8', borderBottom: '1px solid #e8e8e8' }}>
        <div className="max-w-screen-xl mx-auto px-6">
          <div
            ref={tabBarRef}
            style={{
              display: 'flex',
              gap: '4px',
              overflowX: 'auto',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              cursor: 'grab',
              padding: '10px 0',
            } as React.CSSProperties}
          >
            {categories.map((cat) => {
              const active = category === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  style={{
                    background: active ? '#111' : 'transparent',
                    color: active ? '#fff' : '#666',
                    border: active ? '1px solid #111' : '1px solid transparent',
                    borderRadius: '999px',
                    padding: '5px 14px',
                    fontSize: '13px',
                    fontWeight: active ? 600 : 400,
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
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
      <div className="max-w-screen-xl mx-auto px-6 py-5">
        <div className="flex gap-5 items-start">

          {/* ── Sidebar ───────────────────────────────────── */}
          <aside className={`${showFilters ? "block" : "hidden"} lg:block shrink-0`} style={{ width: '210px' }}>
            <div
              className="sticky"
              style={{
                top: '112px',
                background: '#fff',
                border: '1px solid #e8e8e8',
                borderRadius: '10px',
                padding: '14px 14px 10px',
              }}
            >
              <p style={{ fontSize: '11px', fontWeight: 700, color: '#333', marginBottom: '10px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Filters</p>

              {/* Sort */}
              <div>
                <p style={filterLabel}>Sort By</p>
                <select value={sort} onChange={(e) => setSort(e.target.value)} style={inputStyle}>
                  {sortOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div style={divider} />

              {/* City */}
              <div>
                <p style={filterLabel}>City</p>
                <select value={location} onChange={(e) => setLocation(e.target.value)} style={inputStyle}>
                  {locationOptions.map((loc) => <option key={loc} value={loc}>{loc}</option>)}
                </select>
              </div>

              <div style={divider} />

              {/* Price Range with slider */}
              <div>
                <p style={filterLabel}>Price Range (₹)</p>
                {/* Track */}
                <div style={{ position: 'relative', height: '16px', display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ position: 'absolute', left: 0, right: 0, height: '3px', background: '#eee', borderRadius: '2px' }} />
                  <div style={{
                    position: 'absolute',
                    left: `${sliderMin}%`,
                    right: `${100 - sliderMax}%`,
                    height: '3px',
                    background: '#111',
                    borderRadius: '2px',
                  }} />
                  {/* Min thumb */}
                  <input
                    type="range"
                    min={0} max={PRICE_MAX} step={100}
                    value={minPrice || 0}
                    onChange={(e) => setMinPrice(e.target.value === '0' ? '' : e.target.value)}
                    style={{ position: 'absolute', width: '100%', opacity: 0, cursor: 'pointer', height: '16px', margin: 0 }}
                  />
                </div>
                <div className="flex gap-1.5">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    style={{ ...inputStyle, width: '50%' }}
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    style={{ ...inputStyle, width: '50%' }}
                  />
                </div>
              </div>

              <div style={divider} />

              {/* Rating */}
              <div>
                <p style={filterLabel}>Min. Rating</p>
                <div className="flex gap-1 flex-wrap">
                  {[{ val: 0, label: 'All' }, { val: 4, label: '4+' }, { val: 4.5, label: '4.5+' }, { val: 4.8, label: '4.8+' }].map(({ val, label }) => {
                    const active = minRating === val;
                    return (
                      <button
                        key={val}
                        onClick={() => setMinRating(val)}
                        style={{
                          background: active ? '#111' : 'transparent',
                          color: active ? '#fff' : '#666',
                          border: active ? '1px solid #111' : '1px solid #e0e0e0',
                          borderRadius: '999px',
                          padding: '3px 9px',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                        }}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={divider} />

              {/* Checkboxes */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '7px', cursor: 'pointer', fontSize: '12px', color: '#444', fontWeight: 500 }}>
                  <input
                    type="checkbox"
                    checked={freeDelivery}
                    onChange={(e) => setFreeDelivery(e.target.checked)}
                    style={{ width: '13px', height: '13px', accentColor: '#111', cursor: 'pointer' }}
                  />
                  Free Delivery
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '7px', cursor: 'pointer', fontSize: '12px', color: '#444', fontWeight: 500 }}>
                  <input
                    type="checkbox"
                    checked={verifiedOnly}
                    onChange={(e) => setVerifiedOnly(e.target.checked)}
                    style={{ width: '13px', height: '13px', accentColor: '#111', cursor: 'pointer' }}
                  />
                  Verified Sellers Only
                </label>
              </div>

              <div style={divider} />

              {/* Clear */}
              <button
                onClick={clearAll}
                style={{
                  width: '100%',
                  padding: '4px',
                  background: 'transparent',
                  color: '#2563eb',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'opacity 0.15s',
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = '0.7')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = '1')}
              >
                Clear All Filters
              </button>

              <button
                className="lg:hidden"
                onClick={() => setShowFilters(false)}
                style={{
                  width: '100%',
                  marginTop: '6px',
                  padding: '6px',
                  background: '#f7f7f8',
                  color: '#555',
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </aside>

          {/* ── Products list ─────────────────────────────── */}
          <div className="flex-1 min-w-0">

            {/* Top bar */}
            <div className="flex items-center justify-between mb-3">
              <p style={{ fontSize: '13px', color: '#888' }}>
                <span style={{ fontWeight: 700, color: '#111' }}>{filtered.length}</span> products found
              </p>
              <button
                className="lg:hidden"
                onClick={() => setShowFilters(!showFilters)}
                style={{
                  background: '#111', color: '#fff', border: 'none',
                  borderRadius: '999px', fontSize: '12px', fontWeight: 600,
                  padding: '7px 16px', cursor: 'pointer',
                }}
              >
                Filters
              </button>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-16" style={{ background: '#fff', borderRadius: '10px', border: '1px solid #e8e8e8' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#333', marginBottom: '6px' }}>No products found</h3>
                <p style={{ fontSize: '13px', color: '#999' }}>Try adjusting your filters.</p>
              </div>
            ) : (
              <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: '10px', overflow: 'hidden' }}>
                {filtered.map((product, idx) => (
                  <div
                    key={product.id}
                    style={{
                      display: 'flex',
                      borderTop: idx === 0 ? 'none' : '1px solid #f0f0f0',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.background = '#fafafa')}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.background = 'transparent')}
                  >
                    {/* Image — 300px wide */}
                    <Link href={`/products/${product.id}`} className="shrink-0 block">
                      <div style={{ width: '300px', height: '200px', background: '#f5f5f5', flexShrink: 0 }} />
                    </Link>

                    {/* Info */}
                    <div style={{ flex: 1, padding: '20px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
                      <div>
                        {/* Name */}
                        <Link href={`/products/${product.id}`} className="block">
                          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111', marginBottom: '6px', lineHeight: 1.35 }}>
                            {product.name}
                          </h3>
                        </Link>

                        {/* Seller + verified */}
                        <div className="flex items-center gap-2" style={{ marginBottom: '8px' }}>
                          <span style={{ fontSize: '13px', color: '#555' }}>{product.seller}</span>
                          {product.verified && (
                            <span style={{
                              fontSize: '10px',
                              fontWeight: 600,
                              color: '#888',
                              border: '1px solid #ccc',
                              borderRadius: '4px',
                              padding: '1px 5px',
                              lineHeight: 1.4,
                            }}>
                              Verified
                            </span>
                          )}
                        </div>

                        {/* Rating */}
                        <div className="flex items-center gap-1.5" style={{ marginBottom: '10px' }}>
                          <StarRating rating={product.rating} />
                          <span style={{ fontSize: '12px', fontWeight: 600, color: '#333' }}>{product.rating}</span>
                          <span style={{ fontSize: '12px', color: '#bbb' }}>({product.reviews} reviews)</span>
                        </div>

                        {/* Meta */}
                        <div className="flex items-center gap-4">
                          <span style={{ fontSize: '12px', color: '#888' }}>{product.minOrder}</span>
                          <span style={{ fontSize: '12px', color: '#888' }}>{product.location}</span>
                          <span style={{ fontSize: '12px', color: '#888' }}>{product.category}</span>
                          {product.freeDelivery && (
                            <span style={{ fontSize: '11px', fontWeight: 600, color: '#16a34a' }}>Free Delivery</span>
                          )}
                        </div>
                      </div>

                      {/* Price + buttons */}
                      <div className="flex items-center justify-between" style={{ marginTop: '16px' }}>
                        <div className="flex items-baseline gap-1">
                          <span style={{ fontSize: '22px', fontWeight: 800, color: '#111' }}>{product.price}</span>
                          <span style={{ fontSize: '12px', color: '#999' }}>/ {product.unit}</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            style={{
                              padding: '9px 22px',
                              background: '#000', color: '#fff',
                              border: 'none', borderRadius: '999px',
                              fontSize: '13px', fontWeight: 600,
                              cursor: 'pointer', whiteSpace: 'nowrap',
                              transition: 'opacity 0.15s',
                            }}
                            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = '0.8')}
                            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = '1')}
                          >
                            Add to Cart
                          </button>
                          <button
                            style={{
                              padding: '9px 22px',
                              background: '#fff', color: '#000',
                              border: '1.5px solid #000', borderRadius: '999px',
                              fontSize: '13px', fontWeight: 600,
                              cursor: 'pointer', whiteSpace: 'nowrap',
                              transition: 'background 0.15s',
                            }}
                            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = '#f5f5f5')}
                            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = '#fff')}
                          >
                            Get a Quote
                          </button>
                        </div>
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
