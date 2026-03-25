import Link from "next/link";

const categories = [
  { emoji: "🏭", name: "Industrial Equipment", count: "2,400+ products" },
  { emoji: "🖥️", name: "Electronics & Tech", count: "5,800+ products" },
  { emoji: "🧵", name: "Textiles & Apparel", count: "3,200+ products" },
  { emoji: "🌿", name: "Agriculture", count: "1,900+ products" },
  { emoji: "🏗️", name: "Construction Materials", count: "4,100+ products" },
  { emoji: "💊", name: "Pharmaceuticals", count: "2,700+ products" },
  { emoji: "🚗", name: "Auto Parts", count: "6,300+ products" },
  { emoji: "🍱", name: "Food & Beverages", count: "3,500+ products" },
];

const featuredProducts = [
  {
    id: "1",
    emoji: "📦",
    name: "Industrial Conveyor Belt System",
    seller: "TechMach Industries",
    tier: "Gold",
    price: "$4,200",
    unit: "/ unit",
    minOrder: "Min. 5 units",
    rating: 4.9,
    reviews: 128,
    location: "Germany",
  },
  {
    id: "2",
    emoji: "💻",
    name: "Commercial LED Display Panels",
    seller: "BrightView Corp",
    tier: "Silver",
    price: "$890",
    unit: "/ panel",
    minOrder: "Min. 10 units",
    rating: 4.7,
    reviews: 94,
    location: "China",
  },
  {
    id: "3",
    emoji: "🔩",
    name: "Stainless Steel Fasteners Set",
    seller: "MetalPro Solutions",
    tier: "Gold",
    price: "$145",
    unit: "/ kg",
    minOrder: "Min. 50 kg",
    rating: 4.8,
    reviews: 203,
    location: "India",
  },
  {
    id: "4",
    emoji: "🌾",
    name: "Organic Fertilizer Blend",
    seller: "GreenGrow Exports",
    tier: "Bronze",
    price: "$55",
    unit: "/ bag",
    minOrder: "Min. 100 bags",
    rating: 4.5,
    reviews: 67,
    location: "Brazil",
  },
];

const howItWorksSteps = [
  {
    step: "01",
    emoji: "🔍",
    title: "Search & Discover",
    description: "Browse thousands of verified B2B products or post your specific requirement to attract seller proposals.",
  },
  {
    step: "02",
    emoji: "🤝",
    title: "Connect with Verified Sellers",
    description: "All sellers go through our verification process. Look for Gold, Silver, and Bronze badges for trust levels.",
  },
  {
    step: "03",
    emoji: "📋",
    title: "Place Your Order",
    description: "Negotiate terms, place your order securely, and track progress from confirmation to delivery.",
  },
  {
    step: "04",
    emoji: "⭐",
    title: "Review & Repeat",
    description: "Rate your experience to help build a trustworthy marketplace for everyone.",
  },
];

const tierColors: Record<string, string> = {
  Gold: "bg-yellow-100 text-yellow-800 border-yellow-300",
  Silver: "bg-gray-100 text-gray-700 border-gray-300",
  Bronze: "bg-orange-100 text-orange-700 border-orange-300",
};

const tierEmoji: Record<string, string> = {
  Gold: "🥇",
  Silver: "🥈",
  Bronze: "🥉",
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Hero ── */}
      <section className="bg-gray-900 text-white relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-yellow-400 blur-3xl translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-yellow-400 blur-3xl -translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/20 border border-yellow-400/30 text-yellow-400 text-sm font-medium mb-6">
              <span>✅</span>
              <span>Trusted by 12,000+ businesses worldwide</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight mb-6">
              The Smarter Way to{" "}
              <span className="text-yellow-400">Source B2B</span>{" "}
              Products
            </h1>

            <p className="text-gray-300 text-lg sm:text-xl leading-relaxed mb-8 max-w-2xl">
              Connect with verified suppliers, post your requirements, and close deals faster. Bexo makes B2B trade transparent, safe, and efficient.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-yellow-400 text-gray-900 font-bold text-base hover:bg-yellow-300 transition-colors"
              >
                <span>🔍</span> Browse Products
              </Link>
              <Link
                href="/requirements"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 text-white font-semibold text-base hover:bg-white/20 border border-white/20 transition-colors"
              >
                <span>📋</span> Post a Requirement
              </Link>
              <Link
                href="/auth/seller"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-yellow-400/40 text-yellow-300 font-semibold text-base hover:border-yellow-400 hover:text-yellow-400 transition-colors"
              >
                <span>🏪</span> Start Selling
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-white/10 max-w-xl">
              {[
                { value: "48K+", label: "Products Listed" },
                { value: "12K+", label: "Verified Sellers" },
                { value: "98%", label: "Satisfaction Rate" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl font-black text-yellow-400">{stat.value}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900">Browse by Category</h2>
            <p className="text-gray-500 mt-1">Explore products across all major B2B industries</p>
          </div>
          <Link href="/products" className="text-sm font-semibold text-yellow-600 hover:text-yellow-700">
            View all →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              href={`/products?category=${encodeURIComponent(cat.name)}`}
              className="group flex flex-col items-start gap-3 p-5 bg-white rounded-2xl border border-gray-100 hover:border-yellow-300 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
            >
              <span className="text-3xl">{cat.emoji}</span>
              <div>
                <div className="font-semibold text-gray-900 text-sm group-hover:text-yellow-700 transition-colors">
                  {cat.name}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">{cat.count}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-black">How Bexo Works</h2>
            <p className="text-gray-400 mt-2">Simple, transparent, and secure B2B trading</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorksSteps.map((step, i) => (
              <div key={step.step} className="relative">
                {/* Connector line */}
                {i < howItWorksSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-yellow-400/20 z-10 -translate-y-1/2" style={{ width: "calc(100% - 4rem)" }} />
                )}
                <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-yellow-400/40 transition-colors">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">{step.emoji}</span>
                    <span className="text-xs font-black text-yellow-400 opacity-60">{step.step}</span>
                  </div>
                  <h3 className="font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Products ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900">Featured Products</h2>
            <p className="text-gray-500 mt-1">Top-rated listings from verified sellers</p>
          </div>
          <Link href="/products" className="text-sm font-semibold text-yellow-600 hover:text-yellow-700">
            View all →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col"
            >
              {/* Product visual */}
              <div className="bg-gray-50 flex items-center justify-center py-8 text-5xl">
                {product.emoji}
              </div>

              <div className="p-4 flex flex-col flex-1">
                <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-1">
                  {product.name}
                </h3>

                {/* Seller + tier */}
                <div className="flex items-center gap-1.5 mb-3">
                  <span className="text-xs text-gray-400">{product.seller}</span>
                  <span
                    className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs font-medium border ${tierColors[product.tier]}`}
                  >
                    {tierEmoji[product.tier]} {product.tier}
                  </span>
                </div>

                {/* Price */}
                <div className="mb-1">
                  <span className="text-xl font-black text-gray-900">{product.price}</span>
                  <span className="text-xs text-gray-400 ml-1">{product.unit}</span>
                </div>
                <div className="text-xs text-gray-400 mb-3">{product.minOrder}</div>

                {/* Rating + location */}
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4 mt-auto">
                  <span>⭐ {product.rating} ({product.reviews})</span>
                  <span>📍 {product.location}</span>
                </div>

                <Link
                  href={`/products/${product.id}`}
                  className="block text-center px-4 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-yellow-400 hover:text-gray-900 transition-colors"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Trust Banner ── */}
      <section className="bg-yellow-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-black text-gray-900">Ready to grow your B2B business?</h2>
              <p className="text-gray-800 mt-1">Join thousands of verified sellers and buyers on Bexo today.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/auth/buyer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gray-900 text-white font-bold hover:bg-gray-800 transition-colors"
              >
                Join as Buyer
              </Link>
              <Link
                href="/auth/seller"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-gray-900 font-bold hover:bg-gray-100 border border-gray-200 transition-colors"
              >
                Start Selling
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Fraud / Trust indicators ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { emoji: "🛡️", title: "Fraud Monitoring", desc: "AI-powered fraud detection flags suspicious listings before they reach you." },
            { emoji: "✅", title: "Verified Sellers", desc: "Every seller passes a rigorous identity and business verification process." },
            { emoji: "🔒", title: "Secure Transactions", desc: "End-to-end encrypted communications and secure escrow payment support." },
          ].map((item) => (
            <div key={item.title} className="flex gap-4 p-5 bg-white rounded-2xl border border-gray-100">
              <span className="text-2xl mt-0.5">{item.emoji}</span>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">{item.title}</h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
