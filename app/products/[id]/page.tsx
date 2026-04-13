"use client";

import Link from "next/link";
import { use, useState } from "react";

const products: Record<string, {
  id: string; emoji: string; name: string; seller: string; tier: string;
  price: string; unit: string; minOrder: string; rating: number;
  reviews: number; location: string; category: string;
  description: string; specs: { label: string; value: string }[];
  reviewList: { author: string; rating: number; comment: string; date: string }[];
  flagged: boolean;
}> = {
  "1": {
    id: "1", emoji: "📦", name: "Industrial Conveyor Belt System", seller: "TechMach Industries",
    tier: "Gold", price: "$4,200", unit: "/ unit", minOrder: "Min. 5 units",
    rating: 4.9, reviews: 128, location: "Germany", category: "Industrial Equipment",
    description: "Heavy-duty industrial conveyor belt system engineered for high-throughput manufacturing environments. Suitable for automotive, logistics, and food processing plants. Built with German engineering precision — designed to operate continuously for 80,000+ hours.",
    specs: [
      { label: "Belt Width", value: "600mm – 1,200mm" },
      { label: "Speed", value: "0.1 – 2.5 m/s" },
      { label: "Load Capacity", value: "Up to 2,500 kg/m" },
      { label: "Motor Power", value: "7.5 – 55 kW" },
      { label: "Material", value: "Steel frame, Polyurethane belt" },
      { label: "Certification", value: "CE, ISO 9001" },
      { label: "Warranty", value: "3 years" },
      { label: "Lead Time", value: "30–45 days" },
    ],
    reviewList: [
      { author: "📦 Hartmann GmbH", rating: 5, comment: "Outstanding quality. Delivered on time, exactly as spec'd. Our production throughput improved by 28%.", date: "Jan 2026" },
      { author: "🏭 FabriMax Inc.", rating: 5, comment: "TechMach Industries is a professional partner. Easy to work with and excellent post-sale support.", date: "Dec 2025" },
      { author: "🚚 LogisticaPlus", rating: 4, comment: "Good quality. Minor documentation delay but product itself is excellent.", date: "Nov 2025" },
    ],
    flagged: false,
  },
  "2": {
    id: "2", emoji: "💻", name: "Commercial LED Display Panels", seller: "BrightView Corp",
    tier: "Silver", price: "$890", unit: "/ panel", minOrder: "Min. 10 units",
    rating: 4.7, reviews: 94, location: "China", category: "Electronics & Tech",
    description: "High-brightness commercial-grade LED display panels designed for retail, hospitality, and outdoor advertising. Features real-time content management via cloud dashboard.",
    specs: [
      { label: "Size", value: "55\" / 65\" / 75\"" },
      { label: "Brightness", value: "2,500 nit" },
      { label: "Resolution", value: "4K UHD (3840x2160)" },
      { label: "Connectivity", value: "WiFi 6, BT 5.0, HDMI 2.1" },
      { label: "IP Rating", value: "IP55 (outdoor)" },
      { label: "Certification", value: "CE, FCC, RoHS" },
      { label: "Warranty", value: "2 years" },
      { label: "Lead Time", value: "15–20 days" },
    ],
    reviewList: [
      { author: "🏨 HotelStar Group", rating: 5, comment: "Installed 40 panels across our lobby — stunning display quality. Easy to manage remotely.", date: "Feb 2026" },
      { author: "🛍️ RetailMax", rating: 4, comment: "Good panels, solid build. Would buy again.", date: "Jan 2026" },
    ],
    flagged: false,
  },
};

// Default fallback for unlisted IDs
function getProduct(id: string) {
  return products[id] ?? {
    id, emoji: "📦", name: `Product #${id}`, seller: "Bexo Seller",
    tier: "Bronze", price: "$100", unit: "/ unit", minOrder: "Min. 10 units",
    rating: 4.5, reviews: 20, location: "Global", category: "General",
    description: "Product details will be available once connected to Supabase.",
    specs: [{ label: "Status", value: "Demo data" }],
    reviewList: [{ author: "🙋 Sample Buyer", rating: 4, comment: "Great product!", date: "Mar 2026" }],
    flagged: false,
  };
}

const tierColors: Record<string, string> = {
  Gold: "bg-yellow-100 text-yellow-800 border-yellow-300",
  Silver: "bg-gray-100 text-gray-700 border-gray-300",
  Bronze: "bg-orange-100 text-orange-700 border-orange-300",
};
const tierEmoji: Record<string, string> = { Gold: "🥇", Silver: "🥈", Bronze: "🥉" };

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const product = getProduct(id);

  const [tab, setTab] = useState<"overview" | "specs" | "reviews">("overview");
  const [quantity, setQuantity] = useState(1);
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [flagReason, setFlagReason] = useState("");
  const [flagged, setFlaggedState] = useState(false);

  function handleOrder() {
    window.location.href = "/auth/buyer";
  }

  function handleContact() {
    window.location.href = "/auth/buyer";
  }

  function handleFlag(e: React.FormEvent) {
    e.preventDefault();
    setFlaggedState(true);
    setShowFlagModal(false);
    setFlagReason("");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2 text-xs text-gray-400">
          <Link href="/" className="hover:text-gray-700">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-gray-700">Products</Link>
          <span>/</span>
          <span className="text-gray-700 font-medium truncate max-w-xs">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left — product visual + tabs */}
          <div className="flex-1 min-w-0">
            {/* Product card visual */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-6">
              <div className="bg-gray-50 flex items-center justify-center py-20 text-8xl">
                {product.emoji}
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="flex border-b border-gray-100">
                {(["overview", "specs", "reviews"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`flex-1 py-3.5 text-sm font-semibold capitalize transition-colors ${tab === t ? "border-b-2 border-yellow-400 text-gray-900 bg-yellow-50/50" : "text-gray-500 hover:text-gray-700"}`}
                  >
                    {t} {t === "reviews" && `(${product.reviews})`}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {tab === "overview" && (
                  <div>
                    <h3 className="font-bold text-gray-900 mb-3">Product Description</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>

                    <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                      <h4 className="text-xs font-black text-gray-900 uppercase tracking-wide mb-3">Key Details</h4>
                      <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                        <div className="text-xs text-gray-500">Category</div>
                        <div className="text-xs font-medium text-gray-900">{product.category}</div>
                        <div className="text-xs text-gray-500">Location</div>
                        <div className="text-xs font-medium text-gray-900">📍 {product.location}</div>
                        <div className="text-xs text-gray-500">Min. Order</div>
                        <div className="text-xs font-medium text-gray-900">{product.minOrder}</div>
                        <div className="text-xs text-gray-500">Rating</div>
                        <div className="text-xs font-medium text-gray-900">⭐ {product.rating} ({product.reviews} reviews)</div>
                      </div>
                    </div>
                  </div>
                )}

                {tab === "specs" && (
                  <div>
                    <h3 className="font-bold text-gray-900 mb-4">Technical Specifications</h3>
                    <div className="divide-y divide-gray-100">
                      {product.specs.map((spec) => (
                        <div key={spec.label} className="flex py-3 gap-4">
                          <div className="w-40 shrink-0 text-xs text-gray-500 font-medium">{spec.label}</div>
                          <div className="text-xs text-gray-900 font-semibold">{spec.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {tab === "reviews" && (
                  <div>
                    <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
                      <div className="text-center">
                        <div className="text-4xl font-black text-gray-900">{product.rating}</div>
                        <div className="text-yellow-400 text-lg">{"⭐".repeat(Math.round(product.rating))}</div>
                        <div className="text-xs text-gray-400">{product.reviews} reviews</div>
                      </div>
                      <div className="flex-1">
                        {[5, 4, 3, 2, 1].map((star) => {
                          const pct = star === 5 ? 72 : star === 4 ? 20 : star === 3 ? 6 : 2;
                          return (
                            <div key={star} className="flex items-center gap-2 mb-1">
                              <span className="text-xs text-gray-400 w-4">{star}★</span>
                              <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${pct}%` }} />
                              </div>
                              <span className="text-xs text-gray-400 w-7">{pct}%</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-4">
                      {product.reviewList.map((r, i) => (
                        <div key={i} className="p-4 bg-gray-50 rounded-xl">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-gray-900">{r.author}</span>
                            <span className="text-xs text-gray-400">{r.date}</span>
                          </div>
                          <div className="text-yellow-400 text-sm mb-2">{"⭐".repeat(r.rating)}</div>
                          <p className="text-xs text-gray-600 leading-relaxed">{r.comment}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right — sidebar */}
          <div className="w-full lg:w-80 shrink-0 space-y-4">
            {/* Price + order card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-20">
              <div className="mb-4">
                <h1 className="text-xl font-black text-gray-900 leading-tight mb-3">
                  {product.name}
                </h1>

                {/* Seller */}
                <div className="flex items-center gap-2 mb-3 p-3 bg-gray-50 rounded-xl">
                  <span className="text-2xl">🏪</span>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{product.seller}</div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-semibold border ${tierColors[product.tier]}`}>
                        {tierEmoji[product.tier]} {product.tier} Verified
                      </span>
                    </div>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-1">
                  <span className="text-3xl font-black text-gray-900">{product.price}</span>
                  <span className="text-sm text-gray-400 ml-1">{product.unit}</span>
                </div>
                <p className="text-xs text-gray-400">{product.minOrder}</p>
              </div>

              {/* Quantity */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Quantity</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700 font-bold hover:bg-gray-200 transition-colors"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    min={1}
                    onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                    className="flex-1 text-center py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-900 focus:outline-none focus:border-yellow-400"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700 font-bold hover:bg-gray-200 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* CTAs */}
              <div className="space-y-2">
                <button
                  onClick={handleOrder}
                  className="w-full py-3.5 rounded-xl bg-yellow-400 text-gray-900 font-bold text-sm hover:bg-yellow-500 transition-colors"
                >
                  🛒 Place Order
                </button>
                <button
                  onClick={handleContact}
                  className="w-full py-3.5 rounded-xl bg-gray-900 text-white font-bold text-sm hover:bg-gray-800 transition-colors"
                >
                  💬 Contact Seller
                </button>
              </div>

              {/* Trust chips */}
              <div className="mt-4 space-y-2">
                {[
                  { emoji: "🛡️", text: "Fraud-monitored listing" },
                  { emoji: "🔒", text: "Secure order process" },
                  { emoji: "🚚", text: "Order tracking included" },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{item.emoji}</span>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>

              {/* Flag listing */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                {flagged ? (
                  <p className="text-xs text-green-600 font-medium text-center">✅ Report submitted. Thank you.</p>
                ) : (
                  <button
                    onClick={() => setShowFlagModal(true)}
                    className="w-full text-xs text-gray-400 hover:text-red-500 transition-colors flex items-center justify-center gap-1"
                  >
                    🚩 Report this listing
                  </button>
                )}
              </div>
            </div>

            {/* Seller quick stats */}
            <div className="bg-gray-900 text-white rounded-2xl p-5">
              <h3 className="text-sm font-black mb-3">About the Seller</h3>
              <div className="space-y-2 text-xs">
                {[
                  { label: "Member since", value: "2021" },
                  { label: "Total orders", value: "1,240+" },
                  { label: "Response time", value: "< 2 hours" },
                  { label: "On-time delivery", value: "98.4%" },
                ].map((s) => (
                  <div key={s.label} className="flex justify-between">
                    <span className="text-gray-400">{s.label}</span>
                    <span className="font-semibold">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Flag modal */}
      {showFlagModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="font-black text-gray-900 mb-1">🚩 Report this Listing</h3>
            <p className="text-xs text-gray-500 mb-4">Help us keep Bexo safe. Describe the issue below.</p>

            <form onSubmit={handleFlag} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Reason</label>
                <select
                  required
                  value={flagReason}
                  onChange={(e) => setFlagReason(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-yellow-400"
                >
                  <option value="">Select a reason...</option>
                  <option value="fake">Fake or counterfeit product</option>
                  <option value="price">Suspicious pricing</option>
                  <option value="scam">Potential scam / fraud</option>
                  <option value="spam">Spam listing</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Additional Details</label>
                <textarea
                  placeholder="Describe the issue..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:border-yellow-400"
                />
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowFlagModal(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600">
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
