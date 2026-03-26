"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

const demoProducts = [
  { id: "1", emoji: "📦", name: "Industrial Conveyor Belt System", seller: "TechMach Industries", tier: "Gold", price: "₹4,200", numPrice: 4200, unit: "/ unit", minOrder: "Min. 5 units", rating: 4.9, reviews: 128, location: "Mumbai", category: "Industrial Equipment", tags: ["heavy-duty", "automation"] },
  { id: "2", emoji: "💻", name: "Commercial LED Display Panels", seller: "BrightView Corp", tier: "Silver", price: "₹890", numPrice: 890, unit: "/ panel", minOrder: "Min. 10 units", rating: 4.7, reviews: 94, location: "Delhi", category: "Electronics & Tech", tags: ["LED", "display"] },
  { id: "3", emoji: "🔩", name: "Stainless Steel Fasteners Set", seller: "MetalPro Solutions", tier: "Gold", price: "₹145", numPrice: 145, unit: "/ kg", minOrder: "Min. 50 kg", rating: 4.8, reviews: 203, location: "Pune", category: "Industrial Equipment", tags: ["fasteners", "steel"] },
  { id: "4", emoji: "🌾", name: "Organic Fertilizer Blend", seller: "GreenGrow Exports", tier: "Bronze", price: "₹55", numPrice: 55, unit: "/ bag", minOrder: "Min. 100 bags", rating: 4.5, reviews: 67, location: "Ahmedabad", category: "Agriculture", tags: ["organic", "fertilizer"] },
  { id: "5", emoji: "🧵", name: "100% Cotton Fabric Roll", seller: "PrimeTex Mills", tier: "Gold", price: "₹3.20", numPrice: 3.2, unit: "/ meter", minOrder: "Min. 500 m", rating: 4.6, reviews: 189, location: "Surat", category: "Textiles & Apparel", tags: ["cotton", "fabric"] },
  { id: "6", emoji: "🏗️", name: "Reinforced Concrete Blocks", seller: "BuildCo Materials", tier: "Silver", price: "₹12", numPrice: 12, unit: "/ piece", minOrder: "Min. 1,000 pcs", rating: 4.4, reviews: 51, location: "Hyderabad", category: "Construction Materials", tags: ["concrete", "blocks"] },
  { id: "7", emoji: "💊", name: "Paracetamol API Bulk Supply", seller: "PharmGrade Labs", tier: "Gold", price: "₹28", numPrice: 28, unit: "/ kg", minOrder: "Min. 25 kg", rating: 4.9, reviews: 312, location: "Bangalore", category: "Pharmaceuticals", tags: ["API", "pharma"] },
  { id: "8", emoji: "🚗", name: "Brake Pad Set — OEM Compatible", seller: "AutoParts Direct", tier: "Silver", price: "₹65", numPrice: 65, unit: "/ set", minOrder: "Min. 20 sets", rating: 4.7, reviews: 147, location: "Chennai", category: "Auto Parts", tags: ["brake", "OEM"] },
  { id: "9", emoji: "🍱", name: "Freeze-Dried Fruit Assortment", seller: "NaturePack Co.", tier: "Bronze", price: "₹18", numPrice: 18, unit: "/ kg", minOrder: "Min. 50 kg", rating: 4.3, reviews: 38, location: "Kolkata", category: "Food & Beverages", tags: ["freeze-dried", "fruit"] },
  { id: "10", emoji: "🖥️", name: "Industrial Touch Screen Panels", seller: "SmartDisplay Tech", tier: "Gold", price: "₹1,250", numPrice: 1250, unit: "/ unit", minOrder: "Min. 3 units", rating: 4.8, reviews: 76, location: "Jaipur", category: "Electronics & Tech", tags: ["touchscreen", "industrial"] },
  { id: "11", emoji: "⚙️", name: "Precision CNC Machine Parts", seller: "MachCraft Works", tier: "Silver", price: "₹320", numPrice: 320, unit: "/ batch", minOrder: "Min. 10 batches", rating: 4.6, reviews: 93, location: "Lucknow", category: "Industrial Equipment", tags: ["CNC", "precision"] },
  { id: "12", emoji: "🌿", name: "Neem Oil Cold Pressed", seller: "NatureExtracts Ltd", tier: "Bronze", price: "₹8", numPrice: 8, unit: "/ liter", minOrder: "Min. 200 L", rating: 4.4, reviews: 44, location: "Mumbai", category: "Agriculture", tags: ["neem", "organic"] },
];

const categoryEmoji: Record<string, string> = {
  "Industrial Equipment": "📦",
  "Electronics & Tech": "💻",
  "Textiles & Apparel": "🧵",
  "Agriculture": "🌾",
  "Construction Materials": "🏗️",
  "Pharmaceuticals": "💊",
  "Auto Parts": "🚗",
  "Food & Beverages": "🍱",
};

type Product = typeof demoProducts[0];

const categories = ["All", "Industrial Equipment", "Electronics & Tech", "Textiles & Apparel", "Agriculture", "Construction Materials", "Pharmaceuticals", "Auto Parts", "Food & Beverages"];
const locationOptions = ["All Locations", "Mumbai", "Delhi", "Bangalore", "Chennai", "Hyderabad", "Pune", "Kolkata", "Ahmedabad", "Surat", "Jaipur", "Lucknow"];
const sortOptions = ["Relevance", "Price: Low to High", "Price: High to Low", "Rating", "Most Reviews"];

const tierStyle: Record<string, { bg: string; color: string }> = {
  Gold:   { bg: 'rgba(245,166,35,0.12)', color: '#b07a0a' },
  Silver: { bg: 'rgba(140,140,152,0.12)', color: '#666670' },
  Bronze: { bg: 'rgba(180,100,60,0.12)',  color: '#a05030' },
};
const tierEmoji: Record<string, string> = { Gold: "🥇", Silver: "🥈", Bronze: "🥉" };

/* Flat grey filter input style — raised shadow on hover */
const filterInputStyle: React.CSSProperties = {
  background: '#d8d8dc',
  color: '#4a4a52',
  borderRadius: '12px',
  boxShadow: 'none',
  transition: 'box-shadow 0.22s ease',
  width: '100%',
  padding: '10px 12px',
  fontSize: '13px',
};
function addHover(el: HTMLElement) {
  el.style.boxShadow = '6px 6px 16px rgba(140,140,152,0.32), -6px -6px 16px rgba(255,255,255,0.88)';
}
function removeHover(el: HTMLElement) {
  el.style.boxShadow = 'none';
}

export default function ProductsPage() {
  const [allProducts, setAllProducts] = useState<Product[]>(demoProducts);
  const [category, setCategory] = useState("All");
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
        .select("id, name, category, price, price_unit, min_order_qty, min_order_unit, location, tags, avg_rating, review_count, sellers(company_name, tier)")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (!error && data && data.length > 0) {
        setAllProducts(
          data.map((p) => {
            const seller = p.sellers as unknown as { company_name: string; tier: string } | null;
            return {
              id: p.id,
              emoji: categoryEmoji[p.category] ?? "📦",
              name: p.name,
              seller: seller?.company_name ?? "Karobarrr Seller",
              tier: seller?.tier ?? "Bronze",
              price: `₹${Number(p.price).toLocaleString("en-IN")}`,
              numPrice: Number(p.price),
              unit: `/ ${p.price_unit}`,
              minOrder: `Min. ${p.min_order_qty} ${p.min_order_unit}`,
              rating: Number(p.avg_rating) || 4.5,
              reviews: p.review_count || 0,
              location: p.location ?? "India",
              category: p.category,
              tags: p.tags ?? [],
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

  return (
    <div className="min-h-screen" style={{ background: '#e4e4e8' }}>

      {/* ── Category tab bar ─────────────────────────────── */}
      <div className="max-w-screen-xl mx-auto px-6 pt-6 pb-2">
        {/* Outer wrapper with vertical padding so the raised shadow isn't clipped */}
        <div style={{ padding: '16px 0' }}>
          <div
            ref={tabBarRef}
            style={{
              background: '#f2f2f5',
              borderRadius: '999px',
              padding: '6px 8px',
              boxShadow: '8px 8px 20px rgba(140,140,152,0.42), -8px -8px 20px rgba(255,255,255,1)',
              display: 'flex',
              gap: '4px',
              overflowX: 'auto',
              scrollSnapType: 'x mandatory',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              cursor: 'grab',
            } as React.CSSProperties}
          >
            {categories.map((cat) => {
              const active = category === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  style={{
                    background: active ? 'linear-gradient(150deg,#2e2e36,#0e0e12)' : 'transparent',
                    color: active ? '#fff' : '#888890',
                    borderRadius: '999px',
                    padding: '8px 18px',
                    fontSize: '13px',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    boxShadow: active ? '0 5px 22px rgba(0,0,0,0.44), 0 2px 7px rgba(0,0,0,0.18)' : 'none',
                    transition: 'background 0.22s, color 0.22s, box-shadow 0.22s',
                    cursor: 'pointer',
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
      <div className="max-w-screen-xl mx-auto px-6 pb-10">
        <div className="flex gap-6">

          {/* ── Sidebar ───────────────────────────────────── */}
          <aside className={`${showFilters ? "block" : "hidden"} lg:block w-full lg:w-60 shrink-0`}>
            <div
              className="sticky top-20 space-y-5"
              style={{
                background: '#f2f2f5',
                boxShadow: '8px 8px 20px rgba(140,140,152,0.42), -8px -8px 20px rgba(255,255,255,1)',
                borderRadius: '24px',
                padding: '22px 18px',
              }}
            >
              {/* Sort */}
              <div>
                <p className="section-label mb-2">Sort by</p>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  style={filterInputStyle}
                  onMouseEnter={(e) => addHover(e.currentTarget)}
                  onMouseLeave={(e) => removeHover(e.currentTarget)}
                >
                  {sortOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* City */}
              <div>
                <p className="section-label mb-2">City</p>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  style={filterInputStyle}
                  onMouseEnter={(e) => addHover(e.currentTarget)}
                  onMouseLeave={(e) => removeHover(e.currentTarget)}
                >
                  {locationOptions.map((loc) => <option key={loc} value={loc}>{loc}</option>)}
                </select>
              </div>

              {/* Price Range */}
              <div>
                <p className="section-label mb-2">Price Range (₹)</p>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    style={{ ...filterInputStyle, width: '50%' }}
                    onMouseEnter={(e) => addHover(e.currentTarget)}
                    onMouseLeave={(e) => removeHover(e.currentTarget)}
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    style={{ ...filterInputStyle, width: '50%' }}
                    onMouseEnter={(e) => addHover(e.currentTarget)}
                    onMouseLeave={(e) => removeHover(e.currentTarget)}
                  />
                </div>
              </div>

              {/* Rating */}
              <div>
                <p className="section-label mb-2">Min. Rating</p>
                <div className="flex gap-1.5 flex-wrap">
                  {[0, 4, 4.5, 4.8].map((r) => {
                    const active = minRating === r;
                    return (
                      <button
                        key={r}
                        onClick={() => setMinRating(r)}
                        style={{
                          background: active ? 'linear-gradient(150deg,#2e2e36,#0e0e12)' : '#d8d8dc',
                          color: active ? '#fff' : '#888890',
                          borderRadius: '12px',
                          padding: '6px 12px',
                          fontSize: '11px',
                          fontWeight: 600,
                          boxShadow: active ? '0 5px 22px rgba(0,0,0,0.44), 0 2px 7px rgba(0,0,0,0.18)' : 'none',
                          transition: 'all 0.22s',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => { if (!active) addHover(e.currentTarget); }}
                        onMouseLeave={(e) => { if (!active) removeHover(e.currentTarget); }}
                      >
                        {r === 0 ? "All" : `⭐ ${r}+`}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mobile filter toggle */}
              <div className="lg:hidden pt-1">
                <button
                  onClick={() => setShowFilters(false)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: '#d8d8dc',
                    color: '#888890',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 600,
                    boxShadow: 'none',
                    cursor: 'pointer',
                    transition: 'box-shadow 0.22s',
                  }}
                  onMouseEnter={(e) => addHover(e.currentTarget)}
                  onMouseLeave={(e) => removeHover(e.currentTarget)}
                >
                  Close Filters
                </button>
              </div>

              {/* Clear */}
              <button
                onClick={() => { setCategory("All"); setLocation("All Locations"); setMinPrice(""); setMaxPrice(""); setMinRating(0); setSort("Relevance"); }}
                style={{
                  width: '100%',
                  padding: '8px',
                  background: 'transparent',
                  color: '#aaaab2',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  boxShadow: 'none',
                  cursor: 'pointer',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#e05050')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#aaaab2')}
              >
                Clear All Filters
              </button>
            </div>
          </aside>

          {/* ── Product grid ──────────────────────────────── */}
          <div className="flex-1 min-w-0">

            {/* Top bar: count + mobile filter button */}
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm" style={{ color: '#aaaab2' }}>
                <span className="font-bold" style={{ color: '#222228' }}>{filtered.length}</span> products found
              </p>
              <button
                className="lg:hidden px-4 py-2 text-xs font-semibold"
                onClick={() => setShowFilters(!showFilters)}
                style={{
                  background: 'linear-gradient(150deg,#2e2e36,#0e0e12)',
                  color: '#fff',
                  borderRadius: '999px',
                  boxShadow: 'none',
                  cursor: 'pointer',
                  transition: 'box-shadow 0.24s ease',
                }}
              >
                🎛️ Filters
              </button>
            </div>

            {filtered.length === 0 ? (
              <div
                className="text-center py-20"
                style={{ background: '#f2f2f5', borderRadius: '24px', boxShadow: '8px 8px 20px rgba(140,140,152,0.42), -8px -8px 20px rgba(255,255,255,1)' }}
              >
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-lg font-bold mb-1" style={{ color: '#4a4a52' }}>No products found</h3>
                <p className="text-sm" style={{ color: '#aaaab2' }}>Try adjusting your filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                {filtered.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    className="group block"
                    style={{
                      background: '#f2f2f5',
                      boxShadow: '8px 8px 20px rgba(140,140,152,0.42), -8px -8px 20px rgba(255,255,255,1)',
                      borderRadius: '24px',
                      transition: 'transform 0.22s cubic-bezier(0.4,0,0.2,1)',
                    }}
                    onMouseEnter={(e) => (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-4px)'}
                    onMouseLeave={(e) => (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)'}
                  >
                    {/* Inner clip wrapper — keeps rounded corners without touching the outer shadow */}
                    <div style={{ borderRadius: '24px', overflow: 'hidden' }}>

                      {/* Image area */}
                      <div
                        className="flex items-center justify-center"
                        style={{ background: '#e4e4e8', height: '200px', fontSize: '60px', borderRadius: '24px 24px 0 0' }}
                      >
                        {product.emoji}
                      </div>

                      {/* Content */}
                      <div style={{ padding: '18px 20px 22px', background: '#f2f2f5' }}>
                        <div className="flex items-center gap-1.5 mb-2">
                          <span className="text-xs" style={{ color: '#aaaab2' }}>{product.seller}</span>
                          <span
                            className="inline-flex items-center gap-0.5 px-2 py-0.5 text-xs font-medium"
                            style={{ borderRadius: '999px', background: tierStyle[product.tier]?.bg, color: tierStyle[product.tier]?.color }}
                          >
                            {tierEmoji[product.tier]} {product.tier}
                          </span>
                        </div>
                        <h3 className="font-semibold text-sm leading-snug mb-3" style={{ color: '#222228' }}>{product.name}</h3>
                        <div className="mb-0.5">
                          <span className="text-xl" style={{ fontWeight: 400, color: '#222228' }}>{product.price}</span>
                          <span className="text-xs ml-1" style={{ color: '#aaaab2' }}>{product.unit}</span>
                        </div>
                        <div className="text-xs mb-4" style={{ color: '#aaaab2' }}>{product.minOrder}</div>
                        <div className="flex items-center justify-between text-xs mb-4" style={{ color: '#888890' }}>
                          <span>⭐ {product.rating} ({product.reviews})</span>
                          <span>📍 {product.location}</span>
                        </div>
                        <div
                          className="text-center py-2.5 text-sm font-semibold"
                          style={{
                            background: 'linear-gradient(150deg,#2e2e36,#0e0e12)',
                            color: '#fff',
                            borderRadius: '999px',
                          }}
                        >
                          View Details
                        </div>
                      </div>

                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
