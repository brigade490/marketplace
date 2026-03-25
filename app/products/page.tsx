"use client";

import Link from "next/link";
import { useState } from "react";

const allProducts = [
  { id: "1", emoji: "📦", name: "Industrial Conveyor Belt System", seller: "TechMach Industries", tier: "Gold", price: "₹4,200", numPrice: 4200, unit: "/ unit", minOrder: "Min. 5 units", rating: 4.9, reviews: 128, location: "Germany", category: "Industrial Equipment", tags: ["heavy-duty", "automation"] },
  { id: "2", emoji: "💻", name: "Commercial LED Display Panels", seller: "BrightView Corp", tier: "Silver", price: "₹890", numPrice: 890, unit: "/ panel", minOrder: "Min. 10 units", rating: 4.7, reviews: 94, location: "China", category: "Electronics & Tech", tags: ["LED", "display"] },
  { id: "3", emoji: "🔩", name: "Stainless Steel Fasteners Set", seller: "MetalPro Solutions", tier: "Gold", price: "₹145", numPrice: 145, unit: "/ kg", minOrder: "Min. 50 kg", rating: 4.8, reviews: 203, location: "India", category: "Industrial Equipment", tags: ["fasteners", "steel"] },
  { id: "4", emoji: "🌾", name: "Organic Fertilizer Blend", seller: "GreenGrow Exports", tier: "Bronze", price: "₹55", numPrice: 55, unit: "/ bag", minOrder: "Min. 100 bags", rating: 4.5, reviews: 67, location: "Brazil", category: "Agriculture", tags: ["organic", "fertilizer"] },
  { id: "5", emoji: "🧵", name: "100% Cotton Fabric Roll", seller: "PrimeTex Mills", tier: "Gold", price: "₹3.20", numPrice: 3.2, unit: "/ meter", minOrder: "Min. 500 m", rating: 4.6, reviews: 189, location: "Bangladesh", category: "Textiles & Apparel", tags: ["cotton", "fabric"] },
  { id: "6", emoji: "🏗️", name: "Reinforced Concrete Blocks", seller: "BuildCo Materials", tier: "Silver", price: "₹12", numPrice: 12, unit: "/ piece", minOrder: "Min. 1,000 pcs", rating: 4.4, reviews: 51, location: "Turkey", category: "Construction Materials", tags: ["concrete", "blocks"] },
  { id: "7", emoji: "💊", name: "Paracetamol API Bulk Supply", seller: "PharmGrade Labs", tier: "Gold", price: "₹28", numPrice: 28, unit: "/ kg", minOrder: "Min. 25 kg", rating: 4.9, reviews: 312, location: "India", category: "Pharmaceuticals", tags: ["API", "pharma"] },
  { id: "8", emoji: "🚗", name: "Brake Pad Set — OEM Compatible", seller: "AutoParts Direct", tier: "Silver", price: "₹65", numPrice: 65, unit: "/ set", minOrder: "Min. 20 sets", rating: 4.7, reviews: 147, location: "South Korea", category: "Auto Parts", tags: ["brake", "OEM"] },
  { id: "9", emoji: "🍱", name: "Freeze-Dried Fruit Assortment", seller: "NaturePack Co.", tier: "Bronze", price: "₹18", numPrice: 18, unit: "/ kg", minOrder: "Min. 50 kg", rating: 4.3, reviews: 38, location: "Chile", category: "Food & Beverages", tags: ["freeze-dried", "fruit"] },
  { id: "10", emoji: "🖥️", name: "Industrial Touch Screen Panels", seller: "SmartDisplay Tech", tier: "Gold", price: "₹1,250", numPrice: 1250, unit: "/ unit", minOrder: "Min. 3 units", rating: 4.8, reviews: 76, location: "Taiwan", category: "Electronics & Tech", tags: ["touchscreen", "industrial"] },
  { id: "11", emoji: "⚙️", name: "Precision CNC Machine Parts", seller: "MachCraft Works", tier: "Silver", price: "₹320", numPrice: 320, unit: "/ batch", minOrder: "Min. 10 batches", rating: 4.6, reviews: 93, location: "Czech Republic", category: "Industrial Equipment", tags: ["CNC", "precision"] },
  { id: "12", emoji: "🌿", name: "Neem Oil Cold Pressed", seller: "NatureExtracts Ltd", tier: "Bronze", price: "₹8", numPrice: 8, unit: "/ liter", minOrder: "Min. 200 L", rating: 4.4, reviews: 44, location: "India", category: "Agriculture", tags: ["neem", "organic"] },
];

const categories = ["All", "Industrial Equipment", "Electronics & Tech", "Textiles & Apparel", "Agriculture", "Construction Materials", "Pharmaceuticals", "Auto Parts", "Food & Beverages"];
const locations = ["All", "India", "China", "Germany", "Bangladesh", "Brazil", "Turkey", "South Korea", "Taiwan", "Chile", "Czech Republic"];
const sortOptions = ["Relevance", "Price: Low to High", "Price: High to Low", "Rating", "Most Reviews"];

const tierColors: Record<string, string> = {
  Gold: "bg-yellow-100 text-yellow-800 border-yellow-300",
  Silver: "bg-gray-100 text-gray-700 border-gray-300",
  Bronze: "bg-orange-100 text-orange-700 border-orange-300",
};
const tierEmoji: Record<string, string> = { Gold: "🥇", Silver: "🥈", Bronze: "🥉" };

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [location, setLocation] = useState("All");
  const [sort, setSort] = useState("Relevance");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minRating, setMinRating] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  let filtered = allProducts.filter((p) => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.seller.toLowerCase().includes(search.toLowerCase()) || p.tags.some(t => t.includes(search.toLowerCase()));
    const matchCat = category === "All" || p.category === category;
    const matchLoc = location === "All" || p.location === location;
    const matchMin = !minPrice || p.numPrice >= Number(minPrice);
    const matchMax = !maxPrice || p.numPrice <= Number(maxPrice);
    const matchRating = p.rating >= minRating;
    return matchSearch && matchCat && matchLoc && matchMin && matchMax && matchRating;
  });

  if (sort === "Price: Low to High") filtered = [...filtered].sort((a, b) => a.numPrice - b.numPrice);
  else if (sort === "Price: High to Low") filtered = [...filtered].sort((a, b) => b.numPrice - a.numPrice);
  else if (sort === "Rating") filtered = [...filtered].sort((a, b) => b.rating - a.rating);
  else if (sort === "Most Reviews") filtered = [...filtered].sort((a, b) => b.reviews - a.reviews);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page header */}
      <div className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl sm:text-3xl font-black mb-4">Browse Products</h1>
          {/* Search bar */}
          <div className="flex gap-2 max-w-2xl">
            <div className="flex-1 flex items-center gap-2 px-4 py-3 bg-white rounded-xl">
              <span>🔍</span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by product, seller, or keyword..."
                className="flex-1 text-sm text-gray-900 placeholder-gray-400 outline-none bg-transparent"
              />
              {search && (
                <button onClick={() => setSearch("")} className="text-gray-400 hover:text-gray-600 text-xs">✕</button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-3 rounded-xl bg-yellow-400 text-gray-900 font-semibold text-sm hover:bg-yellow-300 transition-colors"
            >
              🎛️ Filters
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6">
          {/* Sidebar filters */}
          <aside className={`${showFilters ? "block" : "hidden"} lg:block w-full lg:w-64 shrink-0`}>
            <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-6 sticky top-20">
              <div>
                <h3 className="text-sm font-black text-gray-900 mb-3">Category</h3>
                <div className="space-y-1.5">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${category === cat ? "bg-yellow-400 text-gray-900" : "text-gray-600 hover:bg-gray-50"}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-black text-gray-900 mb-3">Location</h3>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs text-gray-700 focus:outline-none focus:border-yellow-400"
                >
                  {locations.map((loc) => <option key={loc} value={loc}>{loc}</option>)}
                </select>
              </div>

              <div>
                <h3 className="text-sm font-black text-gray-900 mb-3">Price Range (USD)</h3>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-yellow-400"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-yellow-400"
                  />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-black text-gray-900 mb-3">Min. Rating</h3>
                <div className="flex gap-2 flex-wrap">
                  {[0, 4, 4.5, 4.8].map((r) => (
                    <button
                      key={r}
                      onClick={() => setMinRating(r)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${minRating === r ? "bg-yellow-400 text-gray-900" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                    >
                      {r === 0 ? "All" : `⭐ ${r}+`}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => { setSearch(""); setCategory("All"); setLocation("All"); setMinPrice(""); setMaxPrice(""); setMinRating(0); setSort("Relevance"); }}
                className="w-full py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-500 hover:border-red-300 hover:text-red-500 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-4 gap-3">
              <p className="text-sm text-gray-500">
                <span className="font-semibold text-gray-900">{filtered.length}</span> products found
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Sort:</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-gray-200 text-xs text-gray-700 focus:outline-none focus:border-yellow-400 bg-white"
                >
                  {sortOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {/* Product grid */}
            {filtered.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-lg font-bold text-gray-700">No products found</h3>
                <p className="text-sm text-gray-400 mt-1">Try adjusting your filters or search terms.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col"
                  >
                    <div className="bg-gray-50 flex items-center justify-center py-8 text-5xl">
                      {product.emoji}
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-1">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mb-3">
                        <span className="text-xs text-gray-400">{product.seller}</span>
                        <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs font-medium border ${tierColors[product.tier]}`}>
                          {tierEmoji[product.tier]} {product.tier}
                        </span>
                      </div>
                      <div className="mb-1">
                        <span className="text-xl font-black text-gray-900">{product.price}</span>
                        <span className="text-xs text-gray-400 ml-1">{product.unit}</span>
                      </div>
                      <div className="text-xs text-gray-400 mb-3">{product.minOrder}</div>
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-4 mt-auto">
                        <span>⭐ {product.rating} ({product.reviews})</span>
                        <span>📍 {product.location}</span>
                      </div>
                      <Link
                        href={`/products/${product.id}`}
                        className="block text-center px-4 py-2.5 rounded-full bg-gray-900 text-white text-sm font-semibold hover:bg-yellow-400 hover:text-gray-900 transition-colors"
                      >
                        View Details
                      </Link>
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
