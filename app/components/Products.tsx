"use client";

import { useState } from "react";
import { PRODUCTS } from "./data";
import { useCart } from "./CartContext";
import ProductQuickView from "./ProductQuickView";

export default function Products({
  activeCategory,
  searchQuery,
}: {
  activeCategory: string;
  searchQuery: string;
}) {
  const cart = useCart();
  const [selected, setSelected] = useState<any | null>(null);

  const filtered = PRODUCTS.filter((p) => {
    const byCategory = activeCategory === "All" || p.category === activeCategory;
    const q = searchQuery.toLowerCase();
    const bySearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q);
    return byCategory && bySearch;
  });

  return (
    <>
      <section className="px-6 pb-24" id="products">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-[34px] font-semibold tracking-tight mb-8">
            Featured Products
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {filtered.map((p) => (
              <div
                key={p.id}
                onClick={() => setSelected(p)}
                className="group bg-white rounded-2xl border border-[#e8dccb] hover:shadow-lg transition cursor-pointer"
              >
                <div className="overflow-hidden rounded-t-2xl">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-[160px] object-cover group-hover:scale-[1.04] transition"
                  />
                </div>

                <div className="p-4">
                  <h3 className="text-[15px] font-medium leading-tight">
                    {p.name}
                  </h3>

                  <p className="text-[12px] text-gray-500 mt-1">
                    {p.weight}
                  </p>

                  <div className="flex items-center justify-between mt-3">
                    <span className="text-[15px] font-semibold">
                      ₹{p.price}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        cart.add(p);
                      }}
                      className="text-[12px] px-3 py-1 rounded-full border border-[#c9a36a] hover:bg-[#c9a36a] hover:text-white transition"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* QUICK VIEW */}
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
