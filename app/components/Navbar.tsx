"use client";

import { MessageCircle, ShoppingCart, User } from "lucide-react";
import { useCart } from "./CartContext";
import { useAuth } from "./AuthContext";

export default function Navbar() {
  const cart = useCart();
  const { user, login, logout } = useAuth();

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-cream/90 border-b border-gold">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        <button className="brand-logo text-3xl" onClick={() => scrollTo("home")}>
          Konaseema Foods
        </button>

        <div className="hidden md:flex gap-8 font-semibold">
          <button onClick={() => scrollTo("home")}>Home</button>
          <button onClick={() => scrollTo("categories")}>Categories</button>
          <button onClick={() => scrollTo("products")}>Products</button>
        </div>

        <div className="flex items-center gap-4">
          {/* LOGIN / LOGOUT */}
          {!user ? (
            <button onClick={login} className="flex items-center gap-1 text-sm">
              <User size={18} /> Login
            </button>
          ) : (
            <button onClick={logout} className="flex items-center gap-1 text-sm">
              Logout
            </button>
          )}

          {/* CART */}
          <button className="relative" onClick={cart.open}>
            <ShoppingCart />
            {cart.count > 0 && (
              <span className="absolute -top-2 -right-2 bg-gold text-xs rounded-full px-2">
                {cart.count}
              </span>
            )}
          </button>

          {/* WHATSAPP */}
          <a href="https://wa.me/91XXXXXXXXXX" target="_blank">
            <MessageCircle />
          </a>
        </div>
      </div>
    </nav>
  );
}
