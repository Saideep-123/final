"use client";

import { useMemo } from "react";
import { PRODUCTS } from "./data";
import { useCart } from "./CartContext";

type Props = {
  activeCategory: string;
  searchQuery: string;
};

export default function Products({ activeCategory, searchQuery }: Props) {
  const cart = useCart();

  const list = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return PRODUCTS.filter((p) => {
      const inCategory = activeCategory === "All" ? true : p.category === activeCategory;
      const inSearch =
        q.length === 0
          ? true
          : p.name.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            p.weight.toLowerCase().includes(q);
      return inCategory && inSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <section id="products" className="px-6 pb-20">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between gap-6 mb-10">
          <div>
            <h2 className="text-4xl mb-2">Featured Products</h2>
            <p className="opacity-75">Freshly prepared sweets & snacks — authentic Konaseema taste.</p>
          </div>

          <div className="hidden md:block text-sm opacity-70">
            Showing <span className="font-semibold">{list.length}</span> item(s)
          </div>
        </div>

        {list.length === 0 ? (
          <div className="premium-card p-8">
            <div className="text-xl mb-2">No results</div>
            <p className="opacity-75">Try a different search keyword or switch category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {list.map((p) => (
              <div key={p.id} className="premium-card overflow-hidden">
                <div className="relative">
                  <img src={p.image} alt={p.name} className="w-full h-56 object-cover" />
                  <div className="absolute left-4 top-4 text-xs px-3 py-1 rounded-full bg-black/55 text-white">
                    {p.category}
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold">{p.name}</h3>
                      <p className="opacity-70 text-sm">{p.weight}</p>
                    </div>
                    <div className="text-xl font-bold">₹{p.price}</div>
                  </div>

                  <button className="btn-primary w-full mt-5" onClick={() => cart.add(p)} type="button">
                    Add to cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
