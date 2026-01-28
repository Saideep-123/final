// app/lib/createOrder.ts
import { supabase } from "./supabaseClient";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
};

export type ShippingPayload = {
  full_name: string;
  email: string;
  phone: string;
  address_line1: string;
  address_line2?: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
};

export async function createOrderInDb(args: {
  items: CartItem[];
  shipping: ShippingPayload;
  currency?: string;
  notes?: string | null;
}) {
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr) throw new Error(userErr.message);
  if (!userData.user) throw new Error("Please login to place the order.");

  const user_id = userData.user.id;

  const subtotal = args.items.reduce(
    (sum, it) => sum + Number(it.price) * Number(it.qty),
    0
  );

  const shippingFee = 0;
  const tax = 0;
  const total = subtotal + shippingFee + tax;

  const { data: address, error: addrErr } = await supabase
    .from("addresses")
    .insert({
      user_id,
      full_name: args.shipping.full_name,
      email: args.shipping.email,
      phone: args.shipping.phone,
      address_line1: args.shipping.address_line1,
      address_line2: args.shipping.address_line2 ?? null,
      city: args.shipping.city,
      state: args.shipping.state,
      postal_code: args.shipping.postal_code,
      country: args.shipping.country,
    })
    .select("id")
    .single();

  if (addrErr) throw new Error(addrErr.message);

  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .insert({
      user_id,
      address_id: address.id,
      status: "pending",
      currency: args.currency ?? "INR",
      subtotal,
      shipping: shippingFee,
      total,
      notes: args.notes ?? null,
    })
    .select("id")
    .single();

  if (orderErr) throw new Error(orderErr.message);

  const itemsPayload = args.items.map((i) => ({
    order_id: order.id,
    product_id: i.id,
    name: i.name,
    price: Number(i.price),
    qty: Number(i.qty),
  }));

  const { error: itemsErr } = await supabase.from("order_items").insert(itemsPayload);
  if (itemsErr) throw new Error(itemsErr.message);

  return { orderId: String(order.id), total };
}

/**
 * ✅ Kept for UI compatibility with CheckoutWhatsApp.tsx
 * This only builds a message string; it does not place orders by WhatsApp.
 */
export function buildWhatsAppOrderMessage(params: {
  items: CartItem[];
  total: number;
  shipping?: Partial<ShippingPayload>;
}) {
  const lines: string[] = [];
  lines.push("Hi! I need help with my order.");
  lines.push("");
  lines.push("Items:");
  params.items.forEach((it) => {
    lines.push(`- ${it.name} x${it.qty} (₹${it.price})`);
  });
  lines.push("");
  lines.push(`Total: ₹${params.total}`);

  // Optional shipping summary (keep minimal)
  const s = params.shipping;
  if (s?.full_name || s?.phone) {
    lines.push("");
    lines.push("Customer:");
    if (s.full_name) lines.push(`Name: ${s.full_name}`);
    if (s.phone) lines.push(`Phone: ${s.phone}`);
  }

  return lines.join("\n");
}
