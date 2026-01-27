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
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      <div className="relative w-[92%] max-w-2xl premium-card overflow-hidden">
        {/* unchanged UI */}
        ...
      </div>
    </div>
  );
}
