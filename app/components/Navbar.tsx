"use client";

import { MessageCircle, ShoppingCart, User } from "lucide-react";
import { useCart } from "./CartContext";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const cart = useCart();
  const router = useRouter();

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-cream/90 border-b border-gold">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        {/* Brand */}
        <button
          className="brand-logo text-3xl text-brown"
          onClick={() => scrollTo("home")}
        >
          Konaseema Foods
        </button>

        {/* Menu */}
        <div className="hidden md:flex gap-8 font-semibold">
          <button onClick={() => scrollTo("home")} className="hover:text-gold">Home</button>
          <button onClick={() => scrollTo("categories")} className="hover:text-gold">Categories</button>
          <button onClick={() => scrollTo("products")} className="hover:text-gold">Products</button>
          <button onClick={() => scrollTo("about")} className="hover:text-gold">About</button>
          <button onClick={() => scrollTo("contact")} className="hover:text-gold">Contact</button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {/* LOGIN (restored) */}
          <button
            onClick={() => router.push("/login")}
            className="flex items-center gap-1 text-sm font-semibold hover:text-gold"
            aria-label="Login"
          >
            <User size={18} />
            Login
          </button>

          {/* Cart */}
          <button
            className="relative"
            onClick={cart.open}
            aria-label="Open cart"
          >
            <ShoppingCart />
            {cart.count > 0 && (
              <span className="absolute -top-2 -right-2 bg-gold text-brown text-xs font-bold rounded-full px-2 py-0.5">
                {cart.count}
              </span>
            )}
          </button>

          {/* WhatsApp */}
          <a
            aria-label="WhatsApp"
            className="text-green-700"
            href="https://wa.me/91XXXXXXXXXX"
            target="_blank"
          >
            <MessageCircle />
          </a>
        </div>
      </div>
    </nav>
  );
}
