import { formatCents } from "@/lib/pricing";

/**
 * E-mailteksten. [website] en [Instagram] blijven bewust letterlijke
 * placeholders tot de definitieve waarden bekend zijn.
 */
const SIGNATURE = `Met vriendelijke groet,
Dennis Hagemeijer
[website] · [Instagram]`;

export type MailMessage = { subject: string; text: string };

export function orderConfirmationMail(input: {
  naam: string;
  aantal: number;
  totalCents: number;
}): MailMessage {
  return {
    subject: "Bevestiging van je bestelling — Dennis Hagemeijer Fotografie",
    text: `Beste ${input.naam},

Bedankt voor je bestelling! Ik heb je selectie van ${input.aantal} foto's in goede orde ontvangen, met een totaalbedrag van €${formatCents(input.totalCents)}.

Je ontvangt binnenkort een betaalverzoek van mij. Zodra de betaling is verwerkt, stuur ik je een downloadlink voor je foto's.

Heb je vragen? Antwoord gerust op deze mail.

${SIGNATURE}`,
  };
}

export function paymentReceivedMail(input: { naam: string; totalCents: number }): MailMessage {
  return {
    subject: "Betaling ontvangen — bedankt!",
    text: `Beste ${input.naam},

Je betaling van €${formatCents(input.totalCents)} is bij mij binnengekomen — dank je wel! Je downloadlink volgt in een aparte mail.

${SIGNATURE}`,
  };
}

export function downloadLinkMail(input: { naam: string; link: string }): MailMessage {
  return {
    subject: "Je foto's staan voor je klaar",
    text: `Beste ${input.naam},

Hier is de link naar je foto's. Deze link is 7 dagen geldig en eenmalig te gebruiken, dus download je bestanden op een moment dat het je uitkomt.

👉 ${input.link}

Heb je onverhoopt problemen met downloaden, laat het me gewoon weten.

${SIGNATURE}`,
  };
}

export function adminNewOrderMail(input: {
  naam: string;
  email: string;
  telefoon: string;
  aantal: number;
  totalCents: number;
}): MailMessage {
  return {
    subject: `Nieuwe bestelling — ${input.naam} (€${formatCents(input.totalCents)})`,
    text: `Nieuwe bestelling ontvangen.

Naam: ${input.naam}
E-mail: ${input.email}
Telefoon: ${input.telefoon}
Aantal foto's: ${input.aantal}
Totaal: €${formatCents(input.totalCents)}

Stuur een betaalverzoek en markeer de bestelling daarna in het dashboard.`,
  };
}
