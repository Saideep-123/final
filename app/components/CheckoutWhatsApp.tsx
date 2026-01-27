"use client";

import { useState } from "react";
import { useCart } from "./CartContext";
import { buildWhatsAppOrderMessage, createOrderInDb } from "../lib/createOrder";

const WHATSAPP_NUMBER = "91XXXXXXXXXX"; // change this

export default function CheckoutWhatsApp() {
  const cart = useCart();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "US",
  });

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const required = (v: string) => (v || "").trim().length > 0;

  const onSend = async () => {
    setErr(null);

    // Required fields
    if (
      !required(form.full_name) ||
      !required(form.email) ||
      !required(form.phone) ||
      !required(form.address_line1) ||
      !required(form.city) ||
      !required(form.state) ||
      !required(form.postal_code) ||
      !required(form.country)
    ) {
      setErr("Please fill all required (*) fields.");
      return;
    }

    if (!cart.items || cart.items.length === 0) {
      setErr("Cart is empty.");
      return;
    }

    setLoading(true);
    const res = await createOrderInDb({
      items: cart.items,
      shipping: {
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        address_line1: form.address_line1,
        address_line2: form.address_line2 || undefined,
        city: form.city,
        state: form.state,
        postal_code: form.postal_code,
        country: form.country,
      },
      currency: "INR",
    });
    setLoading(false);

    if (!res.ok) {
      setErr(res.error);
      return;
    }

    const msg = buildWhatsAppOrderMessage({
      orderId: res.orderId,
      items: cart.items,
      shipping: {
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        address_line1: form.address_line1,
        address_line2: form.address_line2 || undefined,
        city: form.city,
        state: form.state,
        postal_code: form.postal_code,
        country: form.country,
      },
      totals: res.totals,
    });

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-[#e8dccb] p-6">
      <h2 className="text-xl font-semibold mb-4">Delivery Details</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Full Name *" value={form.full_name} onChange={(v) => setForm({ ...form, full_name: v })} />
        <Field label="Email *" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
        <Field label="Phone *" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />

        <Field label="Address Line 1 *" value={form.address_line1} onChange={(v) => setForm({ ...form, address_line1: v })} />
        <Field label="Address Line 2" value={form.address_line2} onChange={(v) => setForm({ ...form, address_line2: v })} />

        <Field label="City *" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
        <Field label="State *" value={form.state} onChange={(v) => setForm({ ...form, state: v })} />
        <Field label="Postal Code *" value={form.postal_code} onChange={(v) => setForm({ ...form, postal_code: v })} />
        <Field label="Country *" value={form.country} onChange={(v) => setForm({ ...form, country: v })} />
      </div>

      {err && <div className="mt-4 text-sm text-red-600">{err}</div>}

      <button
        type="button"
        onClick={onSend}
        disabled={loading}
        className="btn-primary mt-6 w-full"
      >
        {loading ? "Saving order..." : "Send Order on WhatsApp"}
      </button>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <div className="text-sm font-semibold mb-1">{label}</div>
      <input
        className="w-full px-4 py-3 rounded-xl border border-[#e8dccb] focus:outline-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
