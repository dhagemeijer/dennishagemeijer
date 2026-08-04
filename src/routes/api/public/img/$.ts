import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/img/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const path = params._splat;
        if (!path) return new Response("Not found", { status: 404 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const decoded = path
          .split("/")
          .map((segment) => decodeURIComponent(segment))
          .join("/");

        const { data, error } = await supabaseAdmin.storage
          .from("photos")
          .createSignedUrl(decoded, 60 * 60);

        if (error || !data?.signedUrl) {
          return new Response("Not found", { status: 404 });
        }

        const upstream = await fetch(data.signedUrl);
        if (!upstream.ok || !upstream.body) {
          return new Response("Not found", { status: 404 });
        }

        return new Response(upstream.body, {
          status: 200,
          headers: {
            "content-type": upstream.headers.get("content-type") ?? "image/jpeg",
            "cache-control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
