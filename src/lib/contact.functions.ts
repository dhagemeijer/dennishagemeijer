import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

import type { Database } from "@/integrations/supabase/types";

const contactInput = z.object({
  naam: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  bericht: z.string().trim().min(10).max(2000),
});

const FALLBACK_RECIPIENT = "dennimageai@gmail.com";

export const sendContactMessage = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => contactInput.parse(input))
  .handler(async ({ data }) => {
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
    const supabasePublic = createClient<Database>(process.env["SUPABASE_URL"]!, key, {
      auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input, init) => {
          const headers = new Headers(init?.headers);
          if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
            headers.delete("Authorization");
          }
          headers.set("apikey", key);
          return fetch(input, { ...init, headers });
        },
      },
    });

    const { data: setting } = await supabasePublic
      .from("site_content")
      .select("body")
      .eq("key", "contact_email")
      .maybeSingle();

    const recipient = setting?.body?.trim() || FALLBACK_RECIPIENT;

    // E-mailverzending wordt geactiveerd zodra het afzenderdomein is ingesteld.
    console.log("[contact] bericht ontvangen voor", recipient, "van", data.email);

    return { ok: false as const, reason: "email_not_configured" as const, recipient };
  });
