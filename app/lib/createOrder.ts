export async function createOrderInDb(args: {
  items: CartItem[];
  shipping: ShippingPayload;
  currency?: string;
  notes?: string | null;
}): Promise<
  | { ok: true; orderId: string; total: number }
  | { ok: false; error: string }
> {
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

    if (addrErr) return { ok: false, error: addrErr.message };

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

    if (orderErr) return { ok: false, error: orderErr.message };

    const itemsPayload = args.items.map((i) => ({
      order_id: order.id,
      product_id: i.id,
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
