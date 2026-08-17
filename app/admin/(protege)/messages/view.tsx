import { notFound } from "next/navigation";
import { MessageActions } from "@/components/admin/MessageActions";
import { prisma } from "@/lib/db";
import type { Message } from "@/lib/generated/prisma";

/** Date et heure : sur un message, l'heure de réception compte. */
const stamp = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "long",
  timeStyle: "short",
});

/**
 * Charge un message et le marque lu au passage.
 *
 * Ouvrir un message le marque lu : c'est le geste attendu, et l'exiger d'un
 * clic supplémentaire laisserait la pastille des non-lus mentir. Celle-ci vit
 * dans le menu, rendu en même temps que cette page : elle ne retombera juste
 * qu'à la navigation suivante — soit, en pratique, au retour vers la liste.
 */
export async function loadMessage(id: string): Promise<Message> {
  const message = await prisma.message.findUnique({ where: { id } });
  if (!message) notFound();

  if (message.status === "NEW") {
    await prisma.message.update({ where: { id }, data: { status: "READ" } });
    return { ...message, status: "READ" };
  }

  return message;
}

/** Corps d'un message, partagé par la page pleine et le panneau latéral. */
export function MessageView({ message }: { message: Message }) {
  /**
   * Bouton de réponse, adapté au canal demandé.
   *
   * WhatsApp veut le numéro en chiffres seuls, indicatif compris et sans le
   * `+` : tout le reste — espaces, points, parenthèses — casse le lien.
   *
   * Pour un e-mail, destinataire, objet et salutation sont pré-remplis :
   * répondre ne demande alors qu'un clic, et la réponse part de la vraie boîte
   * du studio, pas du site.
   */
  const reply = message.email
    ? {
        label: "Répondre par e-mail",
        href:
          `mailto:${message.email}` +
          `?subject=${encodeURIComponent("Votre projet — New Wave Conception")}` +
          `&body=${encodeURIComponent(`Bonjour ${message.name},\n\n`)}`,
      }
    : {
        label: "Répondre sur WhatsApp",
        href: `https://wa.me/${(message.phone ?? "").replace(/\D/g, "")}?text=${encodeURIComponent(
          `Bonjour ${message.name}, merci pour votre demande —`,
        )}`,
      };

  return (
    <div className="flex flex-col gap-8">
      <dl className="grid gap-x-6 gap-y-4 rounded-card bg-surface/60 px-5 py-5 ring-1 ring-line sm:grid-cols-2">
        <Detail label="Reçu le">{stamp.format(message.createdAt)}</Detail>
        <Detail label="Rappel souhaité par">{message.preferredContact}</Detail>

        {message.email ? (
          <Detail label="E-mail">
            <a
              href={`mailto:${message.email}`}
              className="text-accent underline underline-offset-2"
            >
              {message.email}
            </a>
          </Detail>
        ) : null}
        {message.phone ? (
          <Detail label="Téléphone">
            <a
              href={`tel:${message.phone}`}
              className="text-accent underline underline-offset-2"
            >
              {message.phone}
            </a>
          </Detail>
        ) : null}

        <Detail label="Besoins">{message.services.join(", ")}</Detail>
        <Detail label="Envergure">{message.scope}</Detail>
      </dl>

      {/* Précision libre, saisie quand « Autre service » est coché — donc
          souvent absente. `whitespace-pre-line` restitue les paragraphes du
          visiteur ; le texte n'est jamais interprété, c'est une saisie
          publique. */}
      {message.body ? (
        <p className="whitespace-pre-line leading-relaxed text-ink-soft">
          {message.body}
        </p>
      ) : null}

      <MessageActions
        id={message.id}
        status={message.status}
        author={message.name}
        reply={reply}
      />
    </div>
  );
}

function Detail({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs uppercase tracking-[0.14em] text-muted">{label}</dt>
      <dd className="text-sm text-ink">{children}</dd>
    </div>
  );
}
