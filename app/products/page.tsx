"use client";

import Link from "next/link";
import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const SLUG_TO_CATEGORY: Record<string, string> = {
  'karobar': 'All', 'office-supplies': 'Office Supplies',
  'raw-materials': 'Raw Materials', 'textile-fabric': 'Textiles & Apparel',
  'construction-materials': 'Construction Materials',
};

const demoProducts = [
  { id: "1", name: "Industrial Conveyor Belt System", seller: "TechMach Industries", verified: true, freeDelivery: true, price: "₹4,200", numPrice: 4200, unit: "unit", minOrder: "Min. 5 units", rating: 4.9, reviews: 128, location: "Mumbai", category: "Industrial Equipment", brand: "TechMach" },
  { id: "2", name: "Commercial LED Display Panels", seller: "BrightView Corp", verified: true, freeDelivery: false, price: "₹890", numPrice: 890, unit: "panel", minOrder: "Min. 10 units", rating: 4.7, reviews: 94, location: "Delhi", category: "Electronics & Tech", brand: "BrightView" },
  { id: "3", name: "Stainless Steel Fasteners Set", seller: "MetalPro Solutions", verified: true, freeDelivery: true, price: "₹145", numPrice: 145, unit: "kg", minOrder: "Min. 50 kg", rating: 4.8, reviews: 203, location: "Pune", category: "Industrial Equipment", brand: "MetalPro" },
  { id: "4", name: "Organic Fertilizer Blend", seller: "GreenGrow Exports", verified: false, freeDelivery: false, price: "₹55", numPrice: 55, unit: "bag", minOrder: "Min. 100 bags", rating: 4.5, reviews: 67, location: "Ahmedabad", category: "Agriculture", brand: "GreenGrow" },
  { id: "5", name: "100% Cotton Fabric Roll", seller: "PrimeTex Mills", verified: true, freeDelivery: true, price: "₹3.20", numPrice: 3.2, unit: "meter", minOrder: "Min. 500 m", rating: 4.6, reviews: 189, location: "Surat", category: "Textiles & Apparel", brand: "PrimeTex" },
  { id: "6", name: "Reinforced Concrete Blocks", seller: "BuildCo Materials", verified: false, freeDelivery: false, price: "₹12", numPrice: 12, unit: "piece", minOrder: "Min. 1,000 pcs", rating: 4.4, reviews: 51, location: "Hyderabad", category: "Construction Materials", brand: "BuildCo" },
  { id: "7", name: "Paracetamol API Bulk Supply", seller: "PharmGrade Labs", verified: true, freeDelivery: false, price: "₹28", numPrice: 28, unit: "kg", minOrder: "Min. 25 kg", rating: 4.9, reviews: 312, location: "Bangalore", category: "Pharmaceuticals", brand: "PharmGrade" },
  { id: "8", name: "Brake Pad Set — OEM Compatible", seller: "AutoParts Direct", verified: true, freeDelivery: true, price: "₹65", numPrice: 65, unit: "set", minOrder: "Min. 20 sets", rating: 4.7, reviews: 147, location: "Chennai", category: "Auto Parts", brand: "AutoParts" },
  { id: "9", name: "Freeze-Dried Fruit Assortment", seller: "NaturePack Co.", verified: false, freeDelivery: false, price: "₹18", numPrice: 18, unit: "kg", minOrder: "Min. 50 kg", rating: 4.3, reviews: 38, location: "Kolkata", category: "Food & Beverages", brand: "NaturePack" },
  { id: "10", name: "Industrial Touch Screen Panels", seller: "SmartDisplay Tech", verified: true, freeDelivery: false, price: "₹1,250", numPrice: 1250, unit: "unit", minOrder: "Min. 3 units", rating: 4.8, reviews: 76, location: "Jaipur", category: "Electronics & Tech", brand: "SmartDisplay" },
  { id: "11", name: "Precision CNC Machine Parts", seller: "MachCraft Works", verified: true, freeDelivery: true, price: "₹320", numPrice: 320, unit: "batch", minOrder: "Min. 10 batches", rating: 4.6, reviews: 93, location: "Lucknow", category: "Industrial Equipment", brand: "MachCraft" },
  { id: "12", name: "Neem Oil Cold Pressed", seller: "NatureExtracts Ltd", verified: false, freeDelivery: false, price: "₹8", numPrice: 8, unit: "liter", minOrder: "Min. 200 L", rating: 4.4, reviews: 44, location: "Mumbai", category: "Agriculture", brand: "NatureExtracts" },
];

type Product = typeof demoProducts[0];

const categories = ["All", "Industrial Equipment", "Electronics & Tech", "Textiles & Apparel", "Agriculture", "Construction Materials", "Pharmaceuticals", "Auto Parts", "Food & Beverages"];
const locationOptions = ["All Locations", "Mumbai", "Delhi", "Bangalore", "Chennai", "Hyderabad", "Pune", "Kolkata", "Ahmedabad", "Surat", "Jaipur", "Lucknow"];
const sortOptions = ["Relevance", "Price: Low to High", "Price: High to Low", "Rating", "Most Reviews"];
const allBrands = ["TechMach", "BrightView", "MetalPro", "GreenGrow", "PrimeTex", "BuildCo", "PharmGrade", "AutoParts"];
const popularIdeas = ["Bulk Orders", "ISO Certified", "Free Delivery", "New Arrivals", "Best Rated", "Verified Sellers"];

const PRICE_MAX = 10000;

function Stars({ rating, size = 13 }: { rating: number; size?: number }) {
  return (
    <span style={{ display: 'inline-flex', gap: '1px' }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 12 12" fill="none">
          <path d="M6 1l1.236 2.506 2.764.402-2 1.948.472 2.75L6 7.506l-2.472 1.1.472-2.75-2-1.948 2.764-.402z"
            fill={i < Math.round(rating) ? '#f59e0b' : '#e0e0e0'} />
        </svg>
      ))}
    </span>
  );
}

const divStyle: React.CSSProperties = { borderTop: '1px solid #f0f0f0', margin: '12px 0' };
const labelStyle: React.CSSProperties = { fontSize: '13px', fontWeight: 700, color: '#111', marginBottom: '8px', display: 'block' };

function ProductsPageInner() {
  const searchParams = useSearchParams();
  const initialCategory = SLUG_TO_CATEGORY[searchParams.get('category') ?? ''] ?? 'All';

  const [allProducts, setAllProducts] = useState<Product[]>(demoProducts);
  const [category, setCategory] = useState(initialCategory);
  const [location, setLocation] = useState("All Locations");
  const [sort, setSort] = useState("Relevance");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, PRICE_MAX]);
  const [minRating, setMinRating] = useState(0);
  const [freeDelivery, setFreeDelivery] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const tabBarRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ dragging: false, startX: 0, scrollLeft: 0 });
  const sliderRef = useRef<HTMLDivElement>(null);
  const draggingThumb = useRef<'min' | 'max' | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("products")
        .select("id, name, category, price, price_unit, min_order_qty, min_order_unit, location, avg_rating, review_count, sellers(company_name, verified)")
        .eq("is_active", true).order("created_at", { ascending: false });
      if (!error && data && data.length > 0) {
        setAllProducts(data.map((p) => {
          const seller = p.sellers as unknown as { company_name: string; verified?: boolean } | null;
          return {
            id: p.id, name: p.name,
            seller: seller?.company_name ?? "Karobarrr Seller",
            verified: seller?.verified ?? false, freeDelivery: false,
            price: `₹${Number(p.price).toLocaleString("en-IN")}`, numPrice: Number(p.price),
            unit: p.price_unit ?? "unit",
            minOrder: `Min. ${p.min_order_qty} ${p.min_order_unit}`,
            rating: Number(p.avg_rating) || 4.5, reviews: p.review_count || 0,
            location: p.location ?? "India", category: p.category, brand: seller?.company_name ?? "",
          };
        }));
      }
    }
    fetchProducts();
  }, []);

  // Drag-to-scroll chips
  useEffect(() => {
    const el = tabBarRef.current;
    if (!el) return;
    const d = dragRef.current;
    const onDown = (e: MouseEvent) => { d.dragging = true; d.startX = e.pageX - el.offsetLeft; d.scrollLeft = el.scrollLeft; el.style.cursor = 'grabbing'; };
    const onUp = () => { d.dragging = false; el.style.cursor = 'grab'; };
    const onMove = (e: MouseEvent) => { if (!d.dragging) return; e.preventDefault(); el.scrollLeft = d.scrollLeft - (e.pageX - el.offsetLeft - d.startX); };
    el.addEventListener('mousedown', onDown); el.addEventListener('mouseleave', onUp);
    el.addEventListener('mouseup', onUp); el.addEventListener('mousemove', onMove);
    return () => { el.removeEventListener('mousedown', onDown); el.removeEventListener('mouseleave', onUp); el.removeEventListener('mouseup', onUp); el.removeEventListener('mousemove', onMove); };
  }, []);

  // Price range slider drag
  function getSliderPct(clientX: number) {
    const el = sliderRef.current;
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  }
  function onSliderMouseDown(thumb: 'min' | 'max') {
    return (e: React.MouseEvent) => {
      e.preventDefault();
      draggingThumb.current = thumb;
      const onMove = (ev: MouseEvent) => {
        const pct = getSliderPct(ev.clientX);
        const val = Math.round(pct * PRICE_MAX / 100) * 100;
        setPriceRange(([lo, hi]) => thumb === 'min' ? [Math.min(val, hi - 100), hi] : [lo, Math.max(val, lo + 100)]);
      };
      const onUp = () => { draggingThumb.current = null; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    };
  }

  const minPct = (priceRange[0] / PRICE_MAX) * 100;
  const maxPct = (priceRange[1] / PRICE_MAX) * 100;

  function toggleBrand(b: string) {
    setSelectedBrands((prev) => prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b]);
  }

  function clearAll() {
    setCategory("All"); setLocation("All Locations"); setPriceRange([0, PRICE_MAX]);
    setMinRating(0); setSort("Relevance"); setFreeDelivery(false); setVerifiedOnly(false); setSelectedBrands([]);
  }

  let filtered = allProducts.filter((p) => {
    const matchCat = category === "All" || p.category === category;
    const matchLoc = location === "All Locations" || p.location === location;
    const matchMin = p.numPrice >= priceRange[0];
    const matchMax = p.numPrice <= priceRange[1];
    const matchRating = p.rating >= minRating;
    const matchDelivery = !freeDelivery || p.freeDelivery;
    const matchVerified = !verifiedOnly || p.verified;
    const matchBrand = selectedBrands.length === 0 || selectedBrands.includes(p.brand);
    return matchCat && matchLoc && matchMin && matchMax && matchRating && matchDelivery && matchVerified && matchBrand;
  });

  if (sort === "Price: Low to High") filtered = [...filtered].sort((a, b) => a.numPrice - b.numPrice);
  else if (sort === "Price: High to Low") filtered = [...filtered].sort((a, b) => b.numPrice - a.numPrice);
  else if (sort === "Rating") filtered = [...filtered].sort((a, b) => b.rating - a.rating);
  else if (sort === "Most Reviews") filtered = [...filtered].sort((a, b) => b.reviews - a.reviews);

  const inputSel: React.CSSProperties = { width: '100%', padding: '6px 8px', fontSize: '12px', background: '#fafafa', border: '1px solid #e8e8e8', borderRadius: '6px', color: '#333', outline: 'none' };

  const Sidebar = () => (
    <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: '10px', padding: '16px 14px' }}>

      {/* Popular Search Ideas */}
      <div>
        <span style={labelStyle}>Popular Search Ideas</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {popularIdeas.map((idea) => (
            <button key={idea} onClick={() => {}}
              style={{ background: 'none', border: 'none', padding: 0, textAlign: 'left', fontSize: '13px', color: '#0066c0', cursor: 'pointer', fontWeight: 400 }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.textDecoration = 'underline')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.textDecoration = 'none')}
            >{idea}</button>
          ))}
        </div>
      </div>

      <div style={divStyle} />

      {/* Sort By */}
      <div>
        <span style={labelStyle}>Sort By</span>
        <select value={sort} onChange={(e) => setSort(e.target.value)} style={inputSel}>
          {sortOptions.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div style={divStyle} />

      {/* City */}
      <div>
        <span style={labelStyle}>City</span>
        <select value={location} onChange={(e) => setLocation(e.target.value)} style={inputSel}>
          {locationOptions.map((l) => <option key={l}>{l}</option>)}
        </select>
      </div>

      <div style={divStyle} />

      {/* Free Delivery */}
      <div>
        <span style={labelStyle}>Eligible for Free Delivery</span>
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer' }}>
          <input type="checkbox" checked={freeDelivery} onChange={(e) => setFreeDelivery(e.target.checked)}
            style={{ marginTop: '2px', width: '14px', height: '14px', accentColor: '#111', cursor: 'pointer', flexShrink: 0 }} />
          <div>
            <span style={{ fontSize: '13px', color: '#333' }}>Free Shipping</span>
            <p style={{ fontSize: '11px', color: '#888', marginTop: '2px', lineHeight: 1.4 }}>Get FREE shipping on eligible orders</p>
          </div>
        </label>
      </div>

      <div style={divStyle} />

      {/* Verified Sellers */}
      <div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input type="checkbox" checked={verifiedOnly} onChange={(e) => setVerifiedOnly(e.target.checked)}
            style={{ width: '14px', height: '14px', accentColor: '#111', cursor: 'pointer' }} />
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#111' }}>Verified Sellers Only</span>
        </label>
      </div>

      <div style={divStyle} />

      {/* Brands */}
      <div>
        <span style={labelStyle}>Brands</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {allBrands.map((b) => (
            <label key={b} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="checkbox" checked={selectedBrands.includes(b)} onChange={() => toggleBrand(b)}
                style={{ width: '14px', height: '14px', accentColor: '#111', cursor: 'pointer' }} />
              <span style={{ fontSize: '13px', color: '#333' }}>{b}</span>
            </label>
          ))}
        </div>
      </div>

      <div style={divStyle} />

      {/* Price Range slider */}
      <div>
        <span style={labelStyle}>Price</span>
        <p style={{ fontSize: '12px', color: '#333', marginBottom: '10px', fontWeight: 500 }}>
          ₹{priceRange[0].toLocaleString('en-IN')} – ₹{priceRange[1].toLocaleString('en-IN')}+
        </p>
        {/* Slider track */}
        <div
          ref={sliderRef}
          style={{ position: 'relative', height: '20px', display: 'flex', alignItems: 'center', userSelect: 'none', marginBottom: '4px' }}
        >
          {/* Full track */}
          <div style={{ position: 'absolute', left: 0, right: 0, height: '4px', background: '#e0e0e0', borderRadius: '2px' }} />
          {/* Active fill */}
          <div style={{ position: 'absolute', left: `${minPct}%`, right: `${100 - maxPct}%`, height: '4px', background: '#111', borderRadius: '2px' }} />
          {/* Min thumb */}
          <div
            onMouseDown={onSliderMouseDown('min')}
            style={{
              position: 'absolute', left: `${minPct}%`, transform: 'translateX(-50%)',
              width: '16px', height: '16px', borderRadius: '50%',
              background: '#fff', border: '2px solid #111',
              cursor: 'grab', zIndex: 2, boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
            }}
          />
          {/* Max thumb */}
          <div
            onMouseDown={onSliderMouseDown('max')}
            style={{
              position: 'absolute', left: `${maxPct}%`, transform: 'translateX(-50%)',
              width: '16px', height: '16px', borderRadius: '50%',
              background: '#fff', border: '2px solid #111',
              cursor: 'grab', zIndex: 2, boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
            }}
          />
        </div>
      </div>

      <div style={divStyle} />

      {/* Customer Reviews */}
      <div>
        <span style={labelStyle}>Customer Reviews</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {[4, 3, 2].map((r) => (
            <button
              key={r}
              onClick={() => setMinRating(minRating === r ? 0 : r)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: 'none', border: 'none', padding: '2px 0',
                cursor: 'pointer', textAlign: 'left',
              }}
            >
              <Stars rating={r} size={14} />
              <span style={{ fontSize: '13px', color: minRating === r ? '#111' : '#555', fontWeight: minRating === r ? 700 : 400 }}>
                & Up
              </span>
            </button>
          ))}
        </div>
      </div>

      <div style={divStyle} />

      {/* Min Rating pill row */}
      <div>
        <span style={{ ...labelStyle, marginBottom: '6px' }}>Min. Rating</span>
        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
          {[{ val: 0, label: 'All' }, { val: 4, label: '4+' }, { val: 4.5, label: '4.5+' }, { val: 4.8, label: '4.8+' }].map(({ val, label }) => {
            const active = minRating === val;
            return (
              <button key={val} onClick={() => setMinRating(val)} style={{
                padding: '3px 10px', fontSize: '11px', fontWeight: 600,
                background: active ? '#111' : 'transparent', color: active ? '#fff' : '#666',
                border: active ? '1px solid #111' : '1px solid #ddd',
                borderRadius: '999px', cursor: 'pointer', transition: 'all 0.15s',
              }}>{label}</button>
            );
          })}
        </div>
      </div>

      <div style={divStyle} />

      {/* Clear */}
      <button onClick={clearAll} style={{
        width: '100%', padding: '5px', background: 'none', border: 'none',
        fontSize: '12px', fontWeight: 700, color: '#2563eb', cursor: 'pointer', textAlign: 'center',
      }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.textDecoration = 'underline')}
        onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.textDecoration = 'none')}
      >Clear All Filters</button>

      <button className="lg:hidden" onClick={() => setShowFilters(false)} style={{
        width: '100%', marginTop: '6px', padding: '7px', background: '#f7f7f8',
        color: '#555', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
      }}>Close</button>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: '#f7f7f8' }}>

      {/* ── Category chips ────────────────────────────────── */}
      <div className="sticky top-[60px] z-20" style={{ background: '#f7f7f8', borderBottom: '1px solid #e8e8e8' }}>
        <div className="max-w-screen-xl mx-auto px-6">
          <div ref={tabBarRef} style={{ display: 'flex', gap: '4px', overflowX: 'auto', scrollbarWidth: 'none', cursor: 'grab', padding: '10px 0' } as React.CSSProperties}>
            {categories.map((cat) => {
              const active = category === cat;
              return (
                <button key={cat} onClick={() => setCategory(cat)} style={{
                  background: active ? '#111' : 'transparent', color: active ? '#fff' : '#666',
                  border: active ? '1px solid #111' : '1px solid transparent',
                  borderRadius: '999px', padding: '5px 14px', fontSize: '13px',
                  fontWeight: active ? 600 : 400, whiteSpace: 'nowrap', flexShrink: 0,
                  cursor: 'pointer', transition: 'all 0.15s',
                }}>{cat}</button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Main layout ──────────────────────────────────── */}
      <div className="max-w-screen-xl mx-auto px-6 py-5">
        <div className="flex gap-5 items-start">

          {/* Sidebar */}
          <aside className={`${showFilters ? "block" : "hidden"} lg:block shrink-0`} style={{ width: '220px' }}>
            <div className="sticky" style={{ top: '112px' }}>
              <Sidebar />
            </div>
          </aside>

          {/* Product list */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-3">
              <p style={{ fontSize: '13px', color: '#888' }}>
                <span style={{ fontWeight: 700, color: '#111' }}>{filtered.length}</span> results
              </p>
              <button className="lg:hidden" onClick={() => setShowFilters(!showFilters)} style={{
                background: '#111', color: '#fff', border: 'none', borderRadius: '999px',
                fontSize: '12px', fontWeight: 600, padding: '7px 16px', cursor: 'pointer',
              }}>Filters</button>
            </div>

            {filtered.length === 0 ? (
              <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #e8e8e8', padding: '48px', textAlign: 'center' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#333', marginBottom: '6px' }}>No products found</h3>
                <p style={{ fontSize: '13px', color: '#999' }}>Try adjusting your filters.</p>
              </div>
            ) : (
              <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: '10px', overflow: 'hidden' }}>
                {filtered.map((product, idx) => (
                  <div
                    key={product.id}
                    style={{ display: 'flex', borderTop: idx === 0 ? 'none' : '1px solid #f0f0f0', background: '#fff' }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.background = '#fafafa')}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.background = '#fff')}
                  >
                    {/* Image */}
                    <Link href={`/products/${product.id}`} className="shrink-0 block" style={{ alignSelf: 'stretch' }}>
                      <div style={{ width: '280px', height: '100%', minHeight: '200px', background: '#f5f5f5' }} />
                    </Link>

                    {/* Info */}
                    <div style={{ flex: 1, padding: '20px 22px', display: 'flex', flexDirection: 'column', minWidth: 0 }}>

                      {/* Name */}
                      <Link href={`/products/${product.id}`} style={{ textDecoration: 'none' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111', marginBottom: '6px', lineHeight: 1.35 }}>
                          {product.name}
                        </h3>
                      </Link>

                      {/* Seller + verified */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '7px' }}>
                        <span style={{ fontSize: '13px', color: '#555' }}>{product.seller}</span>
                        {product.verified && (
                          <span style={{ fontSize: '10px', fontWeight: 600, color: '#666', border: '1px solid #ccc', borderRadius: '4px', padding: '1px 5px', lineHeight: 1.4 }}>
                            Verified
                          </span>
                        )}
                      </div>

                      {/* Stars */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '8px' }}>
                        <Stars rating={product.rating} size={13} />
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#333' }}>{product.rating}</span>
                        <span style={{ fontSize: '12px', color: '#bbb' }}>({product.reviews})</span>
                      </div>

                      {/* Meta line */}
                      <div style={{ display: 'flex', gap: '10px', marginBottom: '5px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '12px', color: '#888' }}>{product.minOrder}</span>
                        <span style={{ fontSize: '12px', color: '#ccc' }}>·</span>
                        <span style={{ fontSize: '12px', color: '#888' }}>{product.location}</span>
                        <span style={{ fontSize: '12px', color: '#ccc' }}>·</span>
                        <span style={{ fontSize: '12px', color: '#888' }}>{product.category}</span>
                      </div>

                      {/* Free delivery */}
                      {product.freeDelivery && (
                        <p style={{ fontSize: '12px', fontWeight: 600, color: '#16a34a', marginBottom: '6px' }}>Free Delivery</p>
                      )}

                      {/* Spacer */}
                      <div style={{ flex: 1 }} />

                      {/* Price + buttons row */}
                      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: '12px', flexWrap: 'wrap', gap: '10px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                            <span style={{ fontSize: '24px', fontWeight: 800, color: '#111' }}>{product.price}</span>
                            <span style={{ fontSize: '12px', color: '#999' }}>/ {product.unit}</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button style={{
                            padding: '9px 22px', background: '#000', color: '#fff',
                            border: 'none', borderRadius: '999px', fontSize: '13px', fontWeight: 600,
                            cursor: 'pointer', whiteSpace: 'nowrap', transition: 'opacity 0.15s',
                          }}
                            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = '0.8')}
                            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = '1')}
                          >Add to Cart</button>
                          <button style={{
                            padding: '9px 22px', background: '#fff', color: '#000',
                            border: '1.5px solid #000', borderRadius: '999px', fontSize: '13px', fontWeight: 600,
                            cursor: 'pointer', whiteSpace: 'nowrap', transition: 'background 0.15s',
                          }}
                            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = '#f5f5f5')}
                            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = '#fff')}
                          >Get a Quote</button>
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
