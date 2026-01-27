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
const WHATSAPP_NUMBER = "91XXXXXXXXXX"; // replace

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

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) setShipping((s) => ({ ...s, ...JSON.parse(raw) }));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(shipping));
  }, [shipping]);

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!shipping.fullName.trim()) e.fullName = "Required";
    if (!shipping.email.trim()) e.email = "Required";
    if (!shipping.phone.trim()) e.phone = "Required";
    if (!shipping.address1.trim()) e.address1 = "Required";
    if (!shipping.city.trim()) e.city = "Required";
    if (!shipping.state.trim()) e.state = "Required";
    if (!shipping.zip.trim()) e.zip = "Required";
    return e;
  }, [shipping]);

  const isValid = Object.keys(errors).length === 0;

  const buildWhatsAppMessage = (orderId: string) => {
    const lines = cart.items.map(
      (i: any) => `• ${i.name} x${i.qty} = ₹${i.qty * i.price}`
    );

    return encodeURIComponent(
      [
        `Order ID: ${orderId}`,
        "",
        ...lines,
        "",
        `Total: ₹${cart.total}`,
        "",
        "Delivery:",
        shipping.fullName,
        shipping.phone,
        shipping.address1,
        shipping.city,
        shipping.state,
        shipping.zip,
        shipping.country,
      ].join("\n")
    );
  };

  const saveOrder = async () => {
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Please login first");

    const subtotal = cart.items.reduce(
      (s: number, i: any) => s + i.price * i.qty,
      0
    );

    // 1️⃣ Address
    const { data: address, error: addrErr } = await supabase
      .from("addresses")
      .insert({
        user_id: user.id,
        full_name: shipping.fullName,
        email: shipping.email,
        phone: shipping.phone,
        address_line1: shipping.address1,
        address_line2: shipping.address2 || null,
        city: shipping.city,
        state: shipping.state,
        postal_code: shipping.zip,
        country: shipping.country,
      })
      .select("id")
      .single();

    if (addrErr) throw addrErr;

    // 2️⃣ Order
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        address_id: address.id,
        subtotal,
        shipping: 0,
        total: subtotal,
        currency: "INR",
        status: "pending",
        notes: shipping.deliveryNotes || null,
      })
      .select("id")
      .single();

    if (orderErr) throw orderErr;

    // 3️⃣ Order items
    const items = cart.items.map((i: any) => ({
      order_id: order.id,
      product_id: i.id,
      name: i.name,
      price: i.price,
      qty: i.qty,
    }));

    const { error: itemsErr } = await supabase
      .from("order_items")
      .insert(items);

    if (itemsErr) throw itemsErr;

    return order.id;
  };

  const onSubmit = async () => {
    if (!isValid || cart.items.length === 0) return;

    try {
      setSaving(true);
      const orderId = await saveOrder();
      const msg = buildWhatsAppMessage(orderId);
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
      cart.clear();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="px-6 py-10 max-w-4xl mx-auto">
        <h1 className="text-3xl mb-6">Checkout</h1>

        {error && <p className="text-red-600 mb-4">{error}</p>}

        <button
          onClick={onSubmit}
          disabled={!isValid || saving}
          className="btn-primary w-full"
        >
          {saving ? "Saving..." : "Send Order on WhatsApp"}
        </button>
      </main>
      <Footer />
    </>
  );
}
