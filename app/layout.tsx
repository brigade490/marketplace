import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bexo — B2B Marketplace",
  description: "The trusted B2B marketplace connecting verified sellers with buyers worldwide.",
};

function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1 shrink-0">
            <span className="text-2xl font-black text-gray-900 tracking-tight">
              Bex
            </span>
            <span className="text-2xl font-black text-yellow-400 tracking-tight">
              o
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 mb-3 ml-0.5"></span>
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
            <Link href="/" className="hover:text-gray-900 transition-colors">Home</Link>
            <Link href="/products" className="hover:text-gray-900 transition-colors">Products</Link>
            <Link href="/requirements" className="hover:text-gray-900 transition-colors">Requirements</Link>
            <a href="#how-it-works" className="hover:text-gray-900 transition-colors">How it works</a>
          </nav>

          {/* Search bar */}
          <div className="flex-1 max-w-md hidden sm:block">
            <Link href="/products" className="flex items-center gap-2 w-full px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-400 hover:border-yellow-400 hover:bg-yellow-50 transition-all cursor-pointer">
              <span>🔍</span>
              <span>Search products, sellers...</span>
            </Link>
          </div>

          {/* Auth buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/auth/buyer"
              className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              Login
            </Link>
            <Link
              href="/auth/buyer"
              className="inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 bg-yellow-400 rounded-xl hover:bg-yellow-500 transition-colors"
            >
              Sign Up
            </Link>
            <Link
              href="/auth/seller"
              className="hidden lg:inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:border-yellow-400 hover:text-yellow-600 transition-all"
            >
              Sell on Bexo
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-1 mb-3">
              <span className="text-2xl font-black text-white tracking-tight">Bex</span>
              <span className="text-2xl font-black text-yellow-400 tracking-tight">o</span>
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 mb-3 ml-0.5"></span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              The trusted B2B marketplace connecting verified sellers with serious buyers worldwide.
            </p>
            {/* Social */}
            <div className="flex items-center gap-3 mt-4">
              <a href="#" aria-label="Twitter" className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-800 hover:bg-yellow-400 hover:text-gray-900 transition-all text-sm">𝕏</a>
              <a href="#" aria-label="LinkedIn" className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-800 hover:bg-yellow-400 hover:text-gray-900 transition-all text-sm">in</a>
              <a href="#" aria-label="Facebook" className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-800 hover:bg-yellow-400 hover:text-gray-900 transition-all text-sm">f</a>
              <a href="#" aria-label="Instagram" className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-800 hover:bg-yellow-400 hover:text-gray-900 transition-all text-sm">📷</a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Marketplace</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/products" className="hover:text-yellow-400 transition-colors">Browse Products</Link></li>
              <li><Link href="/requirements" className="hover:text-yellow-400 transition-colors">Post Requirement</Link></li>
              <li><Link href="/auth/seller" className="hover:text-yellow-400 transition-colors">Become a Seller</Link></li>
              <li><Link href="/seller/dashboard" className="hover:text-yellow-400 transition-colors">Seller Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-yellow-400 transition-colors">About Bexo</a></li>
              <li><a href="#" className="hover:text-yellow-400 transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-yellow-400 transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-yellow-400 transition-colors">Blog</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-yellow-400 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-yellow-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-yellow-400 transition-colors">Cookie Policy</a></li>
              <li><a href="#" className="hover:text-yellow-400 transition-colors">Refund Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
          <span>© 2026 Bexo Technologies. All rights reserved.</span>
          <span>Made with ❤️ for global B2B trade</span>
        </div>
      </div>
    </footer>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
