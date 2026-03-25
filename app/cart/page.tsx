export default function CartPage() {
  return (
    <div
      style={{ background: '#f7f7f8', minHeight: '60vh' }}
      className="flex flex-col items-center justify-center px-6 py-20"
    >
      <div
        className="bg-white flex flex-col items-center text-center p-12"
        style={{ borderRadius: '16px', boxShadow: '0 2px 16px rgba(0,0,0,0.07)', maxWidth: '480px', width: '100%' }}
      >
        {/* Cart icon */}
        <div
          className="flex items-center justify-center mb-6"
          style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#f7f7f8' }}
        >
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#9ca3af"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
        </div>

        <h1 className="text-2xl font-black text-black mb-2">Your cart is empty</h1>
        <p className="text-sm text-gray-500 mb-8">
          Looks like you haven't added anything yet. Browse our marketplace to find what you need.
        </p>

        <a
          href="/products"
          className="px-8 py-3 text-sm font-semibold text-white"
          style={{ background: '#000000', borderRadius: '999px', display: 'inline-block' }}
        >
          Browse Products
        </a>
      </div>
    </div>
  );
}
