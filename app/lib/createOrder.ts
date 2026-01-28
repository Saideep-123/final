// app/lib/createOrder.ts
import { supabase } from "./supabaseClient";

export type CartItem = {
  id: string; // ✅ changed from number -> string to match CartContext
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

  // 1) address
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

  // 2) order
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

  // 3) order items
  const itemsPayload = args.items.map((i) => ({
    order_id: order.id,
    product_id: i.id, // ✅ keep as string
    name: i.name,
    price: Number(i.price),
    qty: Number(i.qty),
  }));

  const { error: itemsErr } = await supabase.from("order_items").insert(itemsPayload);
  if (itemsErr) throw new Error(itemsErr.message);

  return { orderId: String(order.id), total };
}
