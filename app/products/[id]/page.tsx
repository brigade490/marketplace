"use client";

import Link from "next/link";
import { use, useState, useEffect } from "react";
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
    price: "₹4,200", unit: "unit", minOrder: "Min. 5 units",
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
    price: "₹890", unit: "panel", minOrder: "Min. 10 units",
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
    id, name: `Product #${id}`, seller: "Karobarrr Seller", verified: false,
    price: "₹100", unit: "unit", minOrder: "Min. 10 units",
    rating: 4.5, reviews: 0, location: "India", category: "General",
    description: "Product details will be available shortly.",
    specs: [{ label: "Status", value: "Details loading..." }],
    reviewList: [],
    sellerStats: { memberSince: "2024", totalOrders: "0", responseTime: "N/A", onTimePct: "N/A" },
  };
}

function StarRow({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 12 12" fill="none">
          <path
            d="M6 1l1.236 2.506 2.764.402-2 1.948.472 2.75L6 7.506l-2.472 1.1.472-2.75-2-1.948 2.764-.402z"
            fill={i < Math.round(rating) ? '#f59e0b' : '#e0e0e0'}
          />
        </svg>
      ))}
    </span>
  );
}

// Small icon SVGs
function IconTruck() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 3h15v13H1z"/><path d="M16 8h4l3 3v5h-7z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>;
}
function IconShield() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
}
function IconAward() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12"/></svg>;
}
function IconRefresh() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.5"/></svg>;
}

const thumbnails = [1, 2, 3, 4];

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [product, setProduct] = useState<ProductData>(() => getFallback(id));
  const [tab, setTab] = useState<"overview" | "specs" | "reviews">("overview");
  const [quantity, setQuantity] = useState(1);
  const [activeThumb, setActiveThumb] = useState(0);

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
          seller: seller?.company_name ?? "Karobarrr Seller",
          verified: seller?.verified ?? false,
          price: `₹${Number(data.price).toLocaleString("en-IN")}`,
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

  return (
    <div className="min-h-screen" style={{ background: '#f7f7f8' }}>

      {/* Breadcrumb */}
      <div style={{ background: '#fff', borderBottom: '1px solid #f0f0f0' }}>
        <div className="max-w-screen-xl mx-auto px-6 py-2.5 flex items-center gap-1.5" style={{ fontSize: '12px', color: '#aaa' }}>
          <Link href="/" style={{ color: '#aaa', textDecoration: 'none' }} className="hover:text-gray-600">Home</Link>
          <span>/</span>
          <Link href="/products" style={{ color: '#aaa', textDecoration: 'none' }} className="hover:text-gray-600">Products</Link>
          <span>/</span>
          <span style={{ color: '#555', fontWeight: 500 }} className="truncate max-w-xs">{product.name}</span>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-6 py-6">
        <div className="flex gap-6 items-start">

          {/* ── LEFT: Gallery + Tabs ──────────────────────── */}
          <div className="flex-1 min-w-0">

            {/* Image gallery row */}
            <div className="flex gap-3 mb-5">
              {/* Thumbnail strip */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '72px', flexShrink: 0 }}>
                {thumbnails.map((_, i) => (
                  <div
                    key={i}
                    onClick={() => setActiveThumb(i)}
                    style={{
                      width: '72px', height: '72px',
                      background: '#f0f0f0',
                      borderRadius: '8px',
                      border: activeThumb === i ? '2px solid #111' : '2px solid transparent',
                      cursor: 'pointer',
                      transition: 'border-color 0.15s',
                      flexShrink: 0,
                    }}
                  />
                ))}
              </div>

              {/* Main image */}
              <div style={{
                flex: 1,
                background: '#f5f5f5',
                borderRadius: '12px',
                height: '420px',
                border: '1px solid #eee',
              }} />
            </div>

            {/* Tabs */}
            <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #e8e8e8', overflow: 'hidden' }}>
              <div style={{ display: 'flex', borderBottom: '1px solid #f0f0f0' }}>
                {(["overview", "specs", "reviews"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    style={{
                      flex: 1, padding: '13px 0',
                      fontSize: '13px', fontWeight: tab === t ? 700 : 500,
                      color: tab === t ? '#111' : '#888',
                      background: 'transparent', border: 'none',
                      borderBottom: tab === t ? '2px solid #111' : '2px solid transparent',
                      cursor: 'pointer', textTransform: 'capitalize',
                      transition: 'color 0.15s',
                    }}
                  >
                    {t}{t === "reviews" ? ` (${product.reviews})` : ""}
                  </button>
                ))}
              </div>

              <div style={{ padding: '24px' }}>

                {tab === "overview" && (
                  <div>
                    <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#111', marginBottom: '10px' }}>Product Description</h3>
                    <p style={{ fontSize: '13px', color: '#555', lineHeight: 1.7 }}>{product.description}</p>
                    <div style={{ marginTop: '20px', background: '#fafafa', borderRadius: '8px', padding: '16px', border: '1px solid #f0f0f0' }}>
                      <h4 style={{ fontSize: '11px', fontWeight: 700, color: '#333', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Key Details</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px 24px' }}>
                        {[
                          ['Category', product.category],
                          ['Location', product.location],
                          ['Min. Order', product.minOrder],
                          ['Rating', `${product.rating} (${product.reviews} reviews)`],
                        ].map(([k, v]) => (
                          <>
                            <span key={`k-${k}`} style={{ fontSize: '12px', color: '#999' }}>{k}</span>
                            <span key={`v-${k}`} style={{ fontSize: '12px', fontWeight: 600, color: '#222' }}>{v}</span>
                          </>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {tab === "specs" && (
                  <div>
                    <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#111', marginBottom: '14px' }}>Technical Specifications</h3>
                    <div>
                      {product.specs.map((spec, i) => (
                        <div key={spec.label} style={{ display: 'flex', gap: '24px', padding: '10px 0', borderTop: i === 0 ? 'none' : '1px solid #f5f5f5' }}>
                          <div style={{ width: '160px', flexShrink: 0, fontSize: '12px', color: '#888' }}>{spec.label}</div>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: '#111' }}>{spec.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {tab === "reviews" && (
                  <div>
                    {product.reviewList.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '40px 0', color: '#bbb' }}>
                        <p style={{ fontSize: '13px' }}>No reviews yet for this product.</p>
                      </div>
                    ) : (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', padding: '16px', background: '#fafafa', borderRadius: '8px', border: '1px solid #f0f0f0' }}>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '36px', fontWeight: 800, color: '#111', lineHeight: 1 }}>{product.rating}</div>
                            <StarRow rating={product.rating} size={16} />
                            <div style={{ fontSize: '11px', color: '#aaa', marginTop: '4px' }}>{product.reviews} reviews</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {product.reviewList.map((r, i) => (
                            <div key={i} style={{ padding: '14px 16px', background: '#fafafa', borderRadius: '8px', border: '1px solid #f0f0f0' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                                <span style={{ fontSize: '13px', fontWeight: 600, color: '#222' }}>{r.author}</span>
                                <span style={{ fontSize: '11px', color: '#bbb' }}>{r.date}</span>
                              </div>
                              <StarRow rating={r.rating} size={12} />
                              <p style={{ fontSize: '12px', color: '#555', marginTop: '6px', lineHeight: 1.6 }}>{r.comment}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>
          </div>

          {/* ── RIGHT: Purchase panel ─────────────────────── */}
          <div style={{ width: '340px', flexShrink: 0 }}>
            <div className="sticky" style={{ top: '80px', background: '#fff', borderRadius: '12px', border: '1px solid #e8e8e8', padding: '22px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Name */}
              <div>
                <h1 style={{ fontSize: '17px', fontWeight: 800, color: '#111', lineHeight: 1.35, marginBottom: '10px' }}>{product.name}</h1>

                {/* Seller + verified */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', color: '#555' }}>{product.seller}</span>
                  {product.verified && (
                    <span style={{ fontSize: '10px', fontWeight: 600, color: '#666', border: '1px solid #ccc', borderRadius: '4px', padding: '1px 5px' }}>
                      Verified
                    </span>
                  )}
                </div>

                {/* Rating */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <StarRow rating={product.rating} size={13} />
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#333' }}>{product.rating}</span>
                  <span style={{ fontSize: '12px', color: '#bbb' }}>({product.reviews} reviews)</span>
                </div>
              </div>

              {/* Divider */}
              <div style={{ borderTop: '1px solid #f0f0f0' }} />

              {/* Price */}
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                  <span style={{ fontSize: '28px', fontWeight: 800, color: '#111' }}>{product.price}</span>
                  <span style={{ fontSize: '13px', color: '#999' }}>/ {product.unit}</span>
                </div>
                <p style={{ fontSize: '11px', color: '#999', marginTop: '3px' }}>Inclusive of all taxes</p>
                <p style={{ fontSize: '11px', color: '#555', marginTop: '3px' }}>
                  EMI from <strong>₹499/month</strong> — No cost EMI available
                </p>
              </div>

              {/* Offers */}
              <div>
                <p style={{ fontSize: '11px', fontWeight: 700, color: '#333', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Offers</p>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[
                    { title: 'Bank Offer', desc: '5% off on HDFC cards' },
                    { title: 'Cashback', desc: '2% cashback via UPI' },
                    { title: 'Bulk Discount', desc: '10% off on 50+ units' },
                  ].map((offer) => (
                    <div key={offer.title} style={{ flex: 1, padding: '8px 9px', border: '1px solid #e8e8e8', borderRadius: '8px', background: '#fafafa' }}>
                      <p style={{ fontSize: '11px', fontWeight: 700, color: '#111', marginBottom: '2px' }}>{offer.title}</p>
                      <p style={{ fontSize: '10px', color: '#888', lineHeight: 1.4 }}>{offer.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery icons */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  {[
                    { icon: <IconTruck />, label: 'Fast Delivery' },
                    { icon: <IconShield />, label: 'Secure Payment' },
                    { icon: <IconAward />, label: 'Warranty' },
                    { icon: <IconRefresh />, label: 'Easy Returns' },
                  ].map(({ icon, label }) => (
                    <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flex: 1 }}>
                      {icon}
                      <span style={{ fontSize: '9px', color: '#777', fontWeight: 600, textAlign: 'center', lineHeight: 1.3 }}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div style={{ borderTop: '1px solid #f0f0f0' }} />

              {/* Quantity */}
              <div>
                <p style={{ fontSize: '11px', fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>Quantity</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    style={{ width: '34px', height: '34px', borderRadius: '8px', border: '1px solid #e0e0e0', background: '#fff', fontSize: '18px', fontWeight: 400, color: '#333', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >−</button>
                  <input
                    type="number" value={quantity} min={1}
                    onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                    style={{ flex: 1, textAlign: 'center', padding: '7px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', fontWeight: 700, color: '#111', outline: 'none' }}
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    style={{ width: '34px', height: '34px', borderRadius: '8px', border: '1px solid #e0e0e0', background: '#fff', fontSize: '18px', fontWeight: 400, color: '#333', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >+</button>
                </div>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  onClick={() => { window.location.href = "/auth/buyer"; }}
                  style={{ width: '100%', padding: '12px', background: '#000', color: '#fff', border: 'none', borderRadius: '999px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', transition: 'opacity 0.15s' }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = '0.85')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = '1')}
                >
                  Place Order
                </button>
                <button
                  onClick={() => { window.location.href = "/auth/buyer"; }}
                  style={{ width: '100%', padding: '12px', background: '#fff', color: '#000', border: '1.5px solid #000', borderRadius: '999px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', transition: 'background 0.15s' }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = '#f5f5f5')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = '#fff')}
                >
                  Contact Seller
                </button>
              </div>

              {/* Divider */}
              <div style={{ borderTop: '1px solid #f0f0f0' }} />

              {/* Shipping info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                {[
                  { label: 'Ships from', value: product.seller },
                  { label: 'Sold by', value: product.seller },
                  { label: 'Payment', value: 'Secure transaction' },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: '#999' }}>{label}</span>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#333' }}>{value}</span>
                  </div>
                ))}
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
