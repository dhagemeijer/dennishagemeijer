import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { formatDateNl } from "@/lib/photo";
import { formatEuro } from "@/lib/pricing";
import { ordersQuery, STATUS_LABELS, type OrderStatus } from "@/lib/orderQueries";

const FILTERS = ["alle", "nieuw", "betaling_verzocht", "betaald"] as const;

export function OrdersAdmin() {
  const { data: orders = [] } = useQuery(ordersQuery);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("alle");
  const [newestFirst, setNewestFirst] = useState(true);

  const visible = orders
    .filter((order) => filter === "alle" || order.status === filter)
    .sort((a, b) =>
      newestFirst
        ? b.created_at.localeCompare(a.created_at)
        : a.created_at.localeCompare(b.created_at),
    );

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">Verkoop</p>
          <h2 className="font-display text-2xl">Bestellingen</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {FILTERS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={`border px-3 py-2 text-[0.625rem] tracking-[0.18em] uppercase transition-colors ${
                filter === value
                  ? "border-primary text-foreground"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {value === "alle" ? "Alle" : STATUS_LABELS[value as OrderStatus]}
            </button>
          ))}
          <Button variant="outline" size="sm" onClick={() => setNewestFirst((v) => !v)}>
            {newestFirst ? "Nieuwste eerst" : "Oudste eerst"}
          </Button>
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="rounded-xl border border-border p-8 text-sm text-muted-foreground">
          Nog geen bestellingen in deze status.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-[0.625rem] tracking-[0.18em] text-muted-foreground uppercase">
                <th className="p-4">Klant</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Foto&apos;s</th>
                <th className="p-4">Totaal</th>
                <th className="p-4">Status</th>
                <th className="p-4">Datum</th>
                <th className="p-4" />
              </tr>
            </thead>
            <tbody>
              {visible.map((order) => (
                <tr key={order.id} className="border-b border-border last:border-0">
                  <td className="p-4">{order.customer_name}</td>
                  <td className="p-4 text-muted-foreground">
                    {order.customer_email}
                    <br />
                    {order.customer_phone}
                  </td>
                  <td className="p-4">{order.photo_count}</td>
                  <td className="p-4">{formatEuro(order.total_cents)}</td>
                  <td className="p-4">
                    <span className="text-xs tracking-[0.14em] text-primary uppercase">
                      {STATUS_LABELS[order.status]}
                    </span>
                  </td>
                  <td className="p-4 text-muted-foreground">{formatDateNl(order.created_at)}</td>
                  <td className="p-4 text-right">
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/admin/bestelling/$id" params={{ id: order.id }}>
                        Bekijken
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
