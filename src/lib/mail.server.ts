import type { MailMessage } from "@/lib/mail-templates";

export type MailResult = { sent: boolean; reason?: "email_not_configured" | "error" };

/**
 * Centrale verzendlaag. Zodra het afzenderdomein in Lovable is ingesteld,
 * hoeft alleen deze functie te worden aangesloten op de mailservice —
 * alle triggers en templates staan al klaar.
 */
export async function sendMail(to: string, message: MailMessage): Promise<MailResult> {
  console.log("[mail] naar", to, "|", message.subject);
  console.log(message.text);
  await Promise.resolve();
  return { sent: false, reason: "email_not_configured" };
}

/** Pushmelding voor de beheerder (nog geen kanaal geconfigureerd). */
export async function sendAdminPush(message: MailMessage): Promise<MailResult> {
  console.log("[push] admin |", message.subject);
  await Promise.resolve();
  return { sent: false, reason: "email_not_configured" };
}
