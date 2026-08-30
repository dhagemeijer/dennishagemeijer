import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { photoUrl, formatDateNl } from "@/lib/photo";
import { formatEuro } from "@/lib/pricing";
import { orderQuery, STATUS_LABELS, type OrderStatus } from "@/lib/orderQueries";
import { updateOrderStatus } from "@/lib/orders.functions";

export const Route = createFileRoute("/_authenticated/admin/bestelling/$id")({
  head: () => ({
    meta: [
      { title: "Bestelling — Dennis Hagemeijer Fotografie" },
      { name: "description", content: "Details van een bestelling." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Bestelling — Dennis Hagemeijer Fotografie" },
      { property: "og:description", content: "Beheeromgeving." },
    ],
  }),
  component: OrderDetail,
});

function OrderDetail() {
  const { id } = Route.useParams();
  const queryClient = useQueryClient();
  const { data } = useQuery(orderQuery(id));
  const setStatus = useServerFn(updateOrderStatus);

  const mutate = useMutation({
    mutationFn: async (status: OrderStatus) => setStatus({ data: { orderId: id, status } }),
    onSuccess: (result) => {
      toast.success(
        result.emailsQueued
          ? "Gemarkeerd als betaald — mails en downloadlinks aangemaakt"
          : "Status bijgewerkt",
      );
      void queryClient.invalidateQueries({ queryKey: ["order", id] });
      void queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const order = data?.order;

  return (
    <div className="page-shell space-y-10 py-12">
      <Link
        to="/admin"
        className="inline-flex items-center gap-2 text-[0.6875rem] tracking-[0.2em] text-muted-foreground uppercase"
      >
        <ArrowLeft className="size-4" /> Dashboard
      </Link>

      {!order ? (
        <p className="text-sm text-muted-foreground">Bestelling niet gevonden.</p>
      ) : (
        <>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
                {STATUS_LABELS[order.status]} · {formatDateNl(order.created_at)}
              </p>
              <h1 className="font-display text-3xl">{order.customer_name}</h1>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                disabled={mutate.isPending || order.status !== "nieuw"}
                onClick={() => mutate.mutate("betaling_verzocht")}
              >
                Markeer betaling verzocht
              </Button>
              <Button
                disabled={mutate.isPending || order.status === "betaald"}
                onClick={() => mutate.mutate("betaald")}
              >
                Markeer als betaald
              </Button>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            <div className="rounded-xl border border-border p-8 text-sm">
              <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">Contact</p>
              <p className="mt-3">{order.customer_email}</p>
              <p className="text-muted-foreground">{order.customer_phone}</p>
            </div>
            <div className="rounded-xl border border-border p-8">
              <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">Totaal</p>
              <p className="mt-3 font-display text-3xl">{formatEuro(order.total_cents)}</p>
              <p className="text-xs text-muted-foreground">{order.photo_count} foto&apos;s</p>
            </div>
            <div className="rounded-xl border border-border p-8 text-sm">
              <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">Betaald op</p>
              <p className="mt-3">{order.paid_at ? formatDateNl(order.paid_at) : "—"}</p>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {(data?.items ?? []).map((item) => {
              const src = photoUrl(item.storage_path);
              return (
                <div key={item.id} className="rounded-xl border border-border p-4">
                  {src ? (
                    <img
                      src={src}
                      alt={item.title || "Foto"}
                      loading="lazy"
                      className="aspect-[4/3] w-full object-cover"
                    />
                  ) : null}
                  <p className="mt-3 text-sm">{item.title || "Zonder titel"}</p>
                  <p className="text-xs text-muted-foreground">{formatEuro(item.price_cents)}</p>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
