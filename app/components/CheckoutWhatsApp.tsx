// app/components/CheckoutWhatsApp.tsx
"use client";

import { useState } from "react";
import { useCart } from "./CartContext";
import {
  buildWhatsAppOrderMessage,
  createOrderInDb,
  type CreateOrderResult,
  type ShippingPayload,
} from "../lib/createOrder";

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
    country: "",
  });

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const required = (v: string) => (v || "").trim().length > 0;

  const openWhatsAppContact = (msg: string) => {
    const cleanNumber = WHATSAPP_NUMBER.replace(/[^\d]/g, "");
    const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const onSubmit = async () => {
    setErr(null);
    setSuccess(null);

    // basic validation
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
      setErr("Your cart is empty.");
      return;
    }

    setLoading(true);

    const shipping: ShippingPayload = {
      full_name: form.full_name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      address_line1: form.address_line1.trim(),
      address_line2: form.address_line2.trim() ? form.address_line2.trim() : null,
      city: form.city.trim(),
      state: form.state.trim(),
      postal_code: form.postal_code.trim(),
      country: form.country.trim(),
    };

    // normalize ids to string to avoid type conflicts
    const itemsNormalized = cart.items.map((it: any) => ({
      id: String(it.id),
      name: String(it.name),
      price: Number(it.price),
      qty: Number(it.qty),
    }));

    const res: CreateOrderResult = await createOrderInDb({
      items: itemsNormalized,
      shipping,
      currency: "INR",
    });

    setLoading(false);

    // ✅ Proper union narrowing (fixes your exact build error)
    if (!res.ok) {
      setErr(res.error);
      return;
    }

    setSuccess(`Order saved successfully. Order ID: ${res.orderId}`);

    // OPTIONAL: open WhatsApp as *contact only* (remove if you don't want auto-open)
    // const msg = buildWhatsAppOrderMessage({ items: itemsNormalized, total: res.total, shipping });
    // openWhatsAppContact(msg);
  };

  const onWhatsAppSupport = () => {
    // contact-only button (no ordering)
    openWhatsAppContact("Hi, I need support regarding products / orders.");
  };

  return (
    <div className="mt-6">
      <div className="card p-6">
        <h3 className="text-xl font-bold mb-4">Checkout</h3>

        <div className="grid md:grid-cols-2 gap-4">
          <Input
            label="Full Name *"
            value={form.full_name}
            onChange={(v) => setForm({ ...form, full_name: v })}
          />
          <Input
            label="Email *"
            value={form.email}
            onChange={(v) => setForm({ ...form, email: v })}
          />
          <Input
            label="Phone *"
            value={form.phone}
            onChange={(v) => setForm({ ...form, phone: v })}
          />
          <Input
            label="Country *"
            value={form.country}
            onChange={(v) => setForm({ ...form, country: v })}
          />

          <div className="md:col-span-2">
            <Input
              label="Address Line 1 *"
              value={form.address_line1}
              onChange={(v) => setForm({ ...form, address_line1: v })}
            />
          </div>

          <div className="md:col-span-2">
            <Input
              label="Address Line 2"
              value={form.address_line2}
              onChange={(v) => setForm({ ...form, address_line2: v })}
            />
          </div>

          <Input
            label="City *"
            value={form.city}
            onChange={(v) => setForm({ ...form, city: v })}
          />
          <Input
            label="State *"
            value={form.state}
            onChange={(v) => setForm({ ...form, state: v })}
          />
          <Input
            label="Postal Code *"
            value={form.postal_code}
            onChange={(v) => setForm({ ...form, postal_code: v })}
          />
        </div>

        {err && <div className="mt-4 text-sm text-red-600">{err}</div>}
        {success && <div className="mt-4 text-sm text-green-700">{success}</div>}

        <button
          className="btn-primary mt-6 w-full"
          onClick={onSubmit}
          disabled={loading}
          type="button"
        >
          {loading ? "Processing..." : "Place Order"}
        </button>

        <button
          className="btn-secondary mt-3 w-full"
          onClick={onWhatsAppSupport}
          type="button"
        >
          Contact on WhatsApp
        </button>
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-1">{label}</label>
      <input
        className="w-full px-4 py-3 rounded-2xl border border-gold bg-[#fffaf2] focus:outline-none focus:ring-2 focus:ring-gold/40"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
