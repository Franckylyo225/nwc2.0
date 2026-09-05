import "server-only";

import { Resend } from "resend";

/**
 * Notification par e-mail des nouveaux messages du formulaire de contact.
 *
 * Facultatif, comme BLOB_READ_WRITE_TOKEN (voir lib/upload.ts) : sans
 * RESEND_API_KEY, le message reste enregistré en base — seule écriture qui
 * compte — et personne n'est notifié par e-mail.
 */

const NOTIFICATION_RECIPIENTS = ["hello@nwc-agency.com", "francky.lionel225@gmail.com"];

let client: Resend | null = null;

function getClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return (client ??= new Resend(apiKey));
}

export type ContactMessage = {
  name: string;
  services: string[];
  scope: string;
  preferredContact: string;
  email: string | null;
  phone: string | null;
  body: string | null;
};

/**
 * Envoie la notification aux adresses de l'agence.
 *
 * Une erreur (clé absente, API en panne...) est journalisée mais jamais
 * remontée à l'appelant : le message est déjà enregistré, et son
 * enregistrement ne doit pas dépendre de l'envoi de l'e-mail.
 */
export async function notifyNewMessage(message: ContactMessage): Promise<void> {
  const resend = getClient();
  const from = process.env.RESEND_FROM_EMAIL;
  if (!resend || !from) return;

  const contact = message.email ?? message.phone ?? "—";

  try {
    const { error } = await resend.emails.send({
      from,
      to: NOTIFICATION_RECIPIENTS,
      ...(message.email ? { replyTo: message.email } : {}),
      subject: `Nouveau message de ${message.name}`,
      html: renderNotificationHtml(message, contact),
    });

    if (error) console.error("[resend] notification de message refusée", error);
  } catch (error) {
    console.error("[resend] notification de message échouée", error);
  }
}

function renderNotificationHtml(message: ContactMessage, contact: string) {
  const rows: [string, string][] = [
    ["Nom", message.name],
    ["Besoins", message.services.join(", ")],
    ["Envergure", message.scope],
    ["Contact préféré", message.preferredContact],
    ["Coordonnée", contact],
    ["Message", message.body ?? "—"],
  ];

  const body = rows
    .map(
      ([label, value]) => `
      <tr>
        <td style="padding:6px 12px 6px 0;font-weight:600;vertical-align:top;white-space:nowrap;">${escapeHtml(label)}</td>
        <td style="padding:6px 0;">${escapeHtml(value).replace(/\n/g, "<br>")}</td>
      </tr>`,
    )
    .join("");

  return `<div style="font-family:sans-serif;font-size:14px;color:#111;">
    <h2 style="margin:0 0 16px;">Nouveau message reçu sur le site</h2>
    <table cellpadding="0" cellspacing="0">${body}</table>
  </div>`;
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
