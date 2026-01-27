"use client";

import { useMemo, useState } from "react";
import { PRODUCTS } from "./data";
import { useCart } from "./CartContext";
import ProductQuickView from "./ProductQuickView";

type Props = {
  activeCategory: string;
  searchQuery: string;
};

export default function Products({ activeCategory, searchQuery }: Props) {
  const cart = useCart();
  const [selected, setSelected] = useState<(typeof PRODUCTS)[number] | null>(null);

  const list = useMemo(() => {
    const base =
      activeCategory === "All" ? PRODUCTS : PRODUCTS.filter((p) => p.category === activeCategory);

    const q = searchQuery.trim().toLowerCase();
    if (!q) return base;

    return base.filter((p) => {
      const w = (p.weight || "").toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        w.includes(q)
      );
    });
  }, [activeCategory, searchQuery]);

  return (
    <>
    <section id="products" className="px-6 pb-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-end justify-between gap-6 mb-10">
          <div>
            <h2 className="text-4xl mb-2">Featured Products</h2>
            <p className="opacity-75">
              Freshly prepared sweets & snacks — authentic Konaseema taste.
            </p>
          </div>

          <div className="hidden md:block opacity-70 text-sm">
            Showing: <span className="font-semibold">{activeCategory}</span>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {list.map((p) => (
            <div
              key={p.id}
              className="premium-card overflow-hidden flex flex-col cursor-pointer"
              onClick={() => setSelected(p)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter") setSelected(p);
              }}
            >
              {/* Image */}
              <div className="relative w-full aspect-[4/3] overflow-hidden bg-cream">
                <img
                  src={p.image}
                  alt={p.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>

              {/* Content */}
              <div className="p-5 flex-1 flex flex-col">
                <div className="text-xs text-gold font-semibold tracking-wide mb-2">
                  {p.category}
                </div>

                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-xl leading-snug line-clamp-2">
                    {p.name}
                  </h3>
                  <div className="font-bold text-lg whitespace-nowrap">
                    ₹{p.price}
                  </div>
                </div>

                <div className="opacity-75 mt-1 text-sm">{p.weight}</div>

                {/* Buttons */}
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <button
                    className="btn-primary py-2 px-4 rounded-xl text-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      cart.add(p);
                    }}
                  >
                    Add to Cart
                  </button>

                  <a
                    className="btn-primary py-2 px-4 rounded-xl text-sm bg-green-700 hover:bg-green-800 text-center"
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    href={`https://wa.me/91XXXXXXXXXX?text=${encodeURIComponent(
                      `Hi Konaseema Foods, I want to order: ${p.name} (${p.weight}) - ₹${p.price}`
                    )}`}
                  >
                    WhatsApp
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {list.length === 0 && (
          <div className="mt-10 opacity-70">
            No products in this category yet.
          </div>
        )}
      </div>
    </section>

    {selected && (
      <ProductQuickView
        product={selected}
        onClose={() => setSelected(null)}
        onAdd={() => cart.add(selected)}
      />
    )}
    </>
  );
}
