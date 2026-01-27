"use client";

import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { CATEGORIES } from "./data";

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
  return (
    <section id="categories" className="px-6 py-16">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-4xl mb-2">Shop by Category</h2>
            <p className="opacity-75">Choose sweets, snacks, pickles, or gift boxes.</p>
          </div>

          {/* Search (right side) */}
          <div className="w-full md:w-[380px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-60" size={18} />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products…"
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gold bg-[#fffaf2] focus:outline-none focus:ring-2 focus:ring-gold/40"
                aria-label="Search products"
              />
            </div>
            <div className="mt-2 text-xs opacity-60">Tip: try “kaja”, “pickle”, or “gift”.</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {CATEGORIES.map((c) => (
            <motion.button
              key={c}
              whileHover={{ y: -2 }}
              className={`px-5 py-2 rounded-full border border-gold ${
                active === c ? "bg-[#3b2417] text-[#fffaf2]" : "bg-transparent hover:bg-gold/10"
              }`}
              onClick={() => setActive(c)}
              type="button"
            >
              {c}
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}
