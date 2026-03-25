import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/Header";

export const metadata: Metadata = {
  title: "Karobarrr — B2B Marketplace",
  description: "The trusted B2B marketplace connecting verified sellers with buyers worldwide.",
};

function Footer() {
  return (
    <footer className="bg-[#f8f9fa] text-black">
      <div className="max-w-screen-xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="text-2xl font-black text-black tracking-tight mb-3">Karobarrr</div>
            <p className="text-sm text-gray-600 leading-relaxed">
              The trusted B2B marketplace connecting verified sellers with serious buyers worldwide.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-black text-sm mb-4">Marketplace</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="/products" className="hover:text-black transition-colors rounded-full">Browse Products</a></li>
              <li><a href="/requirements" className="hover:text-black transition-colors rounded-full">Post Requirement</a></li>
              <li><a href="/auth/seller" className="hover:text-black transition-colors rounded-full">Become a Seller</a></li>
              <li><a href="/seller/dashboard" className="hover:text-black transition-colors rounded-full">Seller Dashboard</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-black text-sm mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="#" className="hover:text-black transition-colors rounded-full">About Karobarrr</a></li>
              <li><a href="#" className="hover:text-black transition-colors rounded-full">Contact Us</a></li>
              <li><a href="#" className="hover:text-black transition-colors rounded-full">Careers</a></li>
              <li><a href="#" className="hover:text-black transition-colors rounded-full">Blog</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-black text-sm mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="#" className="hover:text-black transition-colors rounded-full">Terms of Service</a></li>
              <li><a href="#" className="hover:text-black transition-colors rounded-full">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-black transition-colors rounded-full">Cookie Policy</a></li>
              <li><a href="#" className="hover:text-black transition-colors rounded-full">Refund Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
          <span>© 2026 Karobarrr Technologies. All rights reserved.</span>
          <span>Made for global B2B trade</span>
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
      <body className="min-h-full flex flex-col antialiased bg-[#f8f9fa]">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
