"use client";

import { CATEGORIES } from "./data";

export default function Categories({
  active,
  setActive,
  searchQuery,
  setSearchQuery,
}: any) {
  return (
    <section className="px-6 pt-20 pb-14">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
          {/* PREMIUM HEADING */}
          <h2 className="text-[36px] font-semibold tracking-tight">
            Shop by Category
          </h2>

          {/* SEARCH */}
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products"
            className="w-full md:w-[320px] px-4 py-2 rounded-full border border-[#e8dccb] focus:outline-none"
          />
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
