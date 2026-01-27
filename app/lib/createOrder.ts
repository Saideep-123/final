import { supabase } from "./supabaseClient";

export type CartItem = {
  id: number;
  name: string;
  price: number;
  qty: number;
  image?: string;
  weight?: string;
  category?: string;
};

export type ShippingInput = {
  full_name: string;
  email: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country?: string; // default US
};

export async function createOrderInDb(args: {
  items: CartItem[];
  shipping: ShippingInput;
  currency?: string;
  notes?: string;
}) {
  const { items, shipping, currency = "INR", notes } = args;

  if (!items || items.length === 0) {
    return { ok: false as const, error: "Cart is empty" };
  }

  // Require login (because RLS uses auth.uid())
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr) return { ok: false as const, error: userErr.message };
  const user = userData.user;
  if (!user) return { ok: false as const, error: "Please login to place order" };

  // totals
  const subtotal = items.reduce((s, it) => s + Number(it.price) * Number(it.qty), 0);
  const shippingFee = 0; // adjust later if needed
  const total = subtotal + shippingFee;

  // 1) insert address
  const { data: addressRow, error: addrErr } = await supabase
    .from("addresses")
    .insert({
      user_id: user.id,
      full_name: shipping.full_name,
      email: shipping.email,
      phone: shipping.phone,
      address_line1: shipping.address_line1,
      address_line2: shipping.address_line2 ?? null,
      city: shipping.city,
      state: shipping.state,
      postal_code: shipping.postal_code,
      country: shipping.country ?? "US",
    })
    .select("id")
    .single();

  if (addrErr) return { ok: false as const, error: addrErr.message };

  // 2) insert order
  const { data: orderRow, error: orderErr } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      address_id: addressRow.id,
      currency,
      status: "pending",
      subtotal,
      shipping: shippingFee,
      total,
      notes: notes ?? null,
    })
    .select("id")
    .single();

  if (orderErr) return { ok: false as const, error: orderErr.message };

  // 3) insert items
  const payload = items.map((it) => ({
    order_id: orderRow.id,
    product_id: it.id,
    name: it.name,
    price: it.price,
    qty: it.qty,
    image: it.image ?? null,
    weight: it.weight ?? null,
    category: it.category ?? null,
  }));

  const { error: itemsErr } = await supabase.from("order_items").insert(payload);
  if (itemsErr) return { ok: false as const, error: itemsErr.message };

  return {
    ok: true as const,
    orderId: orderRow.id as number,
    totals: { subtotal, shipping: shippingFee, total, currency },
  };
}

export function buildWhatsAppOrderMessage(args: {
  orderId: number;
  items: CartItem[];
  shipping: ShippingInput;
  totals: { subtotal: number; shipping: number; total: number; currency: string };
}) {
  const { orderId, items, shipping, totals } = args;

  const lines: string[] = [];
  lines.push(`New Order ✅`);
  lines.push(`Order ID: ${orderId}`);
  lines.push(``);
  lines.push(`Customer: ${shipping.full_name}`);
  lines.push(`Email: ${shipping.email}`);
  lines.push(`Phone: ${shipping.phone}`);
  lines.push(
    `Address: ${shipping.address_line1}${shipping.address_line2 ? ", " + shipping.address_line2 : ""}, ${shipping.city}, ${shipping.state} ${shipping.postal_code}, ${shipping.country ?? "US"}`
  );
  lines.push(``);
  lines.push(`Items:`);
  for (const it of items) {
    lines.push(`- ${it.name} x${it.qty} = ${totals.currency} ${it.price * it.qty}`);
  }
  lines.push(``);
  lines.push(`Subtotal: ${totals.currency} ${totals.subtotal}`);
  lines.push(`Shipping: ${totals.currency} ${totals.shipping}`);
  lines.push(`Total: ${totals.currency} ${totals.total}`);

  return lines.join("\n");
}
