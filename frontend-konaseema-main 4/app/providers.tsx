"use client";

import { CartProvider } from "./components/CartContext";

/**
 * Client-side provider boundary.
 * Helps avoid build-time/SSR errors where a hook is evaluated
 * outside the provider tree.
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}
