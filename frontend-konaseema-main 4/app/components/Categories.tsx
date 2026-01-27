"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { CATEGORIES, PRODUCTS } from "./data";

export default function Categories({
  active,
  setActive,
  searchQuery,
  setSearchQuery,
}: {
  active: string;
  setActive: (v: string) => void;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);

  const suggestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return PRODUCTS.filter((p) => {
      const w = (p.weight || "").toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        w.includes(q)
      );
    }).slice(0, 6);
  }, [searchQuery]);

  return (
    <section id="categories" className="px-6 py-16">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-4xl mb-2">Shop by Category</h2>
            <p className="opacity-75">Choose sweets, snacks, pickles, or gift boxes.</p>
          </div>

          {/* Search (right side) */}
          <div className="w-full md:w-[420px] relative">
            <input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onBlur={() => setTimeout(() => setOpen(false), 120)}
              placeholder="Search products…"
              className="w-full px-4 py-3 rounded-2xl border border-gold bg-white/60 focus:outline-none focus:ring-2 focus:ring-gold/40"
            />

            {open && suggestions.length > 0 && (
              <div className="absolute z-50 mt-2 w-full premium-card overflow-hidden">
                <div className="p-2">
                  {suggestions.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-black/5 transition"
                      onClick={() => {
                        setSearchQuery(p.name);
                        setActive("All");
                        document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
                        setOpen(false);
                      }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="font-semibold">{p.name}</div>
                          <div className="text-xs opacity-70">{p.category} • {p.weight}</div>
                        </div>
                        <div className="font-bold">₹{p.price}</div>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="px-4 pb-3 text-xs opacity-60">Tip: try “kaja”, “pickle”, “gift”.</div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {CATEGORIES.map((c) => (
            <motion.button
              key={c}
              whileHover={{ y: -2 }}
              className={`px-5 py-2 rounded-full border border-gold ${
                active === c ? "bg-[#3b2417] text-[#f6efe3]" : "bg-white/40"
              }`}
              onClick={() => setActive(c)}
            >
              {c}
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}
