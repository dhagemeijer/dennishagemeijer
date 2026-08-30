import { createFileRoute } from "@tanstack/react-router";

/** Eenmalige download per foto op basis van een downloadtoken. */
export const Route = createFileRoute("/api/public/download/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const token = (params._splat ?? "").split("/")[0];
        if (!token || token.length < 16) return new Response("Not found", { status: 404 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const { data: row, error } = await supabaseAdmin
          .from("download_tokens")
          .select("id, storage_path, expires_at, used_at, photo_id")
          .eq("token", token)
          .maybeSingle();

        if (error || !row || !row.photo_id || !row.storage_path) {
          return new Response("Deze downloadlink is niet geldig.", { status: 404 });
        }
        if (row.used_at) {
          return new Response("Deze downloadlink is al gebruikt.", { status: 410 });
        }
        if (new Date(row.expires_at).getTime() < Date.now()) {
          return new Response("Deze downloadlink is verlopen.", { status: 410 });
        }

        const { data: signed, error: signError } = await supabaseAdmin.storage
          .from("photos")
          .createSignedUrl(row.storage_path, 60 * 10);
        if (signError || !signed?.signedUrl) {
          return new Response("Bestand niet gevonden.", { status: 404 });
        }

        const upstream = await fetch(signed.signedUrl);
        if (!upstream.ok || !upstream.body) {
          return new Response("Bestand niet gevonden.", { status: 404 });
        }

        await supabaseAdmin
          .from("download_tokens")
          .update({ used_at: new Date().toISOString() })
          .eq("id", row.id);

        const filename = row.storage_path.split("/").pop() ?? "foto.jpg";
        return new Response(upstream.body, {
          status: 200,
          headers: {
            "content-type": upstream.headers.get("content-type") ?? "application/octet-stream",
            "content-disposition": `attachment; filename="${filename.replace(/"/g, "")}"`,
            "cache-control": "no-store",
          },
        });
      },
    },
  },
});
