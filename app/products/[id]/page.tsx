"use client";

import Link from "next/link";
import { use, useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

type ProductData = {
  id: string; name: string; seller: string; verified: boolean;
  price: string; unit: string; minOrder: string; rating: number;
  reviews: number; location: string; category: string;
  description: string; specs: { label: string; value: string }[];
  reviewList: { author: string; rating: number; comment: string; date: string }[];
  sellerStats: { memberSince: string; totalOrders: string; responseTime: string; onTimePct: string };
};

const demoProducts: Record<string, ProductData> = {
  "1": {
    id: "1", name: "Industrial Conveyor Belt System", seller: "TechMach Industries", verified: true,
    price: "4,200", unit: "unit", minOrder: "Min. 5 units",
    rating: 4.9, reviews: 128, location: "Mumbai", category: "Industrial Equipment",
    description: "Heavy-duty industrial conveyor belt system engineered for high-throughput manufacturing environments. Suitable for automotive, logistics, and food processing plants. Built to withstand continuous operation in demanding industrial conditions.",
    specs: [
      { label: "Belt Width", value: "600mm – 1,200mm" }, { label: "Speed", value: "0.1 – 2.5 m/s" },
      { label: "Load Capacity", value: "Up to 2,500 kg/m" }, { label: "Motor Power", value: "7.5 – 55 kW" },
      { label: "Certification", value: "CE, ISO 9001" }, { label: "Warranty", value: "3 years" },
      { label: "Lead Time", value: "30–45 days" },
    ],
    reviewList: [
      { author: "Hartmann GmbH", rating: 5, comment: "Outstanding quality. Our production throughput improved by 28%.", date: "Jan 2026" },
      { author: "FabriMax Inc.", rating: 5, comment: "Professional partner. Excellent post-sale support.", date: "Dec 2025" },
      { author: "LogiChain Ltd.", rating: 4, comment: "Good build quality, minor delay in delivery but worth it.", date: "Nov 2025" },
    ],
    sellerStats: { memberSince: "2021", totalOrders: "1,240+", responseTime: "< 2 hours", onTimePct: "98.4%" },
  },
  "2": {
    id: "2", name: "Commercial LED Display Panels", seller: "BrightView Corp", verified: true,
    price: "890", unit: "panel", minOrder: "Min. 10 units",
    rating: 4.7, reviews: 94, location: "Delhi", category: "Electronics & Tech",
    description: "High-brightness commercial-grade LED display panels designed for retail, hospitality, and outdoor advertising. Features auto-brightness adjustment and wide viewing angles.",
    specs: [
      { label: "Size", value: "55\" / 65\" / 75\"" }, { label: "Brightness", value: "2,500 nit" },
      { label: "Resolution", value: "4K UHD" }, { label: "IP Rating", value: "IP55 (outdoor)" },
      { label: "Warranty", value: "2 years" }, { label: "Lead Time", value: "15–20 days" },
    ],
    reviewList: [
      { author: "HotelStar Group", rating: 5, comment: "Installed 40 panels across our lobby — stunning quality.", date: "Feb 2026" },
    ],
    sellerStats: { memberSince: "2020", totalOrders: "860+", responseTime: "< 4 hours", onTimePct: "96.2%" },
  },
};

function getFallback(id: string): ProductData {
  return demoProducts[id] ?? {
    id, name: `Product #${id}`, seller: "Bexo Seller", verified: false,
    price: "100", unit: "unit", minOrder: "Min. 10 units",
    rating: 4.5, reviews: 0, location: "India", category: "General",
    description: "Product details will be available shortly.",
    specs: [{ label: "Status", value: "Details loading..." }],
    reviewList: [],
    sellerStats: { memberSince: "2024", totalOrders: "0", responseTime: "N/A", onTimePct: "N/A" },
  };
}

function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "1px" }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 20 20">
          <path
            d="M10 1l2.39 4.84 5.35.78-3.87 3.77.91 5.32L10 13.27l-4.78 2.51.91-5.32L2.26 6.62l5.35-.78z"
            fill={i < Math.round(rating) ? "#f59e0b" : "#e0e0e0"}
          />
        </svg>
      ))}
    </span>
  );
}

function IconTruck() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13" rx="1" />
      <path d="M16 8h4l3 4v5h-7V8z" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}
function IconShield() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}
function IconAward() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="7" />
      <path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" />
    </svg>
  );
}
function IconRefresh() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 .49-3.5" />
    </svg>
  );
}
function IconChevronLeft() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}
function IconChevronRight() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

const THUMB_COUNT = 5;

const relatedProducts = [
  { id: "r1", name: "Heavy Duty Chain Drive", price: "1,850", unit: "set" },
  { id: "r2", name: "Industrial Motor Mount", price: "620", unit: "unit" },
  { id: "r3", name: "Steel Frame Support Kit", price: "3,100", unit: "kit" },
  { id: "r4", name: "Variable Speed Drive", price: "7,400", unit: "unit" },
  { id: "r5", name: "Pneumatic Roller System", price: "2,200", unit: "unit" },
  { id: "r6", name: "Control Panel Unit", price: "5,500", unit: "unit" },
];

const boughtTogether = [
  { id: "b1", name: "Industrial Conveyor Belt System", price: 4200 },
  { id: "b2", name: "Heavy Duty Chain Drive", price: 1850 },
  { id: "b3", name: "Pneumatic Roller System", price: 2200 },
];

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [product, setProduct] = useState<ProductData>(() => getFallback(id));
  const [quantity, setQuantity] = useState(1);
  const [activeThumb, setActiveThumb] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchProduct() {
      const supabase = createClient();
      const { data } = await supabase
        .from("products")
        .select(`
          id, name, description, category, price, price_unit, min_order_qty, min_order_unit,
          location, tags, specifications, avg_rating, review_count,
          sellers(company_name, verified, member_since, total_orders, response_time_h, on_time_pct)
        `)
        .eq("id", id)
        .single();

      if (data) {
        const seller = data.sellers as unknown as {
          company_name: string; verified?: boolean; member_since: string;
          total_orders: number; response_time_h: number; on_time_pct: number;
        } | null;
        const specs = data.specifications && typeof data.specifications === "object"
          ? Object.entries(data.specifications).map(([label, value]) => ({ label, value: String(value) }))
          : [{ label: "Details", value: "Coming soon" }];
        setProduct({
          id: data.id, name: data.name,
          seller: seller?.company_name ?? "Bexo Seller",
          verified: seller?.verified ?? false,
          price: Number(data.price).toLocaleString("en-IN"),
          unit: data.price_unit ?? "unit",
          minOrder: `Min. ${data.min_order_qty} ${data.min_order_unit}`,
          rating: Number(data.avg_rating) || 4.5,
          reviews: data.review_count || 0,
          location: data.location ?? "India",
          category: data.category,
          description: data.description ?? "Product details coming soon.",
          specs, reviewList: [],
          sellerStats: {
            memberSince: seller?.member_since ? new Date(seller.member_since).getFullYear().toString() : "2024",
            totalOrders: seller?.total_orders ? `${seller.total_orders}+` : "0",
            responseTime: seller?.response_time_h ? `< ${seller.response_time_h}h` : "N/A",
            onTimePct: seller?.on_time_pct ? `${seller.on_time_pct}%` : "N/A",
          },
        });
      }
    }
    fetchProduct();
  }, [id]);

  const emiAmount = Math.round(parseInt(product.price.replace(/,/g, "")) / 12).toLocaleString("en-IN");
  const totalBought = boughtTogether.reduce((s, p) => s + p.price, 0).toLocaleString("en-IN");

  function scrollCards(dir: "left" | "right") {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "left" ? -280 : 280, behavior: "smooth" });
  }

  return (
    <div style={{ background: "#ffffff", minHeight: "100vh" }}>

      {/* Breadcrumb */}
      <div style={{ background: "#fff", borderBottom: "1px solid #ececec" }}>
        <div
          className="max-w-screen-xl mx-auto px-6 py-3"
          style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#aaa" }}
        >
          <Link href="/" style={{ color: "#aaa", textDecoration: "none" }}>Home</Link>
          <span>/</span>
          <Link href="/products" style={{ color: "#aaa", textDecoration: "none" }}>Products</Link>
          <span>/</span>
          <span style={{ color: "#555", fontWeight: 500 }}>{product.name}</span>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-6 py-7">

        {/* ── Main 2-col: left scrollable | right sticky purchase panel ── */}
        <div style={{ display: "flex", gap: "28px", alignItems: "flex-start" }}>

          {/* LEFT: thumbnails + image (sticky), then all info below */}
          <div style={{ flex: 1, minWidth: 0 }}>

            {/* Thumbnails + image side by side — sticky */}
            <div style={{ position: "sticky", top: "80px", display: "flex", gap: "12px", background: "#fff", zIndex: 1 }}>
              {/* Thumbnail strip */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", flexShrink: 0 }}>
                {Array.from({ length: THUMB_COUNT }).map((_, i) => (
                  <div
                    key={i}
                    onClick={() => setActiveThumb(i)}
                    style={{
                      width: 60, height: 60,
                      background: "#ebebeb",
                      borderRadius: "8px",
                      border: activeThumb === i ? "2px solid #111" : "2px solid transparent",
                      cursor: "pointer",
                      flexShrink: 0,
                      transition: "border-color 0.12s",
                    }}
                  />
                ))}
              </div>
              {/* Main image */}
              <div style={{
                flex: 1,
                background: "#f0f0f0",
                borderRadius: "12px",
                height: 420,
                border: "1px solid #e4e4e4",
              }} />
            </div>

            {/* All product info below image */}
            <div style={{ marginTop: "28px" }}>

              {/* Product name */}
              <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#111", lineHeight: 1.3, margin: "0 0 10px" }}>
                {product.name}
              </h1>

              {/* Seller + verified */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                <span style={{ fontSize: "14px", color: "#555" }}>{product.seller}</span>
                {product.verified && (
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#1a8a5a", background: "#eafaf2", borderRadius: "4px", padding: "2px 7px" }}>
                    Verified
                  </span>
                )}
              </div>

              {/* Rating */}
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "14px" }}>
                <Stars rating={product.rating} size={14} />
                <span style={{ fontSize: "14px", fontWeight: 700, color: "#333" }}>{product.rating}</span>
                <span style={{ fontSize: "14px", color: "#bbb" }}>({product.reviews} reviews)</span>
              </div>

              {/* Taxes + EMI */}
              <p style={{ fontSize: "14px", color: "#aaa", marginBottom: "3px" }}>Inclusive of all taxes</p>
              <p style={{ fontSize: "14px", color: "#555", marginBottom: "22px" }}>
                EMI from <strong>₹{emiAmount}/month</strong> — No cost EMI available
              </p>

              {/* Offers */}
              <div style={{ marginBottom: "22px" }}>
                <p style={{ fontSize: "11px", fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "10px" }}>Offers</p>
                <div style={{ display: "flex", gap: "8px" }}>
                  {[
                    { title: "Bank Offer", desc: "5% off on HDFC cards" },
                    { title: "Cashback", desc: "2% cashback via UPI" },
                    { title: "Bulk Discount", desc: "10% off on 50+ units" },
                  ].map((offer) => (
                    <div key={offer.title} style={{ flex: 1, padding: "10px", border: "1px solid #e8e8e8", borderRadius: "8px", background: "#fafafa" }}>
                      <p style={{ fontSize: "12px", fontWeight: 700, color: "#111", marginBottom: "3px" }}>{offer.title}</p>
                      <p style={{ fontSize: "11px", color: "#888", lineHeight: 1.4 }}>{offer.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery icons */}
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "32px" }}>
                {[
                  { icon: <IconTruck />, label: "Fast Delivery" },
                  { icon: <IconShield />, label: "Secure Payment" },
                  { icon: <IconAward />, label: "Warranty" },
                  { icon: <IconRefresh />, label: "Easy Returns" },
                ].map(({ icon, label }) => (
                  <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "5px", flex: 1 }}>
                    {icon}
                    <span style={{ fontSize: "11px", color: "#666", fontWeight: 600, textAlign: "center", lineHeight: 1.3 }}>{label}</span>
                  </div>
                ))}
              </div>

              {/* Product Description */}
              <div style={{ marginBottom: "30px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#111", marginBottom: "12px" }}>Product Description</h3>
                <p style={{ fontSize: "16px", color: "#555", lineHeight: 1.75 }}>{product.description}</p>
              </div>

              {/* Key Details */}
              <div style={{ marginBottom: "30px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#111", marginBottom: "12px" }}>Key Details</h3>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <tbody>
                    {[
                      ["Category", product.category],
                      ["Location", product.location],
                      ["Min. Order", product.minOrder],
                      ["Rating", `${product.rating} / 5 (${product.reviews} reviews)`],
                    ].map(([k, v]) => (
                      <tr key={k} style={{ borderTop: "1px solid #f0f0f0" }}>
                        <td style={{ padding: "11px 0", fontSize: "14px", color: "#888", width: "160px" }}>{k}</td>
                        <td style={{ padding: "11px 0", fontSize: "14px", fontWeight: 600, color: "#222" }}>{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Technical Specifications */}
              <div style={{ marginBottom: "30px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#111", marginBottom: "12px" }}>Technical Specifications</h3>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <tbody>
                    {product.specs.map((spec, i) => (
                      <tr key={spec.label} style={{ borderTop: i === 0 ? "none" : "1px solid #f5f5f5" }}>
                        <td style={{ padding: "11px 0", fontSize: "14px", color: "#888", width: "180px" }}>{spec.label}</td>
                        <td style={{ padding: "11px 0", fontSize: "14px", fontWeight: 600, color: "#111" }}>{spec.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Reviews */}
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#111", marginBottom: "16px" }}>
                  Reviews ({product.reviews})
                </h3>
                {product.reviewList.length === 0 ? (
                  <p style={{ fontSize: "14px", color: "#bbb", padding: "16px 0" }}>No reviews yet for this product.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {product.reviewList.map((r, i) => (
                      <div key={i} style={{ padding: "16px", background: "#fafafa", borderRadius: "10px", border: "1px solid #f0f0f0" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                          <span style={{ fontSize: "14px", fontWeight: 600, color: "#222" }}>{r.author}</span>
                          <span style={{ fontSize: "14px", color: "#bbb" }}>{r.date}</span>
                        </div>
                        <Stars rating={r.rating} size={13} />
                        <p style={{ fontSize: "14px", color: "#555", marginTop: "8px", lineHeight: 1.65 }}>{r.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* RIGHT: Purchase panel — sticky */}
          <div style={{
            flex: "0 0 260px",
            position: "sticky", top: "80px", alignSelf: "flex-start",
            border: "1px solid #e0e0e0",
            borderRadius: "8px",
            padding: "20px",
            background: "#fff",
          }}>

            {/* Price */}
            <div style={{ marginBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: "5px" }}>
                <span style={{ fontSize: "28px", fontWeight: 800, color: "#111", letterSpacing: "-0.5px" }}>
                  ₹{product.price}
                </span>
                <span style={{ fontSize: "13px", color: "#aaa" }}>/ {product.unit}</span>
              </div>
            </div>

            {/* FREE delivery */}
            <p style={{ fontSize: "14px", color: "#555", marginBottom: "6px" }}>
              <span style={{ fontWeight: 700, color: "#111" }}>FREE</span> delivery by{" "}
              <span style={{ fontWeight: 600 }}>Mon, 7 Apr</span>
            </p>

            {/* Delivering to */}
            <p style={{ fontSize: "14px", color: "#555", marginBottom: "16px" }}>
              Delivering to <span style={{ fontWeight: 600, color: "#111" }}>{product.location}</span>
            </p>

            {/* Ships from / Sold by / Payment */}
            <div style={{ display: "flex", flexDirection: "column", gap: "7px", marginBottom: "18px" }}>
              {[
                { label: "Ships from", value: product.seller },
                { label: "Sold by", value: product.seller },
                { label: "Payment", value: "Secure transaction" },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                  <span style={{ fontSize: "13px", color: "#aaa", flexShrink: 0 }}>{label}</span>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#333", textAlign: "right" }}>{value}</span>
                </div>
              ))}
            </div>

            {/* Quantity */}
            <div style={{ marginBottom: "16px" }}>
              <p style={{ fontSize: "11px", fontWeight: 700, color: "#777", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>Quantity</p>
              <div style={{ display: "flex", alignItems: "center", border: "1px solid #e0e0e0", borderRadius: "8px", overflow: "hidden", width: "fit-content" }}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{ width: 36, height: 36, background: "#f8f8f8", fontSize: "20px", fontWeight: 300, color: "#333", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", border: "none" }}
                >−</button>
                <span style={{ width: 44, textAlign: "center", fontSize: "14px", fontWeight: 700, color: "#111", userSelect: "none" }}>
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  style={{ width: 36, height: 36, background: "#f8f8f8", fontSize: "20px", fontWeight: 300, color: "#333", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", border: "none" }}
                >+</button>
              </div>
            </div>

            {/* CTA buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "14px" }}>
              <button
                onClick={() => { window.location.href = "/auth/buyer"; }}
                style={{ width: "100%", padding: "12px", background: "#000", color: "#fff", borderRadius: "8px", fontSize: "14px", fontWeight: 700, cursor: "pointer", border: "none" }}
              >
                Place Order
              </button>
              <button
                onClick={() => { window.location.href = "/auth/buyer"; }}
                style={{ width: "100%", padding: "12px", background: "#007AFF", color: "#fff", borderRadius: "8px", fontSize: "14px", fontWeight: 700, cursor: "pointer", border: "none" }}
              >
                Contact Seller
              </button>
            </div>

            {/* Add to Wishlist */}
            <div style={{ textAlign: "center" }}>
              <button style={{ background: "none", border: "none", fontSize: "13px", color: "#007AFF", cursor: "pointer", fontWeight: 600 }}>
                Add to Wishlist
              </button>
            </div>

          </div>

        </div>

        {/* ── Frequently Bought Together ─────────────────────── */}
        <div style={{ background: "#fff", borderRadius: "14px", border: "1px solid #e8e8e8", padding: "26px 28px", marginTop: "32px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 800, color: "#111", marginBottom: "22px" }}>Frequently Bought Together</h2>

          <div style={{ display: "flex", alignItems: "center", gap: "0", flexWrap: "wrap" }}>
            {boughtTogether.map((item, i) => (
              <div key={item.id} style={{ display: "flex", alignItems: "center", gap: "0" }}>
                {/* Product card */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 160 }}>
                  <div style={{ width: 100, height: 100, background: "#f0f0f0", borderRadius: "10px", marginBottom: "10px", border: "1px solid #ebebeb" }} />
                  <p style={{ fontSize: "12px", fontWeight: 600, color: "#222", textAlign: "center", lineHeight: 1.4, marginBottom: "4px" }}>{item.name}</p>
                  <p style={{ fontSize: "13px", fontWeight: 800, color: "#111" }}>₹{item.price.toLocaleString("en-IN")}</p>
                </div>
                {/* Plus between items */}
                {i < boughtTogether.length - 1 && (
                  <div style={{ width: 32, textAlign: "center", fontSize: "18px", fontWeight: 300, color: "#bbb", flexShrink: 0 }}>+</div>
                )}
              </div>
            ))}

            {/* Total + button */}
            <div style={{ marginLeft: "auto", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "10px" }}>
              <p style={{ fontSize: "13px", color: "#888" }}>Total price</p>
              <p style={{ fontSize: "22px", fontWeight: 800, color: "#111" }}>₹{totalBought}</p>
              <button
                style={{ padding: "11px 22px", background: "#000", color: "#fff", borderRadius: "8px", fontSize: "13px", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}
                onClick={() => { window.location.href = "/auth/buyer"; }}
              >
                Add all to Cart
              </button>
            </div>
          </div>
        </div>

        {/* ── Customers also viewed ──────────────────────────── */}
        <div style={{ marginTop: "32px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <h2 style={{ fontSize: "16px", fontWeight: 800, color: "#111" }}>Customers also viewed</h2>
            <div style={{ display: "flex", gap: "6px" }}>
              <button
                onClick={() => scrollCards("left")}
                style={{ width: 34, height: 34, borderRadius: "50%", background: "#fff", border: "1px solid #e0e0e0", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#333" }}
              >
                <IconChevronLeft />
              </button>
              <button
                onClick={() => scrollCards("right")}
                style={{ width: 34, height: 34, borderRadius: "50%", background: "#fff", border: "1px solid #e0e0e0", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#333" }}
              >
                <IconChevronRight />
              </button>
            </div>
          </div>

          <div
            ref={scrollRef}
            style={{ display: "flex", gap: "14px", overflowX: "auto", scrollbarWidth: "none", paddingBottom: "4px" }}
          >
            {relatedProducts.map((item) => (
              <Link
                key={item.id}
                href={`/products/${item.id}`}
                style={{ textDecoration: "none", flexShrink: 0, width: 190 }}
              >
                <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e8e8e8", overflow: "hidden", transition: "border-color 0.15s" }}>
                  <div style={{ height: 140, background: "#f0f0f0", borderBottom: "1px solid #ebebeb" }} />
                  <div style={{ padding: "12px 14px" }}>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "#222", lineHeight: 1.4, marginBottom: "6px" }}>{item.name}</p>
                    <p style={{ fontSize: "14px", fontWeight: 800, color: "#111" }}>₹{item.price}</p>
                    <p style={{ fontSize: "11px", color: "#aaa", marginTop: "2px" }}>per {item.unit}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
