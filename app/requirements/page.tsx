"use client";

import { useState } from "react";

const categories = ["All", "Industrial Equipment", "Electronics & Tech", "Textiles & Apparel", "Agriculture", "Construction Materials", "Pharmaceuticals", "Auto Parts", "Food & Beverages"];

const mockRequirements = [
  { id: "REQ-114", buyer: "🏭 FabriMax Inc.", title: "Need 500 units conveyor belts — 800mm width", description: "Looking for industrial-grade conveyor belts, 800mm wide, suitable for automotive assembly. Prefer CE certified. Delivery to Munich, Germany.", budget: "₹250,000", deadline: "Apr 30, 2026", category: "Industrial Equipment", location: "Germany", proposals: 7, urgent: true, posted: "2 days ago" },
  { id: "REQ-113", buyer: "🚗 AutoHub Ltd.", title: "OEM brake pads — 50,000 units/month supply", description: "We supply to aftermarket retailers across Southeast Asia. Looking for a reliable manufacturer for ongoing monthly orders.", budget: "₹80,000/mo", deadline: "May 15, 2026", category: "Auto Parts", location: "Malaysia", proposals: 12, urgent: false, posted: "4 days ago" },
  { id: "REQ-111", buyer: "🏗️ UrbanBuild Corp.", title: "Reinforced concrete hollow blocks for 3 warehouse projects", description: "Phase 1: 50,000 blocks. Phase 2: 80,000 blocks. Must meet ASTM C90 standard. Loading at our Jeddah site.", budget: "₹180,000", deadline: "Jun 1, 2026", category: "Construction Materials", location: "Saudi Arabia", proposals: 4, urgent: false, posted: "6 days ago" },
  { id: "REQ-108", buyer: "🌿 OrganicPlus Co.", title: "Organic neem oil — cold pressed, bulk supply", description: "We process organic cosmetics and need USDA certified neem oil. Ongoing 6-month contract potential.", budget: "₹45,000", deadline: "Apr 20, 2026", category: "Agriculture", location: "USA", proposals: 9, urgent: true, posted: "1 week ago" },
  { id: "REQ-105", buyer: "🏥 MedSupply INT", title: "Paracetamol API — 500 kg monthly", description: "GMP certified API required for our licensed pharmaceutical manufacturing unit. USP grade.", budget: "₹60,000/mo", deadline: "May 5, 2026", category: "Pharmaceuticals", location: "Ireland", proposals: 3, urgent: false, posted: "1 week ago" },
  { id: "REQ-102", buyer: "🧵 TextileMart", title: "100% cotton woven fabric — 10,000 meters", description: "Width: 145cm. Weight: 180-200 GSM. Colors: white, off-white. Delivery to Dubai, UAE.", budget: "₹35,000", deadline: "May 30, 2026", category: "Textiles & Apparel", location: "UAE", proposals: 15, urgent: false, posted: "2 weeks ago" },
  { id: "REQ-099", buyer: "🍱 FreshFlow Ltd.", title: "Freeze-dried mixed fruit — 20 MT order", description: "We are a food distributor. Looking for freeze-dried strawberry, mango, pineapple mix. HACCP certified supplier only.", budget: "₹90,000", deadline: "Jun 15, 2026", category: "Food & Beverages", location: "UK", proposals: 6, urgent: false, posted: "2 weeks ago" },
];

export default function RequirementsPage() {
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [showPostModal, setShowPostModal] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", category: "", budget: "", deadline: "", location: "", quantity: "", unit: "",
  });
  const [submitted, setSubmitted] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setShowPostModal(false);
      setSubmitted(false);
      setForm({ title: "", description: "", category: "", budget: "", deadline: "", location: "", quantity: "", unit: "" });
    }, 2000);
  }

  function handleRespond() {
    window.location.href = "/auth/seller";
  }

  const filtered = mockRequirements.filter((r) => {
    const matchCat = category === "All" || r.category === category;
    const matchSearch = !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page header */}
      <div className="bg-gray-900 text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black mb-2">📋 Requirements Board</h1>
              <p className="text-gray-400 text-sm max-w-xl">
                Buyers post what they need — sellers browse and submit proposals. Find exactly what you are looking for or connect with the right supplier.
              </p>
            </div>
            <button
              onClick={() => setShowPostModal(true)}
              className="shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-yellow-400 text-gray-900 font-bold text-sm hover:bg-yellow-300 transition-colors"
            >
              + Post a Requirement
            </button>
          </div>

          {/* Search */}
          <div className="mt-6 max-w-xl flex items-center gap-2 px-4 py-3 bg-white rounded-xl">
            <span>🔍</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search requirements..."
              className="flex-1 text-sm text-gray-900 placeholder-gray-400 outline-none bg-transparent"
            />
            {search && <button onClick={() => setSearch("")} className="text-gray-400 hover:text-gray-600 text-xs">✕</button>}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category filter */}
        <div className="flex gap-2 flex-wrap mb-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${category === cat ? "bg-yellow-400 text-gray-900" : "bg-white border border-gray-200 text-gray-600 hover:border-yellow-300"}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Stats row */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-gray-900">{filtered.length}</span> requirements found
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span>🟡 Urgent deadline</span>
            <span>💬 Proposals count</span>
          </div>
        </div>

        {/* Requirements list */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📋</div>
            <h3 className="text-lg font-bold text-gray-700">No requirements found</h3>
            <p className="text-sm text-gray-400 mt-1">Try different filters or post your own requirement.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((req) => (
              <div
                key={req.id}
                className={`bg-white rounded-2xl border overflow-hidden hover:shadow-md transition-shadow ${req.urgent ? "border-yellow-300" : "border-gray-100"}`}
              >
                {req.urgent && (
                  <div className="bg-yellow-400 px-4 py-1 text-xs font-bold text-gray-900 flex items-center gap-1">
                    ⚡ Urgent — deadline approaching
                  </div>
                )}
                <div className="p-5 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-xs font-black text-gray-400">{req.id}</span>
                        <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">{req.category}</span>
                        <span className="text-xs text-gray-400">📍 {req.location}</span>
                        <span className="text-xs text-gray-400">· {req.posted}</span>
                      </div>

                      <h3 className="text-base font-black text-gray-900 mb-2">{req.title}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed mb-3 line-clamp-2">{req.description}</p>

                      <div className="flex flex-wrap gap-4 text-xs">
                        <div className="flex items-center gap-1 text-green-700 font-semibold">
                          <span>💰</span>
                          <span>Budget: {req.budget}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-500">
                          <span>📅</span>
                          <span>Deadline: {req.deadline}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-500">
                          <span>👤</span>
                          <span>{req.buyer}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3 shrink-0">
                      <div className="text-right">
                        <div className="text-2xl font-black text-gray-900">{req.proposals}</div>
                        <div className="text-xs text-gray-400">proposals</div>
                      </div>
                      <button
                        onClick={handleRespond}
                        className="px-5 py-2.5 rounded-xl bg-gray-900 text-white text-xs font-bold hover:bg-yellow-400 hover:text-gray-900 transition-colors"
                      >
                        Submit Proposal →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Post requirement modal */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl my-4">
            {submitted ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-3">✅</div>
                <h3 className="font-black text-gray-900 text-lg">Requirement Posted!</h3>
                <p className="text-sm text-gray-500 mt-1">Sellers will start responding shortly.</p>
              </div>
            ) : (
              <>
                <h3 className="font-black text-gray-900 mb-1">📋 Post a Requirement</h3>
                <p className="text-xs text-gray-500 mb-5">Tell sellers exactly what you need. The more detail, the better proposals you get.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Requirement Title</label>
                    <input
                      type="text"
                      name="title"
                      required
                      value={form.title}
                      onChange={handleChange}
                      placeholder="e.g. Need 500 units industrial conveyor belts"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-yellow-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Detailed Description</label>
                    <textarea
                      name="description"
                      required
                      value={form.description}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Specifications, certifications needed, delivery terms..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:border-yellow-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Category</label>
                    <select
                      name="category"
                      required
                      value={form.category}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-yellow-400"
                    >
                      <option value="">Select category...</option>
                      {categories.filter(c => c !== "All").map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Quantity</label>
                      <input
                        type="text"
                        name="quantity"
                        value={form.quantity}
                        onChange={handleChange}
                        placeholder="e.g. 500 units"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-yellow-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Budget (USD)</label>
                      <input
                        type="text"
                        name="budget"
                        required
                        value={form.budget}
                        onChange={handleChange}
                        placeholder="e.g. ₹50,000"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-yellow-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Deadline</label>
                      <input
                        type="date"
                        name="deadline"
                        required
                        value={form.deadline}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-yellow-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Your Location</label>
                      <input
                        type="text"
                        name="location"
                        value={form.location}
                        onChange={handleChange}
                        placeholder="Country or city"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-yellow-400"
                      />
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-xs text-yellow-800">
                    🔒 You must be logged in as a buyer to post requirements. This form will redirect to signup.
                  </div>

                  <div className="flex gap-2">
                    <button type="button" onClick={() => setShowPostModal(false)} className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">
                      Cancel
                    </button>
                    <button type="submit" className="flex-1 py-3 rounded-xl bg-yellow-400 text-gray-900 text-sm font-bold hover:bg-yellow-500 transition-colors">
                      Post Requirement →
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
