"use client";

import Link from "next/link";
import { useState } from "react";

// ── Mock data ──────────────────────────────────────────────────────────────

const mockProducts = [
  { id: "1", emoji: "📦", name: "Industrial Conveyor Belt System", price: "₹4,200", stock: 12, orders: 47, status: "Active", flagged: false },
  { id: "2", emoji: "⚙️", name: "Precision CNC Machine Parts", price: "₹320", stock: 50, orders: 23, status: "Active", flagged: false },
  { id: "3", emoji: "🔩", name: "Stainless Steel Fastener Sets", price: "₹145", stock: 0, orders: 89, status: "Out of stock", flagged: false },
  { id: "4", emoji: "🏗️", name: "Heavy-Duty Storage Racks", price: "₹780", stock: 8, orders: 12, status: "Active", flagged: true },
];

const mockOrders = [
  { id: "ORD-0041", buyer: "🏭 Hartmann GmbH", product: "Industrial Conveyor Belt System", qty: 5, total: "₹21,000", status: "Shipped", date: "Mar 22, 2026" },
  { id: "ORD-0038", buyer: "🏗️ BuildCo AU", product: "Precision CNC Machine Parts", qty: 10, total: "₹3,200", status: "Confirmed", date: "Mar 20, 2026" },
  { id: "ORD-0035", buyer: "🚗 AutoMax Corp", product: "Stainless Steel Fastener Sets", qty: 200, total: "₹29,000", status: "Delivered", date: "Mar 15, 2026" },
  { id: "ORD-0031", buyer: "🏢 MegaMachines", product: "Industrial Conveyor Belt System", qty: 2, total: "₹8,400", status: "Pending", date: "Mar 12, 2026" },
  { id: "ORD-0028", buyer: "🔧 PartnerTech Ltd", product: "Heavy-Duty Storage Racks", qty: 3, total: "₹2,340", status: "Delivered", date: "Mar 5, 2026" },
];

const mockRequirements = [
  { id: "REQ-114", buyer: "🏭 FabriMax Inc.", title: "Need 500 units conveyor belts — 800mm width", budget: "₹250,000", deadline: "Apr 30, 2026", category: "Industrial Equipment", responded: false },
  { id: "REQ-108", buyer: "🚗 AutoHub Ltd.", title: "Looking for OEM brake pads — 50K units/month", budget: "₹80,000/mo", deadline: "May 15, 2026", category: "Auto Parts", responded: true },
  { id: "REQ-096", buyer: "📦 LogiCorp", title: "Heavy-duty racking systems for 3 warehouses", budget: "₹120,000", deadline: "Jun 1, 2026", category: "Construction Materials", responded: false },
];

const analyticsData = {
  revenue: "₹142,500",
  revenueChange: "+18%",
  orders: 47,
  ordersChange: "+12%",
  views: 8_420,
  viewsChange: "+34%",
  avgRating: 4.9,
  totalReviews: 128,
  conversionRate: "3.2%",
};

const monthlyRevenue = [
  { month: "Oct", value: 72 },
  { month: "Nov", value: 84 },
  { month: "Dec", value: 91 },
  { month: "Jan", value: 78 },
  { month: "Feb", value: 96 },
  { month: "Mar", value: 100 },
];

// ── Status badge colours ───────────────────────────────────────────────────

function OrderStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Pending: "bg-yellow-100 text-yellow-700 border-yellow-300",
    Confirmed: "bg-blue-100 text-blue-700 border-blue-300",
    Shipped: "bg-purple-100 text-purple-700 border-purple-300",
    Delivered: "bg-green-100 text-green-700 border-green-300",
    Cancelled: "bg-red-100 text-red-700 border-red-300",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${map[status] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>
      {status}
    </span>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

type Tab = "products" | "orders" | "requirements" | "analytics";

export default function SellerDashboardPage() {
  const [tab, setTab] = useState<Tab>("products");
  const [productSearch, setProductSearch] = useState("");
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: "", price: "", category: "", stock: "", description: "" });

  function handleAddProduct(e: React.FormEvent) {
    e.preventDefault();
    alert("Product submitted — connect Supabase to persist data.");
    setShowAddProductModal(false);
    setNewProduct({ name: "", price: "", category: "", stock: "", description: "" });
  }

  const filteredProducts = mockProducts.filter((p) =>
    !productSearch || p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const tabs: { key: Tab; label: string; emoji: string }[] = [
    { key: "products", label: "Products", emoji: "📦" },
    { key: "orders", label: "Orders", emoji: "🚚" },
    { key: "requirements", label: "Requirements", emoji: "📋" },
    { key: "analytics", label: "Analytics", emoji: "📊" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard header */}
      <div className="bg-gray-900 text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">🏪</span>
              <h1 className="text-xl font-black">TechMach Industries</h1>
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-semibold border bg-yellow-100 text-yellow-800 border-yellow-300">
                🥇 Gold Verified
              </span>
            </div>
            <p className="text-sm text-gray-400">Seller Dashboard — Managing your store</p>
          </div>
          <Link href="/products" className="text-xs text-gray-400 hover:text-white transition-colors">
            ← Browse Marketplace
          </Link>
        </div>
      </div>

      {/* Quick stats */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { emoji: "💰", label: "Revenue (Mar)", value: analyticsData.revenue, change: analyticsData.revenueChange, positive: true },
              { emoji: "🛒", label: "Orders (Mar)", value: analyticsData.orders, change: analyticsData.ordersChange, positive: true },
              { emoji: "👁️", label: "Product Views", value: analyticsData.views.toLocaleString(), change: analyticsData.viewsChange, positive: true },
              { emoji: "⭐", label: "Avg. Rating", value: analyticsData.avgRating, change: `${analyticsData.totalReviews} reviews`, positive: true },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                <span className="text-2xl">{s.emoji}</span>
                <div>
                  <div className="text-xs text-gray-500">{s.label}</div>
                  <div className="text-lg font-black text-gray-900">{s.value}</div>
                  <div className={`text-xs font-medium ${s.positive ? "text-green-600" : "text-red-500"}`}>{s.change}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-1 border-b border-gray-200 mt-6">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-semibold border-b-2 transition-all -mb-px ${tab === t.key ? "border-yellow-400 text-gray-900" : "border-transparent text-gray-500 hover:text-gray-700"}`}
            >
              <span>{t.emoji}</span> {t.label}
            </button>
          ))}
        </div>

        <div className="py-6">
          {/* ── Products Tab ── */}
          {tab === "products" && (
            <div>
              <div className="flex items-center justify-between gap-3 mb-4">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-yellow-400 bg-white w-64"
                />
                <button
                  onClick={() => setShowAddProductModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-yellow-400 text-gray-900 text-sm font-bold hover:bg-yellow-500 transition-colors"
                >
                  + Add Product
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Product</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Price</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Stock</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Orders</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Status</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{p.emoji}</span>
                            <div>
                              <div className="font-medium text-gray-900 text-sm">{p.name}</div>
                              {p.flagged && (
                                <span className="text-xs text-red-500 font-medium">🚩 Flagged for review</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-900">{p.price}</td>
                        <td className="px-4 py-3">
                          <span className={`text-sm font-medium ${p.stock === 0 ? "text-red-500" : p.stock < 5 ? "text-orange-500" : "text-gray-700"}`}>
                            {p.stock === 0 ? "Out of stock" : p.stock}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{p.orders}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${p.status === "Active" ? "bg-green-100 text-green-700 border-green-300" : "bg-red-100 text-red-600 border-red-300"}`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">Edit</button>
                            <button className="text-xs text-red-500 hover:text-red-700 font-medium">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredProducts.length === 0 && (
                  <div className="py-12 text-center text-sm text-gray-400">No products found.</div>
                )}
              </div>
            </div>
          )}

          {/* ── Orders Tab ── */}
          {tab === "orders" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-black text-gray-900">Order Management</h2>
                <p className="text-sm text-gray-500">{mockOrders.length} orders total</p>
              </div>

              <div className="space-y-3">
                {mockOrders.map((order) => (
                  <div key={order.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-4">
                        <span className="text-2xl">🛒</span>
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-black text-gray-900 text-sm">{order.id}</span>
                            <OrderStatusBadge status={order.status} />
                          </div>
                          <div className="text-sm text-gray-600 font-medium">{order.product}</div>
                          <div className="text-xs text-gray-400 mt-0.5">Buyer: {order.buyer} · Qty: {order.qty} · {order.date}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-lg font-black text-gray-900">{order.total}</div>
                        </div>
                        <select
                          defaultValue={order.status}
                          className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium text-gray-700 focus:outline-none focus:border-yellow-400 bg-white"
                        >
                          <option>Pending</option>
                          <option>Confirmed</option>
                          <option>Shipped</option>
                          <option>Delivered</option>
                          <option>Cancelled</option>
                        </select>
                      </div>
                    </div>

                    {/* Order progress */}
                    <div className="mt-4 flex items-center gap-1">
                      {["Pending", "Confirmed", "Shipped", "Delivered"].map((s, i, arr) => {
                        const statusIndex = arr.indexOf(order.status);
                        const isActive = i <= statusIndex;
                        return (
                          <div key={s} className="flex items-center gap-1 flex-1">
                            <div className={`w-2 h-2 rounded-full shrink-0 ${isActive ? "bg-yellow-400" : "bg-gray-200"}`} />
                            <span className={`text-xs ${isActive ? "text-gray-700 font-medium" : "text-gray-300"} hidden sm:block`}>{s}</span>
                            {i < arr.length - 1 && <div className={`flex-1 h-px ${isActive && i < statusIndex ? "bg-yellow-400" : "bg-gray-200"}`} />}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Requirements Tab ── */}
          {tab === "requirements" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-black text-gray-900">Buyer Requirements</h2>
                <p className="text-sm text-gray-500">Respond to buyer needs that match your catalog</p>
              </div>

              <div className="space-y-4">
                {mockRequirements.map((req) => (
                  <div key={req.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex items-start gap-4">
                        <span className="text-2xl mt-0.5">📋</span>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-black text-gray-900 text-sm">{req.id}</span>
                            <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">{req.category}</span>
                            {req.responded && (
                              <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">✅ Responded</span>
                            )}
                          </div>
                          <h3 className="font-semibold text-gray-900 mb-1">{req.title}</h3>
                          <div className="flex gap-4 text-xs text-gray-400">
                            <span>👤 {req.buyer}</span>
                            <span>💰 Budget: {req.budget}</span>
                            <span>📅 Due: {req.deadline}</span>
                          </div>
                        </div>
                      </div>
                      <div className="shrink-0">
                        {req.responded ? (
                          <button className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-500 hover:bg-gray-50">
                            View Response
                          </button>
                        ) : (
                          <button className="px-4 py-2 rounded-xl bg-yellow-400 text-gray-900 text-xs font-bold hover:bg-yellow-500 transition-colors">
                            Submit Proposal
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Analytics Tab ── */}
          {tab === "analytics" && (
            <div className="space-y-6">
              {/* Revenue chart */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h3 className="font-black text-gray-900 mb-1">Monthly Revenue</h3>
                <p className="text-xs text-gray-400 mb-6">Last 6 months — normalized view</p>

                <div className="flex items-end gap-3 h-40">
                  {monthlyRevenue.map((m) => (
                    <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full rounded-t-lg bg-yellow-400 hover:bg-yellow-500 transition-colors"
                        style={{ height: `${m.value}%` }}
                      />
                      <span className="text-xs text-gray-400">{m.month}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* KPI grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { emoji: "💰", label: "Total Revenue", value: "₹142,500", sub: "+18% vs last month" },
                  { emoji: "🛒", label: "Total Orders", value: "47", sub: "+12% vs last month" },
                  { emoji: "🔄", label: "Conversion Rate", value: analyticsData.conversionRate, sub: "Views to orders" },
                  { emoji: "👁️", label: "Product Views", value: "8,420", sub: "+34% vs last month" },
                  { emoji: "⭐", label: "Avg. Rating", value: `${analyticsData.avgRating}/5`, sub: `${analyticsData.totalReviews} total reviews` },
                  { emoji: "📦", label: "Active Listings", value: "3", sub: "1 out of stock" },
                ].map((kpi) => (
                  <div key={kpi.label} className="bg-white rounded-2xl border border-gray-100 p-5">
                    <div className="text-2xl mb-3">{kpi.emoji}</div>
                    <div className="text-2xl font-black text-gray-900">{kpi.value}</div>
                    <div className="text-xs text-gray-500 mt-1">{kpi.label}</div>
                    <div className="text-xs text-green-600 font-medium mt-0.5">{kpi.sub}</div>
                  </div>
                ))}
              </div>

              {/* Fraud monitoring panel */}
              <div className="bg-gray-900 text-white rounded-2xl p-6">
                <h3 className="font-black mb-4 flex items-center gap-2">
                  <span>🛡️</span> Fraud Monitoring Status
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { label: "Listings Scanned", value: "4", status: "ok", icon: "✅" },
                    { label: "Flagged Listings", value: "1", status: "warn", icon: "🚩" },
                    { label: "Last Scan", value: "2h ago", status: "ok", icon: "🕐" },
                  ].map((item) => (
                    <div key={item.label} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                      <div className="flex items-center gap-2 mb-1">
                        <span>{item.icon}</span>
                        <span className={`text-2xl font-black ${item.status === "warn" ? "text-yellow-400" : "text-white"}`}>{item.value}</span>
                      </div>
                      <div className="text-xs text-gray-400">{item.label}</div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-4">
                  🚩 &quot;Heavy-Duty Storage Racks&quot; was flagged for pricing review. Please update or contact support.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add product modal */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <h3 className="font-black text-gray-900 mb-4">📦 Add New Product</h3>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Industrial Conveyor Belt System"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct((p) => ({ ...p, name: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-yellow-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Price (USD)</label>
                  <input
                    type="text"
                    required
                    placeholder="₹0.00"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct((p) => ({ ...p, price: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-yellow-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Stock Available</label>
                  <input
                    type="number"
                    required
                    placeholder="0"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct((p) => ({ ...p, stock: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-yellow-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Category</label>
                <select
                  required
                  value={newProduct.category}
                  onChange={(e) => setNewProduct((p) => ({ ...p, category: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-yellow-400"
                >
                  <option value="">Select category...</option>
                  <option>Industrial Equipment</option>
                  <option>Electronics &amp; Tech</option>
                  <option>Textiles &amp; Apparel</option>
                  <option>Agriculture</option>
                  <option>Construction Materials</option>
                  <option>Pharmaceuticals</option>
                  <option>Auto Parts</option>
                  <option>Food &amp; Beverages</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Description</label>
                <textarea
                  placeholder="Describe your product..."
                  rows={3}
                  value={newProduct.description}
                  onChange={(e) => setNewProduct((p) => ({ ...p, description: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:border-yellow-400"
                />
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowAddProductModal(false)} className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-3 rounded-xl bg-yellow-400 text-gray-900 text-sm font-bold hover:bg-yellow-500">
                  Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
