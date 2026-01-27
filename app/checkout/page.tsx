"use client";

import { useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useCart } from "../components/CartContext";

type Form = {
  fullName: string;
  email: string;
  phone: string;
  country: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
  notes: string;
};

export default function CheckoutPage() {
  const cart = useCart();

  const [f, setF] = useState<Form>({
    fullName: "",
    email: "",
    phone: "",
    country: "United States",
    address1: "",
    address2: "",
    city: "",
    state: "",
    zip: "",
    notes: "",
  });

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim());

    if (!f.fullName.trim()) e.fullName = "Required";
    if (!f.email.trim()) e.email = "Required";
    else if (!emailOk) e.email = "Invalid email";
    if (!f.phone.trim()) e.phone = "Required";
    if (!f.country.trim()) e.country = "Required";
    if (!f.address1.trim()) e.address1 = "Required";
    if (!f.city.trim()) e.city = "Required";
    if (!f.state.trim()) e.state = "Required";
    if (!f.zip.trim()) e.zip = "Required";
    return e;
  }, [f]);

  const canSend = cart.items.length > 0 && Object.keys(errors).length === 0;

  const message = () => {
    const lines = cart.items.map(
      (i) => `• ${i.name} (${i.weight}) x${i.qty} = ₹${i.qty * i.price}`
    );
    return [
      "Hi Konaseema Foods, I want to order:",
      ...lines,
      "",
      `Total: ₹${cart.total}`,
      "",
      "Delivery Details (US):",
      `Name: ${f.fullName}`,
      `Email: ${f.email}`,
      `Phone: ${f.phone}`,
      `Country: ${f.country}`,
      `Address: ${f.address1}${f.address2 ? ", " + f.address2 : ""}`,
      `City/State/ZIP: ${f.city}, ${f.state} ${f.zip}`,
      f.notes ? `Notes: ${f.notes}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  };

  const waLink = `https://wa.me/91XXXXXXXXXX?text=${encodeURIComponent(message())}`;

  const Req = ({ label }: { label: string }) => (
    <span className="inline-flex items-center gap-1">
      {label}
      <span className="text-red-600">*</span>
    </span>
  );

  const Input = (props: any) => (
    <input
      {...props}
      className={`w-full px-4 py-3 rounded-2xl border border-gold bg-white/60 focus:outline-none focus:ring-2 focus:ring-gold/40 ${props.className || ""}`}
    />
  );

  return (
    <>
      <Navbar />

      <main className="px-6 py-10">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl mb-2">Checkout</h1>
          <p className="opacity-75 mb-8">
            Enter delivery details (required fields marked with *).
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Form */}
            <section className="lg:col-span-3 premium-card p-6">
              <h2 className="text-2xl mb-4">Delivery Details</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-1">
                    <Req label="Full Name" />
                  </label>
                  <Input
                    value={f.fullName}
                    onChange={(e: any) => setF({ ...f, fullName: e.target.value })}
                  />
                  {errors.fullName && (
                    <div className="text-xs text-red-600 mt-1">{errors.fullName}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">
                    <Req label="Email" />
                  </label>
                  <Input
                    value={f.email}
                    onChange={(e: any) => setF({ ...f, email: e.target.value })}
                  />
                  {errors.email && (
                    <div className="text-xs text-red-600 mt-1">{errors.email}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">
                    <Req label="Mobile / Phone" />
                  </label>
                  <Input
                    value={f.phone}
                    onChange={(e: any) => setF({ ...f, phone: e.target.value })}
                  />
                  {errors.phone && (
                    <div className="text-xs text-red-600 mt-1">{errors.phone}</div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-1">
                    <Req label="Country" />
                  </label>
                  <Input
                    value={f.country}
                    onChange={(e: any) => setF({ ...f, country: e.target.value })}
                  />
                  {errors.country && (
                    <div className="text-xs text-red-600 mt-1">{errors.country}</div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-1">
                    <Req label="Address Line 1" />
                  </label>
                  <Input
                    value={f.address1}
                    onChange={(e: any) => setF({ ...f, address1: e.target.value })}
                  />
                  {errors.address1 && (
                    <div className="text-xs text-red-600 mt-1">{errors.address1}</div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-1">Address Line 2</label>
                  <Input
                    value={f.address2}
                    onChange={(e: any) => setF({ ...f, address2: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">
                    <Req label="City" />
                  </label>
                  <Input
                    value={f.city}
                    onChange={(e: any) => setF({ ...f, city: e.target.value })}
                  />
                  {errors.city && (
                    <div className="text-xs text-red-600 mt-1">{errors.city}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">
                    <Req label="State" />
                  </label>
                  <Input
                    value={f.state}
                    onChange={(e: any) => setF({ ...f, state: e.target.value })}
                  />
                  {errors.state && (
                    <div className="text-xs text-red-600 mt-1">{errors.state}</div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-1">
                    <Req label="ZIP / Postal Code" />
                  </label>
                  <Input
                    value={f.zip}
                    onChange={(e: any) => setF({ ...f, zip: e.target.value })}
                  />
                  {errors.zip && (
                    <div className="text-xs text-red-600 mt-1">{errors.zip}</div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-1">Courier Notes</label>
                  <textarea
                    value={f.notes}
                    onChange={(e) => setF({ ...f, notes: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-gold bg-white/60 focus:outline-none focus:ring-2 focus:ring-gold/40 min-h-[120px]"
                    placeholder="Apt/Suite, building access, preferred delivery time, etc."
                  />
                </div>
              </div>

              <button
                className="btn-primary w-full mt-6"
                type="button"
                disabled={!canSend}
                onClick={() => window.open(waLink, "_blank")}
              >
                Send Order on WhatsApp
              </button>

              {!canSend && (
                <p className="text-xs text-red-600 mt-3">
                  Fill all required fields and ensure your cart has items.
                </p>
              )}
            </section>

            {/* Summary */}
            <aside className="lg:col-span-2 premium-card p-6 h-fit">
              <h2 className="text-2xl mb-4">Order Summary</h2>
              {cart.items.length === 0 ? (
                <div className="opacity-70">No items in cart.</div>
              ) : (
                <div className="space-y-3">
                  {cart.items.map((i) => (
                    <div key={i.id} className="flex justify-between gap-4">
                      <div>
                        <div className="font-semibold">{i.name}</div>
                        <div className="text-xs opacity-70">
                          {i.weight} • Qty {i.qty}
                        </div>
                      </div>
                      <div className="font-bold">₹{i.qty * i.price}</div>
                    </div>
                  ))}
                  <div className="border-t border-gold pt-4 flex justify-between text-lg">
                    <span className="opacity-80">Total</span>
                    <span className="font-bold">₹{cart.total}</span>
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
