export default function CartPage() {
  return (
    <div
      style={{ background: 'var(--bg)', minHeight: '60vh' }}
      className="flex flex-col items-center justify-center px-6 py-20"
    >
      <div
        className="flex flex-col items-center text-center p-12"
        style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-raised)', borderRadius: 'var(--radius-md)', maxWidth: '480px', width: '100%' }}
      >
        <div
          className="flex items-center justify-center mb-6"
          style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--bg)', boxShadow: 'var(--shadow-inset)' }}
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--text-inactive)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
        </div>

        <h1 className="text-2xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>Your cart is empty</h1>
        <p className="text-sm mb-8" style={{ color: 'var(--text-inactive)' }}>
          Looks like you haven't added anything yet. Browse our marketplace to find what you need.
        </p>

        <a
          href="/products"
          className="px-8 py-3 text-sm font-semibold"
          style={{ background: 'var(--active-bg)', color: '#fff', borderRadius: 'var(--radius-pill)', boxShadow: 'var(--shadow-active)', display: 'inline-block' }}
        >
          Browse Products
        </a>
      </div>
    </div>
  );
}
