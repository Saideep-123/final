"use client";

import { useEffect } from "react";
import type { Product } from "./CartContext";

export default function ProductQuickView({
  product,
  onClose,
  onAdd,
}: {
  product: Product;
  onClose: () => void;
  onAdd: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* overlay */}
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-label="Close"
      />

      {/* modal */}
      <div className="relative w-[92%] max-w-2xl premium-card overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="relative aspect-[4/3] md:aspect-auto md:h-full overflow-hidden bg-cream">
            <img
              src={product.image}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>

          <div className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs text-gold font-semibold tracking-wide mb-2">
                  {product.category}
                </div>
                <h3 className="text-2xl leading-snug">{product.name}</h3>
                <div className="opacity-75 mt-2 text-sm">{product.weight}</div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="text-2xl leading-none opacity-70 hover:opacity-100"
                aria-label="Close quick view"
              >
                ×
              </button>
            </div>

            <div className="mt-5 flex items-center justify-between">
              <div className="text-lg font-bold">₹{product.price}</div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                className="btn-primary py-2 px-4 rounded-xl text-sm"
                onClick={onAdd}
                type="button"
              >
                Add to Cart
              </button>
              <button
                className="btn-primary py-2 px-4 rounded-xl text-sm bg-[#3b2417] hover:bg-[#2d1a10]"
                onClick={onClose}
                type="button"
              >
                Continue
              </button>
            </div>

            <div className="mt-3 text-xs opacity-60">
              Tip: press <span className="font-semibold">Esc</span> to close.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
