"use client";

import { useState } from "react";
import { MessageCircle, ShoppingCart } from "lucide-react";
import { useCart } from "./CartContext";
import { useAuth } from "./AuthContext";
import AuthModal from "./AuthModal";

export default function Navbar() {
  const cart = useCart();
  const { user, logout } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-cream/90 border-b border-gold">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <button className="brand-logo text-3xl text-brown" onClick={() => scrollTo("home")}>
            Konaseema Specials
          </button>

          <div className="hidden md:flex gap-8 font-semibold">
            <button className="hover:text-gold" onClick={() => scrollTo("home")}>Home</button>
            <button className="hover:text-gold" onClick={() => scrollTo("categories")}>Categories</button>
            <button className="hover:text-gold" onClick={() => scrollTo("products")}>Products</button>
            <button className="hover:text-gold" onClick={() => scrollTo("about")}>About</button>
            <button className="hover:text-gold" onClick={() => scrollTo("contact")}>Contact</button>
          </div>

          <div className="flex items-center gap-4">
            {!user ? (
              <button
                type="button"
                onClick={() => setAuthOpen(true)}
                className="px-5 py-2 rounded-full border-2 border-blue-600 text-blue-700 font-semibold"
              >
                Login
              </button>
            ) : (
              <button
                type="button"
                onClick={logout}
                className="px-5 py-2 rounded-full border border-[#d9c4a7] font-semibold hover:bg-[#f6efe6]"
                title={user.email ?? "Logged in"}
              >
                Logout
              </button>
            )}

            <button className="relative" onClick={cart.open} aria-label="Open cart" type="button">
              <ShoppingCart />
              {cart.count > 0 && (
                <span className="absolute -top-2 -right-2 bg-gold text-brown text-xs font-bold rounded-full px-2 py-0.5">
                  {cart.count}
                </span>
              )}
            </button>

            <a aria-label="WhatsApp" className="text-green-700" href="https://wa.me/91XXXXXXXXXX" target="_blank">
              <MessageCircle />
            </a>
          </div>
        </div>
      </nav>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
