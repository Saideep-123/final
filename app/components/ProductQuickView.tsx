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

  if (!product) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Overlay */}
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-label="Close"
      />

      {/* Modal */}
      <div className="relative w-[92%] max-w-2xl bg-white rounded-2xl overflow-hidden border border-[#e8dccb] shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image */}
          <div className="relative h-[240px] md:h-full overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs text-[#c9a36a] font-semibold tracking-wide mb-2">
                  {product.category}
                </div>

                <h3 className="text-2xl font-semibold leading-snug">
                  {product.name}
                </h3>

                {product.weight && (
                  <div className="text-sm opacity-70 mt-1">
                    {product.weight}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={onClose}
                className="text-2xl leading-none opacity-60 hover:opacity-100"
                aria-label="Close quick view"
              >
                ×
              </button>
            </div>

            {product.desc && (
              <p className="mt-4 text-sm leading-relaxed opacity-80">
                {product.desc}
              </p>
            )}

            <div className="mt-6 flex items-center justify-between">
              <div className="text-lg font-bold">
                ₹{product.price}
              </div>
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
                className="px-4 py-2 rounded-xl text-sm border border-[#c9a36a] hover:bg-[#f6efe6]"
                onClick={onClose}
                type="button"
              >
                Continue
              </button>
            </div>

            <div className="mt-3 text-xs opacity-60">
              Tip: press <span className="font-semibold">Esc</span> to close
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
