"use client";

import Link from "next/link";
import { useState } from "react";

const allProducts = [
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

const categories = ["All", "Industrial Equipment", "Electronics & Tech", "Textiles & Apparel", "Agriculture", "Construction Materials", "Pharmaceuticals", "Auto Parts", "Food & Beverages"];
const locationOptions = ["All Locations", "Mumbai", "Delhi", "Bangalore", "Chennai", "Hyderabad", "Pune", "Kolkata", "Ahmedabad", "Surat", "Jaipur", "Lucknow"];
const sortOptions = ["Relevance", "Price: Low to High", "Price: High to Low", "Rating", "Most Reviews"];

const tierColors: Record<string, string> = {
  Gold: "bg-yellow-100 text-yellow-800 border-yellow-300",
  Silver: "bg-gray-100 text-gray-700 border-gray-300",
  Bronze: "bg-orange-100 text-orange-700 border-orange-300",
};
const tierEmoji: Record<string, string> = { Gold: "🥇", Silver: "🥈", Bronze: "🥉" };

export default function ProductsPage() {
  const [category, setCategory] = useState("All");
  const [location, setLocation] = useState("All Locations");
  const [sort, setSort] = useState("Relevance");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minRating, setMinRating] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  let filtered = allProducts.filter((p) => {
    const matchCat = category === "All" || p.category === category;
    const matchLoc = location === "All Locations" || p.location === location;
    const matchMin = !minPrice || p.numPrice >= Number(minPrice);
    const matchMax = !maxPrice || p.numPrice <= Number(maxPrice);
    const matchRating = p.rating >= minRating;
    return matchCat && matchLoc && matchMin && matchMax && matchRating;
  });

  if (sort === "Price: Low to High") filtered = [...filtered].sort((a, b) => a.numPrice - b.numPrice);
  else if (sort === "Price: High to Low") filtered = [...filtered].sort((a, b) => b.numPrice - a.numPrice);
  else if (sort === "Rating") filtered = [...filtered].sort((a, b) => b.rating - a.rating);
  else if (sort === "Most Reviews") filtered = [...filtered].sort((a, b) => b.reviews - a.reviews);

  return (
    <div className="min-h-screen" style={{ background: '#f7f7f8' }}>
      {/* Page title bar */}
      <div className="bg-white border-b border-gray-100 py-6 px-6">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <h1 className="text-2xl font-black text-black">Browse Products</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden px-4 py-2 text-sm font-semibold"
              style={{ background: '#000000', color: '#ffffff', borderRadius: '8px' }}
            >
              🎛️ Filters
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Sort:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="px-3 py-2 text-xs text-gray-700 outline-none bg-white"
                style={{ border: '1.5px solid #e5e7eb', borderRadius: '8px' }}
              >
                {sortOptions.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-6 py-8">
        <div className="flex gap-6">
          {/* Sidebar filters */}
          <aside className={`${showFilters ? "block" : "hidden"} lg:block w-full lg:w-56 shrink-0`}>
            <div
              className="bg-white p-5 space-y-6 sticky top-20"
              style={{ borderRadius: '12px', border: '1px solid #f0f0f0' }}
            >
              <div>
                <h3 className="text-xs font-black text-black mb-3 uppercase tracking-wide">Category</h3>
                <div className="space-y-0.5">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className="w-full text-left px-3 py-2 text-xs font-medium transition-colors"
                      style={{
                        borderRadius: '6px',
                        background: category === cat ? '#000000' : 'transparent',
                        color: category === cat ? '#ffffff' : '#6b7280',
                      }}
                      onMouseEnter={(e) => { if (category !== cat) e.currentTarget.style.background = '#f7f7f8'; }}
                      onMouseLeave={(e) => { if (category !== cat) e.currentTarget.style.background = 'transparent'; }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-black text-black mb-3 uppercase tracking-wide">City</h3>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 text-xs text-gray-700 bg-white outline-none"
                  style={{ border: '1.5px solid #e5e7eb', borderRadius: '8px' }}
                >
                  {locationOptions.map((loc) => <option key={loc} value={loc}>{loc}</option>)}
                </select>
              </div>

              <div>
                <h3 className="text-xs font-black text-black mb-3 uppercase tracking-wide">Price Range (₹)</h3>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white outline-none"
                    style={{ border: '1.5px solid #e5e7eb', borderRadius: '8px' }}
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white outline-none"
                    style={{ border: '1.5px solid #e5e7eb', borderRadius: '8px' }}
                  />
                </div>
              </div>

              <div>
                <h3 className="text-xs font-black text-black mb-3 uppercase tracking-wide">Min. Rating</h3>
                <div className="flex gap-2 flex-wrap">
                  {[0, 4, 4.5, 4.8].map((r) => (
                    <button
                      key={r}
                      onClick={() => setMinRating(r)}
                      className="px-3 py-1.5 text-xs font-medium transition-colors"
                      style={{
                        borderRadius: '6px',
                        background: minRating === r ? '#000000' : '#f7f7f8',
                        color: minRating === r ? '#ffffff' : '#6b7280',
                      }}
                    >
                      {r === 0 ? "All" : `⭐ ${r}+`}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => { setCategory("All"); setLocation("All Locations"); setMinPrice(""); setMaxPrice(""); setMinRating(0); setSort("Relevance"); }}
                className="w-full py-2 text-xs font-semibold text-gray-400 transition-colors"
                style={{ background: 'transparent', border: '1.5px solid #e5e7eb', borderRadius: '8px', color: '#9ca3af' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = '#fca5a5'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#9ca3af'; e.currentTarget.style.borderColor = '#e5e7eb'; }}
              >
                Clear All Filters
              </button>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-500 mb-5">
              <span className="font-semibold text-black">{filtered.length}</span> products found
            </p>

            {filtered.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-lg font-bold text-gray-700">No products found</h3>
                <p className="text-sm text-gray-400 mt-1">Try adjusting your filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    className="group block bg-white overflow-hidden hover:shadow-xl transition-all duration-200"
                    style={{ borderRadius: '14px', border: '1px solid #f0f0f0' }}
                  >
                    {/* Image area */}
                    <div
                      className="flex items-center justify-center"
                      style={{ background: '#f7f7f8', height: '220px', fontSize: '72px' }}
                    >
                      {product.emoji}
                    </div>

                    {/* Info area */}
                    <div style={{ padding: '20px 20px 24px' }}>
                      <div className="flex items-center gap-1.5 mb-2">
                        <span className="text-xs text-gray-400">{product.seller}</span>
                        <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 text-xs font-medium border ${tierColors[product.tier]}`} style={{ borderRadius: '20px' }}>
                          {tierEmoji[product.tier]} {product.tier}
                        </span>
                      </div>

                      <h3 className="font-semibold text-black text-sm leading-snug mb-4">
                        {product.name}
                      </h3>

                      <div className="mb-1">
                        <span className="text-2xl text-black" style={{ fontWeight: 400 }}>{product.price}</span>
                        <span className="text-xs text-gray-400 ml-1">{product.unit}</span>
                      </div>
                      <div className="text-xs text-gray-400 mb-5">{product.minOrder}</div>

                      <div className="flex items-center justify-between text-xs text-gray-500 mb-5">
                        <span>⭐ {product.rating} ({product.reviews})</span>
                        <span>📍 {product.location}</span>
                      </div>

                      <div
                        className="block text-center py-3 text-sm font-semibold text-white transition-colors group-hover:opacity-90"
                        style={{ background: '#000000', borderRadius: '999px' }}
                      >
                        View Details
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
