import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { itemPrices, totalCents } from "@/lib/pricing";
import {
  adminNewOrderMail,
  downloadLinkMail,
  orderConfirmationMail,
  paymentReceivedMail,
} from "@/lib/mail-templates";

const checkoutInput = z.object({
  naam: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  telefoon: z.string().trim().min(6).max(40),
  photoIds: z.array(z.string().uuid()).min(1).max(100),
});

const ADMIN_FALLBACK_EMAIL = "dennimageai@gmail.com";

function siteOrigin(): string {
  try {
    const request = getRequest();
    const origin = new URL(request.url).origin;
    if (origin.startsWith("http")) return origin;
  } catch {
    /* geen request-context */
  }
  return "[website]";
}

export const createOrder = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => checkoutInput.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { sendMail, sendAdminPush } = await import("@/lib/mail.server");

    const uniqueIds = [...new Set(data.photoIds)];
    const { data: photos, error: photoError } = await supabaseAdmin
      .from("photos")
      .select("id, title, storage_path")
      .in("id", uniqueIds);
    if (photoError) throw new Error(photoError.message);
    if (!photos || photos.length === 0) throw new Error("Geen geldige foto's in je selectie.");

    const count = photos.length;
    const total = totalCents(count);
    const prices = itemPrices(count);

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        customer_name: data.naam,
        customer_email: data.email,
        customer_phone: data.telefoon,
        photo_count: count,
        total_cents: total,
        status: "nieuw",
      })
      .select("id")
      .single();
    if (orderError || !order) throw new Error(orderError?.message ?? "Bestelling mislukt.");

    const { error: itemsError } = await supabaseAdmin.from("order_items").insert(
      photos.map((photo, index) => ({
        order_id: order.id,
        photo_id: photo.id,
        title: photo.title ?? "",
        storage_path: photo.storage_path,
        price_cents: prices[index] ?? 0,
      })),
    );
    if (itemsError) throw new Error(itemsError.message);

    await sendMail(
      data.email,
      orderConfirmationMail({ naam: data.naam, aantal: count, totalCents: total }),
    );

    const { data: settings } = await supabaseAdmin
      .from("site_content")
      .select("key, body")
      .in("key", ["contact_email", "notify_orders_email", "notify_orders_push"]);
    const setting = (key: string) => settings?.find((row) => row.key === key)?.body?.trim();

    const adminMail = adminNewOrderMail({
      naam: data.naam,
      email: data.email,
      telefoon: data.telefoon,
      aantal: count,
      totalCents: total,
    });
    if (setting("notify_orders_email") !== "off") {
      await sendMail(setting("contact_email") || ADMIN_FALLBACK_EMAIL, adminMail);
    }
    if (setting("notify_orders_push") !== "off") {
      await sendAdminPush(adminMail);
    }

    return { orderId: order.id, count, totalCents: total };
  });

const statusInput = z.object({
  orderId: z.string().uuid(),
  status: z.enum(["nieuw", "betaling_verzocht", "betaald"]),
});

export const updateOrderStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => statusInput.parse(input))
  .handler(async ({ data, context }) => {
    const { data: isAdmin, error: roleError } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (roleError) throw new Error(roleError.message);
    if (!isAdmin) throw new Error("Forbidden");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { sendMail } = await import("@/lib/mail.server");

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("id, customer_name, customer_email, total_cents, status, paid_at")
      .eq("id", data.orderId)
      .maybeSingle();
    if (orderError) throw new Error(orderError.message);
    if (!order) throw new Error("Bestelling niet gevonden.");

    const wasPaid = order.status === "betaald";
    const paidAt = data.status === "betaald" ? (order.paid_at ?? new Date().toISOString()) : null;

    const { error: updateError } = await supabaseAdmin
      .from("orders")
      .update({ status: data.status, paid_at: paidAt })
      .eq("id", order.id);
    if (updateError) throw new Error(updateError.message);

    if (data.status !== "betaald" || wasPaid) {
      return { ok: true as const, emailsQueued: false as const };
    }

    // Betaald: tokens (7 dagen vanaf betaalmoment) + twee losse mails.
    const { data: items, error: itemsError } = await supabaseAdmin
      .from("order_items")
      .select("photo_id, storage_path")
      .eq("order_id", order.id);
    if (itemsError) throw new Error(itemsError.message);

    const expiresAt = new Date(new Date(paidAt!).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const orderToken = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");

    await supabaseAdmin.from("download_tokens").delete().eq("order_id", order.id);
    const { error: tokenError } = await supabaseAdmin.from("download_tokens").insert([
      { order_id: order.id, photo_id: null, storage_path: "", token: orderToken, expires_at: expiresAt },
      ...(items ?? []).map((item) => ({
        order_id: order.id,
        photo_id: item.photo_id,
        storage_path: item.storage_path,
        token: crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, ""),
        expires_at: expiresAt,
      })),
    ]);
    if (tokenError) throw new Error(tokenError.message);

    await sendMail(
      order.customer_email,
      paymentReceivedMail({ naam: order.customer_name, totalCents: order.total_cents }),
    );
    await sendMail(
      order.customer_email,
      downloadLinkMail({
        naam: order.customer_name,
        link: `${siteOrigin()}/download/${orderToken}`,
      }),
    );

    return { ok: true as const, emailsQueued: true as const };
  });

/** Publiek: haalt de downloadbundel op bij een geldig ordertoken. */
export const getDownloadBundle = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ token: z.string().min(16).max(128) }).parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: access, error } = await supabaseAdmin
      .from("download_tokens")
      .select("order_id, expires_at, photo_id")
      .eq("token", data.token)
      .is("photo_id", null)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!access) return { ok: false as const, reason: "invalid" as const };
    if (new Date(access.expires_at).getTime() < Date.now()) {
      return { ok: false as const, reason: "expired" as const };
    }

    const [{ data: order }, { data: tokens }] = await Promise.all([
      supabaseAdmin
        .from("orders")
        .select("customer_name, photo_count, total_cents")
        .eq("id", access.order_id)
        .maybeSingle(),
      supabaseAdmin
        .from("download_tokens")
        .select("token, storage_path, used_at, photo_id")
        .eq("order_id", access.order_id)
        .not("photo_id", "is", null),
    ]);

    const { data: items } = await supabaseAdmin
      .from("order_items")
      .select("photo_id, title, storage_path")
      .eq("order_id", access.order_id);

    return {
      ok: true as const,
      naam: order?.customer_name ?? "",
      expiresAt: access.expires_at,
      files: (tokens ?? []).map((token) => ({
        token: token.token,
        used: Boolean(token.used_at),
        title:
          items?.find((item) => item.photo_id === token.photo_id)?.title ||
          token.storage_path.split("/").pop() ||
          "Foto",
        storagePath: token.storage_path,
      })),
    };
  });
