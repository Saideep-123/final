"use client";

import { useMemo, useState } from "react";
import { CATEGORIES, PRODUCTS } from "./data";

export default function Categories({
  active,
  setActive,
  searchQuery,
  setSearchQuery,
}: any) {
  const [open, setOpen] = useState(false);

  const suggestions = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return [];
    return PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    ).slice(0, 6);
  }, [searchQuery]);

  return (
    <section className="px-6 pt-20 pb-14" id="categories">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
          <h2 className="text-[36px] font-semibold tracking-tight">
            Shop by Category
          </h2>

          {/* SEARCH */}
          <div className="relative w-full md:w-[320px]">
            <input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setOpen(true);
              }}
              onBlur={() => setTimeout(() => setOpen(false), 120)}
              placeholder="Search products"
              className="w-full px-4 py-2 rounded-full border border-[#e8dccb] focus:outline-none"
            />

            {/* SUGGESTIONS */}
            {open && suggestions.length > 0 && (
              <div className="absolute mt-2 w-full bg-white rounded-xl border border-[#e8dccb] shadow-lg z-50">
                {suggestions.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSearchQuery(p.name);
                      setActive("All");
                      setOpen(false);
                      document
                        .getElementById("products")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-[#f6efe6]"
                  >
                    <div className="text-sm font-medium">{p.name}</div>
                    <div className="text-xs text-gray-500">
                      {p.category}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* CATEGORY PILLS */}
        <div className="flex flex-wrap gap-3">
          {CATEGORIES.map((c: string) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={`px-5 py-2 rounded-full text-[14px] tracking-wide transition
                ${
                  active === c
                    ? "bg-[#3b2417] text-white"
                    : "border border-[#c9a36a] hover:bg-[#f6efe6]"
                }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
