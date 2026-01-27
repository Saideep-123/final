"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useCart } from "../components/CartContext";
import { supabase } from "../lib/supabaseClient";

type Shipping = {
  fullName: string;
  email: string;
  phone: string;
  country: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
  deliveryNotes: string;
};

const STORAGE_KEY = "konaseema_shipping_v1";

// NOTE: replace with your WhatsApp business number (country code + number, no +)
const WHATSAPP_NUMBER = "91XXXXXXXXXX";

function requiredLabel(text: string) {
  return (
    <span className="inline-flex items-center gap-1">
      {text} <span className="text-red-600">*</span>
    </span>
  );
}

export default function CheckoutPage() {
  const cart = useCart();
  const router = useRouter();

  const [shipping, setShipping] = useState<Shipping>({
    fullName: "",
    email: "",
    phone: "",
    country: "United States",
    address1: "",
    address2: "",
    city: "",
    state: "",
    zip: "",
    deliveryNotes: "",
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setShipping((prev) => ({ ...prev, ...JSON.parse(raw) }));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(shipping));
    } catch {}
  }, [shipping]);

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shipping.email.trim());
    const phoneOk = shipping.phone.trim().length >= 7;

    if (!shipping.fullName.trim()) e.fullName = "Full name is required";
    if (!shipping.email.trim()) e.email = "Email is required";
    else if (!emailOk) e.email = "Enter a valid email";
    if (!shipping.phone.trim()) e.phone = "Phone number is required";
    else if (!phoneOk) e.phone = "Enter a valid phone number";
    if (!shipping.country.trim()) e.country = "Country is required";
    if (!shipping.address1.trim()) e.address1 = "Address line 1 is required";
    if (!shipping.city.trim()) e.city = "City is required";
    if (!shipping.state.trim()) e.state = "State is required";
    if (!shipping.zip.trim()) e.zip = "ZIP / Postal code is required";

    return e;
  }, [shipping]);

  const isValid = Object.keys(errors).length === 0;

  const buildWhatsAppMessage = (orderId: number) => {
    const lines = cart.items.map(
      (i: any) => `• ${i.name} (${i.weight}) x${i.qty} = ₹${i.qty * i.price}`
    );

    const shipLines = [
      `Order ID: ${orderId}`,
      `Name: ${shipping.fullName}`,
      `Email: ${shipping.email}`,
      `Phone: ${shipping.phone}`,
      `Country: ${shipping.country}`,
      `Address: ${shipping.address1}${shipping.address2 ? ", " + shipping.address2 : ""}`,
      `City/State/ZIP: ${shipping.city}, ${shipping.state} ${shipping.zip}`,
      shipping.deliveryNotes ? `Notes: ${shipping.deliveryNotes}` : null,
    ].filter(Boolean);

    return [
      "Hi Konaseema Foods, I want to order:",
      ...lines,
      "",
      `Total: ₹${cart.total}`,
      "",
      "Delivery Details:",
      ...shipLines,
    ].join("\n");
  };

  const saveOrderToDb = async () => {
    setSaveError(null);

    // Require login because RLS uses auth.uid()
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr) throw new Error(userErr.message);
    if (!userData.user) throw new Error("Please login to place the order.");

    const userId = userData.user.id;

    // Totals
    const subtotal = cart.items.reduce((s: number, it: any) => s + Number(it.price) * Number(it.qty), 0);
    const shippingFee = 0;
    const total = subtotal + shippingFee;

    // 1) Insert address
    const { data: addr, error: addrErr } = await supabase
      .from("addresses")
      .insert({
        user_id: userId,
        full_name: shipping.fullName,
        email: shipping.email,
        phone: shipping.phone,
        address_line1: shipping.address1,
        address_line2: shipping.address2 ? shipping.address2 : null,
        city: shipping.city,
        state: shipping.state,
        postal_code: shipping.zip,
        country: shipping.country || "United States",
      })
      .select("id")
      .single();

    if (addrErr) throw new Error(addrErr.message);

    // 2) Insert order
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        address_id: addr.id,
        currency: "INR",
        status: "pending",
        subtotal,
        shipping: shippingFee,
        total,
        notes: shipping.deliveryNotes ? shipping.deliveryNotes : null,
      })
      .select("id")
      .single();

    if (orderErr) throw new Error(orderErr.message);

    // 3) Insert order items
    const itemsPayload = cart.items.map((i: any) => ({
      order_id: order.id,
      product_id: i.id,
      name: i.name,
      price: i.price,
      qty: i.qty,
      image: i.image ?? null,
      weight: i.weight ?? null,
      category: i.category ?? null,
    }));

    const { error: itemsErr } = await supabase.from("order_items").insert(itemsPayload);
    if (itemsErr) throw new Error(itemsErr.message);

    return order.id as number;
  };

  const onSendWhatsApp = async () => {
    setTouched({
      fullName: true,
      email: true,
      phone: true,
      country: true,
      address1: true,
      city: true,
      state: true,
      zip: true,
    });

    if (!isValid) return;
    if (cart.items.length === 0) return;

    try {
      setSaving(true);
      const orderId = await saveOrderToDb();
      const msg = buildWhatsAppMessage(orderId);
      const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
      window.open(waLink, "_blank");
    } catch (e: any) {
      setSaveError(e?.message || "Failed to save order. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const inputBase =
    "w-full px-4 py-3 rounded-2xl border border-gold bg-[#fffaf2] focus:outline-none focus:ring-2 focus:ring-gold/40";
  const inputErr = "border-red-400 focus:ring-red-200";

  return (
    <>
      <Navbar />
      <main className="px-6 py-10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl mb-2">Checkout</h1>
            <p className="opacity-75">
              Add delivery details for US courier shipping. Required fields are marked with{" "}
              <span className="text-red-600">*</span>.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* LEFT: Delivery form */}
            <section className="lg:col-span-3 premium-card p-6">
              <h2 className="text-2xl mb-4">Delivery Details</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-1">
                    {requiredLabel("Full Name")}
                  </label>
                  <input
                    value={shipping.fullName}
                    onChange={(e) => setShipping((s) => ({ ...s, fullName: e.target.value }))}
                    onBlur={() => setTouched((t) => ({ ...t, fullName: true }))}
                    className={`${inputBase} ${touched.fullName && errors.fullName ? inputErr : ""}`}
                    placeholder="Recipient full name"
                  />
                  {touched.fullName && errors.fullName && (
                    <p className="text-sm text-red-600 mt-1">{errors.fullName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">
                    {requiredLabel("Email")}
                  </label>
                  <input
                    value={shipping.email}
                    onChange={(e) => setShipping((s) => ({ ...s, email: e.target.value }))}
                    onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                    className={`${inputBase} ${touched.email && errors.email ? inputErr : ""}`}
                    placeholder="name@example.com"
                  />
                  {touched.email && errors.email && (
                    <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">
                    {requiredLabel("Mobile / Phone")}
                  </label>
                  <input
                    value={shipping.phone}
                    onChange={(e) => setShipping((s) => ({ ...s, phone: e.target.value }))}
                    onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
                    className={`${inputBase} ${touched.phone && errors.phone ? inputErr : ""}`}
                    placeholder="US phone number"
                  />
                  {touched.phone && errors.phone && (
                    <p className="text-sm text-red-600 mt-1">{errors.phone}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-1">
                    {requiredLabel("Country")}
                  </label>
                  <input
                    value={shipping.country}
                    onChange={(e) => setShipping((s) => ({ ...s, country: e.target.value }))}
                    onBlur={() => setTouched((t) => ({ ...t, country: true }))}
                    className={`${inputBase} ${touched.country && errors.country ? inputErr : ""}`}
                    placeholder="United States"
                  />
                  {touched.country && errors.country && (
                    <p className="text-sm text-red-600 mt-1">{errors.country}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-1">
                    {requiredLabel("Address Line 1")}
                  </label>
                  <input
                    value={shipping.address1}
                    onChange={(e) => setShipping((s) => ({ ...s, address1: e.target.value }))}
                    onBlur={() => setTouched((t) => ({ ...t, address1: true }))}
                    className={`${inputBase} ${touched.address1 && errors.address1 ? inputErr : ""}`}
                    placeholder="Street address, house number"
                  />
                  {touched.address1 && errors.address1 && (
                    <p className="text-sm text-red-600 mt-1">{errors.address1}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-1">Address Line 2</label>
                  <input
                    value={shipping.address2}
                    onChange={(e) => setShipping((s) => ({ ...s, address2: e.target.value }))}
                    className={inputBase}
                    placeholder="Apartment, suite, unit (optional)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">
                    {requiredLabel("City")}
                  </label>
                  <input
                    value={shipping.city}
                    onChange={(e) => setShipping((s) => ({ ...s, city: e.target.value }))}
                    onBlur={() => setTouched((t) => ({ ...t, city: true }))}
                    className={`${inputBase} ${touched.city && errors.city ? inputErr : ""}`}
                    placeholder="City"
                  />
                  {touched.city && errors.city && (
                    <p className="text-sm text-red-600 mt-1">{errors.city}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">
                    {requiredLabel("State")}
                  </label>
                  <input
                    value={shipping.state}
                    onChange={(e) => setShipping((s) => ({ ...s, state: e.target.value }))}
                    onBlur={() => setTouched((t) => ({ ...t, state: true }))}
                    className={`${inputBase} ${touched.state && errors.state ? inputErr : ""}`}
                    placeholder="State"
                  />
                  {touched.state && errors.state && (
                    <p className="text-sm text-red-600 mt-1">{errors.state}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-1">
                    {requiredLabel("ZIP / Postal Code")}
                  </label>
                  <input
                    value={shipping.zip}
                    onChange={(e) => setShipping((s) => ({ ...s, zip: e.target.value }))}
                    onBlur={() => setTouched((t) => ({ ...t, zip: true }))}
                    className={`${inputBase} ${touched.zip && errors.zip ? inputErr : ""}`}
                    placeholder="ZIP code"
                  />
                  {touched.zip && errors.zip && (
                    <p className="text-sm text-red-600 mt-1">{errors.zip}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-1">Delivery Notes</label>
                  <textarea
                    value={shipping.deliveryNotes}
                    onChange={(e) => setShipping((s) => ({ ...s, deliveryNotes: e.target.value }))}
                    className={`${inputBase} min-h-[110px]`}
                    placeholder="Any special instructions (optional)"
                  />
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  className="btn-primary bg-[#3b2417] hover:bg-[#2d1a10] w-full sm:w-auto"
                  onClick={() => router.push("/")}
                  type="button"
                >
                  Back to Shop
                </button>

                <button
                  className="btn-primary w-full sm:flex-1"
                  onClick={onSendWhatsApp}
                  type="button"
                  disabled={!isValid || cart.items.length === 0 || saving}
                >
                  {saving ? "Saving Order..." : "Send Order on WhatsApp"}
                </button>
              </div>

              {saveError && (
                <p className="mt-3 text-sm text-red-600">
                  {saveError}
                </p>
              )}

              {!isValid && (
                <p className="mt-3 text-sm text-red-600">
                  Please fill all required fields to continue.
                </p>
              )}
              {cart.items.length === 0 && (
                <p className="mt-3 text-sm text-red-600">
                  Your cart is empty. Add items to proceed.
                </p>
              )}
            </section>

            {/* RIGHT: Order summary */}
            <aside className="lg:col-span-2 premium-card p-6 h-fit">
              <h2 className="text-2xl mb-4">Order Summary</h2>

              {cart.items.length === 0 ? (
                <p className="opacity-70">No items yet.</p>
              ) : (
                <div className="space-y-4">
                  {cart.items.map((i: any) => (
                    <div key={i.id} className="flex gap-3">
                      <img
                        src={i.image}
                        className="w-14 h-14 rounded-lg object-cover"
                        alt={i.name}
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="font-semibold">{i.name}</div>
                            <div className="text-sm opacity-70">{i.weight}</div>
                          </div>
                          <div className="font-semibold">₹{i.qty * i.price}</div>
                        </div>

                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              className="px-3 py-1 border border-gold rounded-full"
                              onClick={() => cart.dec(i.id)}
                              type="button"
                              aria-label={`Decrease ${i.name}`}
                            >
                              -
                            </button>
                            <span className="min-w-[24px] text-center font-semibold">{i.qty}</span>
                            <button
                              className="px-3 py-1 border border-gold rounded-full"
                              onClick={() => cart.inc(i.id)}
                              type="button"
                              aria-label={`Increase ${i.name}`}
                            >
                              +
                            </button>
                          </div>
                          <button
                            className="text-sm underline opacity-80 hover:opacity-100"
                            onClick={() => cart.remove(i.id)}
                            type="button"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="border-t border-gold pt-4">
                    <div className="flex justify-between mb-2">
                      <span className="opacity-80">Items</span>
                      <span className="font-semibold">{cart.count}</span>
                    </div>
                    <div className="flex justify-between text-lg">
                      <span className="opacity-80">Subtotal</span>
                      <span className="font-bold">₹{cart.total}</span>
                    </div>

                    <p className="text-xs opacity-60 mt-3">
                      Shipping & customs may apply for international courier delivery. Final amount will be confirmed on WhatsApp.
                    </p>

                    <button
                      className="w-full mt-4 text-sm underline opacity-80 hover:opacity-100"
                      onClick={cart.clear}
                      type="button"
                    >
                      Clear cart
                    </button>
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
