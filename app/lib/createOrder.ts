// app/lib/createOrder.ts
import { supabase } from "./supabaseClient";

export type CartItem = {
  id: string; // keep string to match CartContext easily
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

export type CreateOrderResult =
  | { ok: true; orderId: string; total: number }
  | { ok: false; error: string };

/**
 * Creates address + order + order_items in Supabase.
 * Returns {ok:true,...} or {ok:false,error} to match CheckoutWhatsApp.tsx checks.
 */
export async function createOrderInDb(args: {
  items: CartItem[];
  shipping: ShippingPayload;
  currency?: string;
  notes?: string | null;
}): Promise<CreateOrderResult> {
  try {
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr) return { ok: false, error: userErr.message };
    if (!userData.user) return { ok: false, error: "Please login to place the order." };

    const user_id = userData.user.id;

    const subtotal = args.items.reduce(
      (sum, it) => sum + Number(it.price) * Number(it.qty),
      0
    );

    const shippingFee = 0;
    const tax = 0;
    const total = subtotal + shippingFee + tax;

    // 1) insert address
    const { data: address, error: addrErr } = await supabase
      .from("addresses")
      .insert({
        user_id,
        full_name: args.shipping.full_name.trim(),
        email: args.shipping.email.trim(),
        phone: args.shipping.phone.trim(),
        address_line1: args.shipping.address_line1.trim(),
        address_line2: args.shipping.address_line2?.trim() || null,
        city: args.shipping.city.trim(),
        state: args.shipping.state.trim(),
        postal_code: args.shipping.postal_code.trim(),
        country: args.shipping.country.trim(),
      })
      .select("id")
      .single();

    if (addrErr) return { ok: false, error: addrErr.message };

    // 2) insert order
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        user_id,
        address_id: address.id,
        status: "pending",
        payment_status: "unpaid", // safe default if your table has this column
        currency: args.currency ?? "INR",
        subtotal,
        shipping: shippingFee,
        tax,
        total,
        notes: args.notes ?? null,
      })
      .select("id")
      .single();

    if (orderErr) return { ok: false, error: orderErr.message };

    // 3) insert order items
    const itemsPayload = args.items.map((i) => ({
      order_id: order.id,
      product_id: i.id, // string is fine if DB column is text; if bigint, change DB or cast here
      name: i.name,
      price: Number(i.price),
      qty: Number(i.qty),
    }));

    const { error: itemsErr } = await supabase.from("order_items").insert(itemsPayload);
    if (itemsErr) return { ok: false, error: itemsErr.message };

    return { ok: true, orderId: String(order.id), total };
  } catch (e: any) {
    return { ok: false, error: e?.message || "Failed to create order." };
  }
}

/**
 * ✅ This export is required because CheckoutWhatsApp.tsx imports it.
 * If you later want WhatsApp to be "contact only", we can simplify the message.
 */
export function buildWhatsAppOrderMessage(params: {
  items: CartItem[];
  total: number;
  shipping?: Partial<ShippingPayload>;
}) {
  const lines: string[] = [];

  lines.push("Hi, I need help.");
  lines.push("");

  lines.push("Items:");
  for (const it of params.items) {
    lines.push(`- ${it.name} x${it.qty} (₹${it.price})`);
  }

  lines.push("");
  lines.push(`Total: ₹${params.total}`);

  const s = params.shipping;
  if (s?.full_name || s?.phone) {
    lines.push("");
    lines.push("Customer:");
    if (s.full_name) lines.push(`Name: ${s.full_name}`);
    if (s.phone) lines.push(`Phone: ${s.phone}`);
  }

  return lines.join("\n");
}
