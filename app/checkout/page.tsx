"use client";

import { useEffect, useMemo, useState } from "react";
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

// ✅ change this
const WHATSAPP_NUMBER = "91XXXXXXXXXX"; // countrycode + number, no +

export default function CheckoutPage() {
  const cart = useCart();

  const [shipping, setShipping] = useState<Shipping>({
    fullName: "",
    email: "",
    phone: "",
    country: "India",
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
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

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
    const email = shipping.email.trim();
    const phone = shipping.phone.trim();

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const phoneOk = phone.length >= 7;

    if (!shipping.fullName.trim()) e.fullName = "Full name is required";
    if (!email) e.email = "Email is required";
    else if (!emailOk) e.email = "Enter a valid email";

    if (!phone) e.phone = "Phone number is required";
    else if (!phoneOk) e.phone = "Enter a valid phone number";

    if (!shipping.country.trim()) e.country = "Country is required";
    if (!shipping.address1.trim()) e.address1 = "Address line 1 is required";
    if (!shipping.city.trim()) e.city = "City is required";
    if (!shipping.state.trim()) e.state = "State is required";
    if (!shipping.zip.trim()) e.zip = "ZIP / Postal code is required";

    return e;
  }, [shipping]);

  const isValid = Object.keys(errors).length === 0;

  const buildWhatsAppMessage = (orderId: string) => {
    const lines = cart.items.map(
      (i: any) => `• ${i.name} (${i.weight || ""}) x${i.qty} = ₹${i.qty * i.price}`
    );

    return [
      `Hi Konaseema Foods, I want to place an order.`,
      ``,
      `Order ID: ${orderId}`,
      ``,
      `Customer: ${shipping.fullName}`,
      `Phone: ${shipping.phone}`,
      `Email: ${shipping.email}`,
      ``,
      `Address: ${shipping.address1}${shipping.address2 ? ", " + shipping.address2 : ""}`,
      `${shipping.city}, ${shipping.state} - ${shipping.zip}`,
      `${shipping.country}`,
      shipping.deliveryNotes ? `` : "",
      shipping.deliveryNotes ? `Notes: ${shipping.deliveryNotes}` : "",
      ``,
      `Items:`,
      ...lines,
      ``,
      `Total: ₹${cart.total}`,
    ]
      .filter(Boolean)
      .join("\n");
  };

  const saveOrderToDb = async (): Promise<string> => {
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr) throw new Error(userErr.message);
    if (!userData.user) throw new Error("Please login to place the order.");
    const userId = userData.user.id;

    const subtotal = cart.items.reduce(
      (s: number, it: any) => s + Number(it.price) * Number(it.qty),
      0
    );
    const shippingFee = 0;
    const total = subtotal + shippingFee;

    const { data: address, error: addrErr } = await supabase
      .from("addresses")
      .insert({
        user_id: userId,
        full_name: shipping.fullName.trim(),
        email: shipping.email.trim(),
        phone: shipping.phone.trim(),
        address_line1: shipping.address1.trim(),
        address_line2: shipping.address2.trim() ? shipping.address2.trim() : null,
        city: shipping.city.trim(),
        state: shipping.state.trim(),
        postal_code: shipping.zip.trim(),
        country: shipping.country.trim() || "India",
      })
      .select("id")
      .single();

    if (addrErr) throw new Error(addrErr.message);

    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        address_id: address.id,
        currency: "INR",
        status: "pending",
        subtotal,
        shipping: shippingFee,
        total,
        notes: shipping.deliveryNotes.trim() ? shipping.deliveryNotes.trim() : null,
      })
      .select("id")
      .single();

    if (orderErr) throw new Error(orderErr.message);

    const itemsPayload = cart.items.map((i: any) => ({
      order_id: order.id,
      product_id: String(i.id),
      name: i.name,
      price: Number(i.price),
      qty: Number(i.qty),
    }));

    const { error: itemsErr } = await supabase.from("order_items").insert(itemsPayload);
    if (itemsErr) throw new Error(itemsErr.message);

    return String(order.id);
  };

  const onPlaceOrder = async () => {
  try {
    // 🔎 PROVE which Supabase project you are hitting
    console.log("SUPABASE URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);

    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id ?? null;

    const payload = {
      debug: "attempt_insert",
      at: new Date().toISOString(),
      shipping,
      cart_items: cartItems,
    };

    // 🔎 PROBE (optional but useful)
    const probe = await supabase
      .schema("public")
      .from("order_attempts")
      .select("id")
      .limit(1);

    console.log("probe select:", probe);

    // ✅ ACTUAL INSERT
    const res = await supabase
      .schema("public")
      .from("order_attempts")
      .insert([{ user_id: userId, payload }])
      .select("id")
      .single();

    console.log("order_attempts insert:", res);

    if (res.error) {
      alert(`DB ERROR: ${res.error.message}`);
      return;
    }

    alert(`Saved to DB. Attempt ID: ${res.data.id}`);
  } catch (e) {
    console.error("Unexpected error:", e);
  }
};


    if (!isValid) return;
    if (cart.items.length === 0) return;

    try {
      setSaveError(null);
      setSuccessMsg(null);
      setSaving(true);

      const orderId = await saveOrderToDb();
      setSuccessMsg(`✅ Saved. Order ID: ${orderId}`);

      const msg = buildWhatsAppMessage(orderId);
      const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
      window.open(url, "_blank");
    } catch (e: any) {
      setSaveError(e?.message || "Failed to save order.");
    } finally {
      setSaving(false);
    }
  };

  const inputBase =
    "w-full px-4 py-3 rounded-2xl border border-gold bg-[#fffaf2] focus:outline-none focus:ring-2 focus:ring-gold/40";
  const inputErr = "border-red-400 focus:ring-red-200";

  const showErr = (k: keyof Shipping) => touched[k] && errors[k];

  return (
    <>
      <Navbar />
      <main className="px-6 py-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl mb-2">Checkout</h1>
          <p className="opacity-75 mb-8">Fill delivery details → we save to Supabase → open WhatsApp.</p>

          <section className="premium-card p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field
                label="Full Name *"
                value={shipping.fullName}
                onChange={(v) => setShipping({ ...shipping, fullName: v })}
                className={`${inputBase} ${showErr("fullName") ? inputErr : ""}`}
              />
              <Field
                label="Email *"
                value={shipping.email}
                onChange={(v) => setShipping({ ...shipping, email: v })}
                className={`${inputBase} ${showErr("email") ? inputErr : ""}`}
              />
              <Field
                label="Phone *"
                value={shipping.phone}
                onChange={(v) => setShipping({ ...shipping, phone: v })}
                className={`${inputBase} ${showErr("phone") ? inputErr : ""}`}
              />
              <Field
                label="Country *"
                value={shipping.country}
                onChange={(v) => setShipping({ ...shipping, country: v })}
                className={`${inputBase} ${showErr("country") ? inputErr : ""}`}
              />
              <Field
                label="Address Line 1 *"
                value={shipping.address1}
                onChange={(v) => setShipping({ ...shipping, address1: v })}
                className={`${inputBase} ${showErr("address1") ? inputErr : ""}`}
              />
              <Field
                label="Address Line 2"
                value={shipping.address2}
                onChange={(v) => setShipping({ ...shipping, address2: v })}
                className={inputBase}
              />
              <Field
                label="City *"
                value={shipping.city}
                onChange={(v) => setShipping({ ...shipping, city: v })}
                className={`${inputBase} ${showErr("city") ? inputErr : ""}`}
              />
              <Field
                label="State *"
                value={shipping.state}
                onChange={(v) => setShipping({ ...shipping, state: v })}
                className={`${inputBase} ${showErr("state") ? inputErr : ""}`}
              />
              <Field
                label="ZIP / Postal *"
                value={shipping.zip}
                onChange={(v) => setShipping({ ...shipping, zip: v })}
                className={`${inputBase} ${showErr("zip") ? inputErr : ""}`}
              />
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-1">Delivery Notes</label>
                <textarea
                  className={`${inputBase} min-h-[110px]`}
                  value={shipping.deliveryNotes}
                  onChange={(e) => setShipping({ ...shipping, deliveryNotes: e.target.value })}
                />
              </div>
            </div>

            {saveError && <div className="mt-4 text-sm text-red-600">{saveError}</div>}
            {successMsg && <div className="mt-4 text-sm text-green-700">{successMsg}</div>}

            <button
              className="btn-primary mt-6 w-full"
              onClick={onPlaceOrder}
              disabled={saving || cart.items.length === 0}
              type="button"
            >
              {saving ? "Saving..." : `Place Order (₹${cart.total})`}
            </button>

            {cart.items.length === 0 && <div className="mt-3 text-sm opacity-70">Your cart is empty.</div>}
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  className: string;
}) {
  return (
    <label className="block">
      <div className="text-sm font-semibold mb-1">{label}</div>
      <input className={className} value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}
