"use client";

import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCart } from "./CartContext";

export default function CartDrawer() {
  const cart = useCart();
  const router = useRouter();

  return (
    <div
      className={`fixed inset-0 z-50 ${cart.isOpen ? "" : "pointer-events-none"}`}
      aria-hidden={!cart.isOpen}
    >
      {/* overlay */}
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity ${cart.isOpen ? "opacity-100" : "opacity-0"}`}
        onClick={cart.close}
      />

      {/* panel */}
      <div
        className={`absolute right-0 top-0 h-full w-full sm:w-[420px] bg-[#fffaf2] border-l border-gold shadow-2xl transition-transform ${
          cart.isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-gold">
          <div>
            <h3 className="text-2xl">Your Cart</h3>
            <p className="opacity-75 text-sm">{cart.count} item(s)</p>
          </div>
          <button onClick={cart.close} aria-label="Close cart">
            <X />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-auto h-[calc(100%-220px)]">
          {cart.items.length === 0 ? (
            <div className="opacity-70">Your cart is empty.</div>
          ) : (
            cart.items.map((i) => (
              <div key={i.id} className="premium-card p-4">
                <div className="flex gap-4">
                  <img src={i.image} className="w-16 h-16 rounded-lg object-cover" alt={i.name} />
                  <div className="flex-1">
                    <div className="flex justify-between gap-4">
                      <div>
                        <div className="font-semibold">{i.name}</div>
                        <div className="opacity-70 text-sm">{i.weight}</div>
                      </div>
                      <div className="font-bold">₹{i.price}</div>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button className="px-3 py-1 border border-gold rounded-full" onClick={() => cart.dec(i.id)}>
                          -
                        </button>
                        <span className="min-w-[24px] text-center font-semibold">{i.qty}</span>
                        <button className="px-3 py-1 border border-gold rounded-full" onClick={() => cart.inc(i.id)}>
                          +
                        </button>
                      </div>
                      <button className="text-sm underline opacity-80 hover:opacity-100" onClick={() => cart.remove(i.id)}>
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="px-6 py-5 border-t border-gold">
          <div className="flex justify-between text-lg mb-4">
            <span className="opacity-80">Total</span>
            <span className="font-bold">₹{cart.total}</span>
          </div>

          <div className="flex gap-3">
            <button
              className="btn-primary w-full"
              onClick={() => {
                if (cart.items.length === 0) return;
                cart.close();
                router.push("/checkout");
              }}
            >
              Continue
            </button>

            <button
              className="btn-primary w-full bg-[#3b2417] hover:bg-[#2d1a10]"
              onClick={cart.clear}
            >
              Clear
            </button>
          </div>

          <p className="text-xs opacity-60 mt-3">
            Continue to enter delivery details.
          </p>
        </div>
      </div>
    </div>
  );
}
