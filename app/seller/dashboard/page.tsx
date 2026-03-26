"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

const categories = ["Industrial Equipment", "Electronics & Tech", "Textiles & Apparel", "Agriculture", "Construction Materials", "Pharmaceuticals", "Auto Parts", "Food & Beverages"];

type SellerProfile = { id: string; company_name: string; tier: string; total_orders: number; total_revenue: number; avg_rating: number };
type ProductRow = { id: string; name: string; price: number; price_unit: string; stock_qty: number; is_active: boolean; is_flagged: boolean; review_count: number };
type OrderRow = { id: string; quantity: number; unit_price: number; total_amount: number; status: string; created_at: string; buyers: { users: { email: string } | null } | null; products: { name: string } | null };

function OrderStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Pending: "bg-yellow-100 text-yellow-700 border-yellow-300",
    Confirmed: "bg-blue-100 text-blue-700 border-blue-300",
    Shipped: "bg-purple-100 text-purple-700 border-purple-300",
    Delivered: "bg-green-100 text-green-700 border-green-300",
    Cancelled: "bg-red-100 text-red-700 border-red-300",
  };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${map[status] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>{status}</span>;
}

type Tab = "products" | "orders" | "analytics";

export default function SellerDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("products");
  const [productSearch, setProductSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: "", price: "", price_unit: "unit", category: "", stock: "", description: "" });
  const [setupForm, setSetupForm] = useState({ company_name: "", business_type: "manufacturer" });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const fetchDashboard = useCallback(async (sellerId: string) => {
    const supabase = createClient();
    const [{ data: prods }, { data: ords }] = await Promise.all([
      supabase.from("products").select("id, name, price, price_unit, stock_qty, is_active, is_flagged, review_count").eq("seller_id", sellerId).order("created_at", { ascending: false }),
      supabase.from("orders").select("id, quantity, unit_price, total_amount, status, created_at, buyers(users(email)), products(name)").eq("seller_id", sellerId).order("created_at", { ascending: false }).limit(20),
    ]);
    setProducts((prods ?? []) as ProductRow[]);
    setOrders((ords ?? []) as unknown as OrderRow[]);
  }, []);

  useEffect(() => {
    async function init() {
      const supabase = createClient();
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) { router.push("/auth/buyer"); return; }
      setUser(u);

      // Ensure user profile exists
      await supabase.from("users").upsert({ id: u.id, email: u.email!, updated_at: new Date().toISOString() }, { onConflict: "id" });

      // Fetch seller profile
      const { data: sellerData } = await supabase.from("sellers").select("id, company_name, tier, total_orders, total_revenue, avg_rating").eq("user_id", u.id).single();
      if (sellerData) {
        setSeller(sellerData as SellerProfile);
        await fetchDashboard(sellerData.id);
      }
      setLoading(false);
    }
    init();
  }, [router, fetchDashboard]);

  async function handleCreateSellerProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaveError("");
    setSaving(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("sellers")
      .insert({ user_id: user!.id, company_name: setupForm.company_name, business_type: setupForm.business_type })
      .select("id, company_name, tier, total_orders, total_revenue, avg_rating")
      .single();
    if (error) { setSaveError(error.message); setSaving(false); return; }
    setSeller(data as SellerProfile);
    setShowSetupModal(false);
    setSaving(false);
  }

  async function handleAddProduct(e: React.FormEvent) {
    e.preventDefault();
    setSaveError("");
    setSaving(true);
    const supabase = createClient();

    let sellerId = seller?.id;
    if (!sellerId) {
      // Auto-create seller profile with email username as company name
      const { data: s } = await supabase
        .from("sellers")
        .insert({ user_id: user!.id, company_name: user!.email!.split("@")[0] })
        .select("id, company_name, tier, total_orders, total_revenue, avg_rating")
        .single();
      if (s) { setSeller(s as SellerProfile); sellerId = s.id; }
    }

    if (!sellerId) { setSaveError("Could not create seller profile."); setSaving(false); return; }

    const { error } = await supabase.from("products").insert({
      seller_id: sellerId,
      name: newProduct.name,
      category: newProduct.category,
      price: Number(newProduct.price),
      price_unit: newProduct.price_unit,
      min_order_qty: 1,
      min_order_unit: newProduct.price_unit,
      stock_qty: Number(newProduct.stock) || 0,
      description: newProduct.description || null,
      is_active: true,
    });

    if (error) { setSaveError(error.message); setSaving(false); return; }

    await fetchDashboard(sellerId);
    setShowAddModal(false);
    setNewProduct({ name: "", price: "", price_unit: "unit", category: "", stock: "", description: "" });
    setSaving(false);
  }

  async function handleDeleteProduct(productId: string) {
    const supabase = createClient();
    await supabase.from("products").delete().eq("id", productId);
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  }

  async function handleUpdateOrderStatus(orderId: string, status: string) {
    const supabase = createClient();
    await supabase.from("orders").update({ status }).eq("id", orderId);
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status } : o));
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
        <div className="text-gray-400 text-sm">Loading dashboard...</div>
      </div>
    );
  }

  const totalRevenue = orders.filter(o => o.status === "Delivered").reduce((s, o) => s + Number(o.total_amount), 0);
  const filteredProducts = products.filter(p => !productSearch || p.name.toLowerCase().includes(productSearch.toLowerCase()));

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      {/* Header */}
      <div className="py-6 px-6" style={{ background: "var(--active-bg)", color: "#fff" }}>
        <div className="max-w-screen-xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">🏪</span>
              <h1 className="text-xl font-black">{seller?.company_name ?? user?.email?.split("@")[0] ?? "My Store"}</h1>
              {seller && (
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-300">
                  {seller.tier === "Gold" ? "🥇" : seller.tier === "Silver" ? "🥈" : "🥉"} {seller.tier} Verified
                </span>
              )}
            </div>
            <p className="text-sm text-gray-400">{user?.email} · Seller Dashboard</p>
          </div>
          <div className="flex items-center gap-3">
            {!seller && (
              <button onClick={() => setShowSetupModal(true)} className="px-4 py-2 text-sm font-semibold" style={{ background: "var(--surface)", color: "var(--text-primary)", borderRadius: "var(--radius-pill)" }}>
                Set Up Seller Profile
              </button>
            )}
            <Link href="/products" className="text-xs text-gray-400 hover:text-white transition-colors">← Marketplace</Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-6 py-4" style={{ background: "var(--surface)", boxShadow: "var(--shadow-raised)" }}>
        <div className="max-w-screen-xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { emoji: "💰", label: "Revenue (Delivered)", value: `₹${totalRevenue.toLocaleString("en-IN")}` },
            { emoji: "🛒", label: "Total Orders", value: orders.length },
            { emoji: "📦", label: "Active Listings", value: products.filter(p => p.is_active).length },
            { emoji: "⭐", label: "Avg. Rating", value: seller?.avg_rating ? `${seller.avg_rating}/5` : "N/A" },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-3 p-3" style={{ background: "var(--input-bg)", borderRadius: "var(--radius-sm)", boxShadow: "var(--shadow-soft)" }}>
              <span className="text-2xl">{s.emoji}</span>
              <div>
                <div className="text-xs text-gray-500">{s.label}</div>
                <div className="text-lg font-black">{s.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-screen-xl mx-auto px-6">
        <div className="neu-tab-bar mt-6">
          {([["products", "📦 Products"], ["orders", "🚚 Orders"], ["analytics", "📊 Analytics"]] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`neu-tab${tab === key ? " active" : ""}`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="py-6">
          {/* Products */}
          {tab === "products" && (
            <div>
              <div className="flex items-center justify-between gap-3 mb-4">
                <input type="text" placeholder="Search products..." value={productSearch} onChange={(e) => setProductSearch(e.target.value)} className="px-4 py-2.5 text-sm outline-none bg-white w-64" style={{ boxShadow: "var(--shadow-inset)", borderRadius: "var(--radius-xs)" }} />
                <button onClick={() => { setSaveError(""); setShowAddModal(true); }} className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold" style={{ background: "var(--active-bg)", color: "var(--surface)", borderRadius: "var(--radius-xs)" }}>
                  + Add Product
                </button>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="text-center py-16 bg-white" style={{ borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-raised)" }}>
                  <div className="text-4xl mb-3">📦</div>
                  <p className="text-gray-500 text-sm">No products yet. Add your first product to get started.</p>
                </div>
              ) : (
                <div className="bg-white overflow-hidden" style={{ borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-raised)" }}>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Product</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Price</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Stock</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Status</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredProducts.map((p) => (
                        <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-medium  text-sm">{p.name}</div>
                            {p.is_flagged && <span className="text-xs text-red-500 font-medium">🚩 Flagged</span>}
                          </td>
                          <td className="px-4 py-3 text-gray-700">₹{Number(p.price).toLocaleString("en-IN")} / {p.price_unit}</td>
                          <td className="px-4 py-3">
                            <span className={`text-sm font-medium ${p.stock_qty === 0 ? "text-red-500" : p.stock_qty < 5 ? "text-orange-500" : "text-gray-700"}`}>
                              {p.stock_qty === 0 ? "Out of stock" : p.stock_qty}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${p.is_active ? "bg-green-100 text-green-700 border-green-300" : "bg-red-100 text-red-600 border-red-300"}`}>
                              {p.is_active ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button onClick={() => handleDeleteProduct(p.id)} className="text-xs text-red-500 hover:text-red-700 font-medium" style={{ background: "transparent", color: "#ef4444" }}>Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Orders */}
          {tab === "orders" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-black">Order Management</h2>
                <p className="text-sm text-gray-500">{orders.length} orders total</p>
              </div>
              {orders.length === 0 ? (
                <div className="text-center py-16 bg-white" style={{ borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-raised)" }}>
                  <div className="text-4xl mb-3">🚚</div>
                  <p className="text-gray-500 text-sm">No orders yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => {
                    const buyer = order.buyers as { users: { email: string } | null } | null;
                    const buyerEmail = buyer?.users?.email ?? "Unknown";
                    const productName = (order.products as { name: string } | null)?.name ?? "Product";
                    return (
                      <div key={order.id} className="bg-white p-5" style={{ borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-raised)" }}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-4">
                            <span className="text-2xl">🛒</span>
                            <div>
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="font-black  text-sm">{order.id.slice(0, 8).toUpperCase()}</span>
                                <OrderStatusBadge status={order.status} />
                              </div>
                              <div className="text-sm text-gray-600 font-medium">{productName}</div>
                              <div className="text-xs text-gray-400 mt-0.5">
                                Buyer: {buyerEmail} · Qty: {order.quantity} · {new Date(order.created_at).toLocaleDateString("en-IN")}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <div className="text-lg font-black">₹{Number(order.total_amount).toLocaleString("en-IN")}</div>
                            </div>
                            <select
                              value={order.status}
                              onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                              className="px-3 py-2 text-xs font-medium text-gray-700 outline-none bg-white"
                              style={{ boxShadow: "var(--shadow-inset)", borderRadius: "var(--radius-xs)" }}
                            >
                              {["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"].map(s => <option key={s}>{s}</option>)}
                            </select>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Analytics */}
          {tab === "analytics" && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { emoji: "💰", label: "Total Revenue", value: `₹${totalRevenue.toLocaleString("en-IN")}`, sub: "From delivered orders" },
                  { emoji: "🛒", label: "Total Orders", value: orders.length, sub: `${orders.filter(o => o.status === "Pending").length} pending` },
                  { emoji: "📦", label: "Active Listings", value: products.filter(p => p.is_active).length, sub: `${products.filter(p => p.stock_qty === 0).length} out of stock` },
                  { emoji: "⭐", label: "Avg. Rating", value: seller?.avg_rating ? `${seller.avg_rating}/5` : "No reviews", sub: "Across all products" },
                  { emoji: "🚩", label: "Flagged Listings", value: products.filter(p => p.is_flagged).length, sub: "Need attention" },
                  { emoji: "✅", label: "Delivered", value: orders.filter(o => o.status === "Delivered").length, sub: "Successfully completed" },
                ].map((kpi) => (
                  <div key={kpi.label} className="bg-white p-5" style={{ borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-raised)" }}>
                    <div className="text-2xl mb-3">{kpi.emoji}</div>
                    <div className="text-2xl font-black">{kpi.value}</div>
                    <div className="text-xs text-gray-500 mt-1">{kpi.label}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{kpi.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Setup seller profile modal */}
      {showSetupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white p-6 w-full max-w-md shadow-2xl" style={{ borderRadius: "16px" }}>
            <h3 className="font-black  mb-1">Set Up Your Seller Profile</h3>
            <p className="text-xs text-gray-500 mb-5">Tell buyers about your business.</p>
            {saveError && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 mb-4" style={{ borderRadius: "var(--radius-xs)" }}>{saveError}</p>}
            <form onSubmit={handleCreateSellerProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Company Name</label>
                <input type="text" required value={setupForm.company_name} onChange={(e) => setSetupForm(p => ({ ...p, company_name: e.target.value }))} placeholder="Your company name" className="w-full px-4 py-3 text-sm outline-none" style={{ boxShadow: "var(--shadow-inset)", borderRadius: "10px" }} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Business Type</label>
                <select value={setupForm.business_type} onChange={(e) => setSetupForm(p => ({ ...p, business_type: e.target.value }))} className="w-full px-4 py-3 text-sm outline-none bg-white" style={{ boxShadow: "var(--shadow-inset)", borderRadius: "10px" }}>
                  <option value="manufacturer">Manufacturer</option>
                  <option value="distributor">Distributor</option>
                  <option value="wholesaler">Wholesaler</option>
                  <option value="trader">Trader</option>
                </select>
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setShowSetupModal(false)} className="flex-1 py-3 text-sm font-semibold text-gray-600" style={{ boxShadow: "var(--shadow-inset)", borderRadius: "var(--radius-pill)", background: "var(--surface)" }}>Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-3 text-sm font-bold" style={{ background: "var(--active-bg)", color: "var(--surface)", borderRadius: "var(--radius-pill)", opacity: saving ? 0.6 : 1 }}>
                  {saving ? "Creating..." : "Create Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add product modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white p-6 w-full max-w-lg shadow-2xl" style={{ borderRadius: "16px" }}>
            <h3 className="font-black  mb-4">Add New Product</h3>
            {saveError && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 mb-4" style={{ borderRadius: "var(--radius-xs)" }}>{saveError}</p>}
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Product Name</label>
                <input type="text" required value={newProduct.name} onChange={(e) => setNewProduct(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Industrial Conveyor Belt" className="w-full px-4 py-3 text-sm outline-none" style={{ boxShadow: "var(--shadow-inset)", borderRadius: "10px" }} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Price (₹)</label>
                  <input type="number" required value={newProduct.price} onChange={(e) => setNewProduct(p => ({ ...p, price: e.target.value }))} placeholder="0.00" className="w-full px-4 py-3 text-sm outline-none" style={{ boxShadow: "var(--shadow-inset)", borderRadius: "10px" }} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Unit</label>
                  <select value={newProduct.price_unit} onChange={(e) => setNewProduct(p => ({ ...p, price_unit: e.target.value }))} className="w-full px-4 py-3 text-sm outline-none bg-white" style={{ boxShadow: "var(--shadow-inset)", borderRadius: "10px" }}>
                    {["unit", "kg", "meter", "liter", "piece", "set", "bag", "panel", "batch"].map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Category</label>
                  <select required value={newProduct.category} onChange={(e) => setNewProduct(p => ({ ...p, category: e.target.value }))} className="w-full px-4 py-3 text-sm outline-none bg-white" style={{ boxShadow: "var(--shadow-inset)", borderRadius: "10px" }}>
                    <option value="">Select...</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Stock Available</label>
                  <input type="number" value={newProduct.stock} onChange={(e) => setNewProduct(p => ({ ...p, stock: e.target.value }))} placeholder="0" className="w-full px-4 py-3 text-sm outline-none" style={{ boxShadow: "var(--shadow-inset)", borderRadius: "10px" }} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Description</label>
                <textarea value={newProduct.description} onChange={(e) => setNewProduct(p => ({ ...p, description: e.target.value }))} rows={3} placeholder="Describe your product..." className="w-full px-4 py-3 text-sm resize-none outline-none" style={{ boxShadow: "var(--shadow-inset)", borderRadius: "10px" }} />
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-3 text-sm font-semibold text-gray-600" style={{ boxShadow: "var(--shadow-inset)", borderRadius: "var(--radius-pill)", background: "var(--surface)" }}>Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-3 text-sm font-bold" style={{ background: "var(--active-bg)", color: "var(--surface)", borderRadius: "var(--radius-pill)", opacity: saving ? 0.6 : 1 }}>
                  {saving ? "Adding..." : "Add Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
