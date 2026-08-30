import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type OrderStatus = "nieuw" | "betaling_verzocht" | "betaald";

export const STATUS_LABELS: Record<OrderStatus, string> = {
  nieuw: "Nieuw",
  betaling_verzocht: "Betaling verzocht",
  betaald: "Betaald",
};

export type Order = {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  photo_count: number;
  total_cents: number;
  status: OrderStatus;
  paid_at: string | null;
  created_at: string;
};

export type OrderItem = {
  id: string;
  photo_id: string | null;
  title: string;
  storage_path: string;
  price_cents: number;
};

export const ordersQuery = queryOptions({
  queryKey: ["orders"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as Order[];
  },
});

export function orderQuery(id: string) {
  return queryOptions({
    queryKey: ["order", id],
    queryFn: async () => {
      const [order, items] = await Promise.all([
        supabase.from("orders").select("*").eq("id", id).maybeSingle(),
        supabase
          .from("order_items")
          .select("id, photo_id, title, storage_path, price_cents")
          .eq("order_id", id)
          .order("created_at", { ascending: true }),
      ]);
      if (order.error) throw new Error(order.error.message);
      if (items.error) throw new Error(items.error.message);
      return {
        order: (order.data as Order | null) ?? null,
        items: (items.data ?? []) as OrderItem[],
      };
    },
  });
}
