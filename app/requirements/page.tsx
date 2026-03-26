"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const categories = ["All", "Industrial Equipment", "Electronics & Tech", "Textiles & Apparel", "Agriculture", "Construction Materials", "Pharmaceuticals", "Auto Parts", "Food & Beverages"];

const demoRequirements = [
  { id: "REQ-114", buyer: "🏭 FabriMax Inc.", title: "Need 500 units conveyor belts — 800mm width", description: "Looking for industrial-grade conveyor belts, 800mm wide, CE certified. Delivery to Mumbai.", budget: "₹2,50,000", deadline: "Apr 30, 2026", category: "Industrial Equipment", location: "Mumbai", proposals: 7, urgent: true, posted: "2 days ago" },
  { id: "REQ-113", buyer: "🚗 AutoHub Ltd.", title: "OEM brake pads — 50,000 units/month supply", description: "We supply to aftermarket retailers across India. Looking for a reliable manufacturer for ongoing monthly orders.", budget: "₹80,000/mo", deadline: "May 15, 2026", category: "Auto Parts", location: "Delhi", proposals: 12, urgent: false, posted: "4 days ago" },
  { id: "REQ-111", buyer: "🏗️ UrbanBuild Corp.", title: "Reinforced concrete hollow blocks for 3 warehouse projects", description: "Phase 1: 50,000 blocks. Phase 2: 80,000 blocks. Must meet IS standards.", budget: "₹1,80,000", deadline: "Jun 1, 2026", category: "Construction Materials", location: "Hyderabad", proposals: 4, urgent: false, posted: "6 days ago" },
  { id: "REQ-108", buyer: "🌿 OrganicPlus Co.", title: "Organic neem oil — cold pressed, bulk supply", description: "We process organic cosmetics and need certified neem oil. Ongoing 6-month contract potential.", budget: "₹45,000", deadline: "Apr 20, 2026", category: "Agriculture", location: "Bangalore", proposals: 9, urgent: true, posted: "1 week ago" },
  { id: "REQ-105", buyer: "🏥 MedSupply INT", title: "Paracetamol API — 500 kg monthly", description: "GMP certified API required for licensed pharmaceutical manufacturing unit. USP grade.", budget: "₹60,000/mo", deadline: "May 5, 2026", category: "Pharmaceuticals", location: "Pune", proposals: 3, urgent: false, posted: "1 week ago" },
  { id: "REQ-102", buyer: "🧵 TextileMart", title: "100% cotton woven fabric — 10,000 meters", description: "Width: 145cm. Weight: 180-200 GSM. Colors: white, off-white. Delivery to Surat.", budget: "₹35,000", deadline: "May 30, 2026", category: "Textiles & Apparel", location: "Surat", proposals: 15, urgent: false, posted: "2 weeks ago" },
  { id: "REQ-099", buyer: "🍱 FreshFlow Ltd.", title: "Freeze-dried mixed fruit — 20 MT order", description: "Looking for freeze-dried strawberry, mango, pineapple mix. HACCP certified supplier only.", budget: "₹90,000", deadline: "Jun 15, 2026", category: "Food & Beverages", location: "Chennai", proposals: 6, urgent: false, posted: "2 weeks ago" },
];

type Requirement = {
  id: string; buyer: string; title: string; description: string;
  budget: string; deadline: string; category: string; location: string;
  proposals: number; urgent: boolean; posted: string;
};

export default function RequirementsPage() {
  const router = useRouter();
  const [requirements, setRequirements] = useState<Requirement[]>(demoRequirements);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [showPostModal, setShowPostModal] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", category: "", budget: "", deadline: "", location: "", quantity: "" });
  const [submitted, setSubmitted] = useState(false);
  const [postError, setPostError] = useState("");
  const [posting, setPosting] = useState(false);

  const fetchRequirements = useCallback(async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("requirements")
      .select("id, title, description, category, budget_display, deadline, location, proposal_count, is_urgent, created_at, buyers(users(email))")
      .eq("is_open", true)
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      setRequirements(
        data.map((r) => {
          const buyer = r.buyers as unknown as { users: { email: string } | null } | null;
          const email = buyer?.users?.email ?? "Anonymous";
          const postedDate = new Date(r.created_at);
          const daysAgo = Math.floor((Date.now() - postedDate.getTime()) / 86400000);
          return {
            id: r.id.slice(0, 8).toUpperCase(),
            buyer: `👤 ${email.split("@")[0]}`,
            title: r.title,
            description: r.description ?? "",
            budget: r.budget_display ?? "Not specified",
            deadline: r.deadline ? new Date(r.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Open",
            category: r.category ?? "General",
            location: r.location ?? "India",
            proposals: r.proposal_count ?? 0,
            urgent: r.is_urgent ?? false,
            posted: daysAgo === 0 ? "Today" : daysAgo === 1 ? "Yesterday" : `${daysAgo} days ago`,
          };
        })
      );
    }
  }, []);

  useEffect(() => { fetchRequirements(); }, [fetchRequirements]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPostError("");
    setPosting(true);

    const supabase = createClient();

    // Check auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setPosting(false);
      router.push("/auth/buyer");
      return;
    }

    // Ensure public.users profile exists
    await supabase.from("users").upsert(
      { id: user.id, email: user.email!, updated_at: new Date().toISOString() },
      { onConflict: "id" }
    );

    // Get or create buyer profile
    let buyerId: string | null = null;
    const { data: existingBuyer } = await supabase.from("buyers").select("id").eq("user_id", user.id).single();

    if (existingBuyer) {
      buyerId = existingBuyer.id;
    } else {
      const { data: newBuyer, error: buyerError } = await supabase
        .from("buyers")
        .insert({ user_id: user.id, country: form.location || "India" })
        .select("id")
        .single();
      if (buyerError) {
        setPostError("Could not create buyer profile: " + buyerError.message);
        setPosting(false);
        return;
      }
      buyerId = newBuyer?.id ?? null;
    }

    if (!buyerId) {
      setPostError("Failed to set up buyer profile.");
      setPosting(false);
      return;
    }

    // Insert requirement
    const { error } = await supabase.from("requirements").insert({
      buyer_id: buyerId,
      title: form.title,
      description: form.description,
      category: form.category || null,
      quantity_text: form.quantity || null,
      budget_display: form.budget,
      deadline: form.deadline || null,
      location: form.location || null,
      is_open: true,
    });

    if (error) {
      setPostError(error.message);
      setPosting(false);
      return;
    }

    setSubmitted(true);
    await fetchRequirements();
    setPosting(false);

    setTimeout(() => {
      setShowPostModal(false);
      setSubmitted(false);
      setForm({ title: "", description: "", category: "", budget: "", deadline: "", location: "", quantity: "" });
    }, 2000);
  }

  const filtered = requirements.filter((r) => {
    const matchCat = category === "All" || r.category === category;
    const matchSearch = !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      {/* Header */}
      <div className="bg-white border-b border-gray-100 py-8 px-6">
        <div className="max-w-screen-xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black  mb-1">Requirements Board</h1>
            <p className="text-sm text-gray-500">Buyers post what they need — sellers submit proposals.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white px-4 py-2.5 border border-gray-200" style={{ borderRadius: "var(--radius-xs)" }}>
              <span className="text-gray-400 text-sm">🔍</span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search requirements..."
                className="text-sm  placeholder-gray-400 outline-none bg-transparent w-48"
              />
              {search && <button onClick={() => setSearch("")} className="text-gray-400 text-xs" style={{ background: "transparent", color: "#9ca3af" }}>✕</button>}
            </div>
            <button
              onClick={() => setShowPostModal(true)}
              className="shrink-0 px-5 py-2.5 text-sm font-bold"
              style={{ background: "var(--active-bg)", color: "var(--surface)", borderRadius: "var(--radius-pill)" }}
            >
              + Post Requirement
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-6 py-8">
        {/* Category filter */}
        <div className="flex gap-2 flex-wrap mb-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className="px-3 py-1.5 text-xs font-semibold transition-colors"
              style={{
                borderRadius: "var(--radius-pill)",
                background: category === cat ? "var(--active-bg)" : "var(--surface)",
                color: category === cat ? "var(--surface)" : "#6b7280",
                border: category === cat ? "none" : "1px solid #e5e7eb",
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        <p className="text-sm text-gray-500 mb-5">
          <span className="font-semibold">{filtered.length}</span> requirements found
        </p>

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
                className="bg-white overflow-hidden hover:shadow-md transition-shadow"
                style={{ borderRadius: "var(--radius-sm)", border: req.urgent ? "1.5px solid #fbbf24" : "1px solid #f0f0f0" }}
              >
                {req.urgent && (
                  <div className="px-5 py-1.5 text-xs font-bold  flex items-center gap-1" style={{ background: "#fbbf24" }}>
                    ⚡ Urgent — deadline approaching
                  </div>
                )}
                <div className="p-5 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-xs font-black text-gray-400">{req.id}</span>
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium" style={{ borderRadius: "20px" }}>{req.category}</span>
                        <span className="text-xs text-gray-400">📍 {req.location}</span>
                        <span className="text-xs text-gray-400">· {req.posted}</span>
                      </div>
                      <h3 className="text-base font-black  mb-2">{req.title}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed mb-3 line-clamp-2">{req.description}</p>
                      <div className="flex flex-wrap gap-4 text-xs">
                        <span className="text-green-700 font-semibold">💰 Budget: {req.budget}</span>
                        <span className="text-gray-500">📅 Deadline: {req.deadline}</span>
                        <span className="text-gray-500">👤 {req.buyer}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-3 shrink-0">
                      <div className="text-right">
                        <div className="text-2xl font-black">{req.proposals}</div>
                        <div className="text-xs text-gray-400">proposals</div>
                      </div>
                      <button
                        onClick={() => router.push("/auth/buyer")}
                        className="px-5 py-2.5 text-xs font-bold"
                        style={{ background: "var(--active-bg)", color: "var(--surface)", borderRadius: "var(--radius-pill)" }}
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
          <div className="bg-white p-6 w-full max-w-lg shadow-2xl my-4" style={{ borderRadius: "16px" }}>
            {submitted ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-3">✅</div>
                <h3 className="font-black  text-lg">Requirement Posted!</h3>
                <p className="text-sm text-gray-500 mt-1">Sellers will start responding shortly.</p>
              </div>
            ) : (
              <>
                <h3 className="font-black  mb-1">Post a Requirement</h3>
                <p className="text-xs text-gray-500 mb-5">Tell sellers exactly what you need. You must be logged in to post.</p>

                {postError && (
                  <p className="text-xs text-red-600 bg-red-50 px-3 py-2 mb-4" style={{ borderRadius: "var(--radius-xs)" }}>{postError}</p>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Title</label>
                    <input type="text" name="title" required value={form.title} onChange={handleChange} placeholder="e.g. Need 500 units industrial conveyor belts" className="w-full px-4 py-3 text-sm outline-none" style={{ boxShadow: "var(--shadow-inset)", borderRadius: "10px" }} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Description</label>
                    <textarea name="description" required value={form.description} onChange={handleChange} rows={3} placeholder="Specifications, certifications, delivery terms..." className="w-full px-4 py-3 text-sm resize-none outline-none" style={{ boxShadow: "var(--shadow-inset)", borderRadius: "10px" }} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Category</label>
                      <select name="category" required value={form.category} onChange={handleChange} className="w-full px-4 py-3 text-sm outline-none" style={{ boxShadow: "var(--shadow-inset)", borderRadius: "10px" }}>
                        <option value="">Select...</option>
                        {categories.filter(c => c !== "All").map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Quantity</label>
                      <input type="text" name="quantity" value={form.quantity} onChange={handleChange} placeholder="e.g. 500 units" className="w-full px-4 py-3 text-sm outline-none" style={{ boxShadow: "var(--shadow-inset)", borderRadius: "10px" }} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Budget</label>
                      <input type="text" name="budget" required value={form.budget} onChange={handleChange} placeholder="₹50,000" className="w-full px-4 py-3 text-sm outline-none" style={{ boxShadow: "var(--shadow-inset)", borderRadius: "10px" }} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Deadline</label>
                      <input type="date" name="deadline" value={form.deadline} onChange={handleChange} className="w-full px-4 py-3 text-sm outline-none" style={{ boxShadow: "var(--shadow-inset)", borderRadius: "10px" }} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Your City</label>
                    <input type="text" name="location" value={form.location} onChange={handleChange} placeholder="Mumbai, Delhi, Bangalore..." className="w-full px-4 py-3 text-sm outline-none" style={{ boxShadow: "var(--shadow-inset)", borderRadius: "10px" }} />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button type="button" onClick={() => setShowPostModal(false)} className="flex-1 py-3 text-sm font-semibold text-gray-600" style={{ boxShadow: "var(--shadow-inset)", borderRadius: "var(--radius-pill)", background: "var(--surface)" }}>
                      Cancel
                    </button>
                    <button type="submit" disabled={posting} className="flex-1 py-3 text-sm font-bold" style={{ background: "var(--active-bg)", color: "var(--surface)", borderRadius: "var(--radius-pill)", opacity: posting ? 0.6 : 1 }}>
                      {posting ? "Posting..." : "Post Requirement →"}
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
