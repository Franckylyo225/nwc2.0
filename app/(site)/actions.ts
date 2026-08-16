"use server";

import { revalidatePath } from "next/cache";
import { isOverQuota, senderHash } from "@/lib/contact";
import { isDatabaseConfigured, prisma } from "@/lib/db";
import {
  HONEYPOT_FIELD,
  RENDERED_AT_FIELD,
  fieldErrorsOf,
  messageSchema,
} from "@/lib/schemas";

/**
 * Réception du formulaire de contact.
 *
 * Seule écriture ouverte au public : tout ce qui arrive ici vient d'un
 * inconnu. Les défenses vivent dans lib/contact.ts ; l'ordre de cette
 * fonction est le leur, du filtre le moins coûteux au plus coûteux.
 */

export type ContactState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  /** Vrai une fois le message enregistré — déclenche l'écran de confirmation. */
  ok?: boolean;
};

/**
 * Délai minimal entre l'affichage et l'envoi. Personne ne décrit un projet en
 * moins de trois secondes ; les robots, si.
 */
const MIN_FILL_MS = 3000;

export async function sendMessage(
  _previous: ContactState,
  formData: FormData,
): Promise<ContactState> {
  if (!isDatabaseConfigured()) {
    return {
      error:
        "Le formulaire n'est pas encore actif. Écrivez-nous directement, l'adresse est juste à côté.",
    };
  }

  /* Un envoi rejeté par un piège reçoit la même confirmation qu'un envoi
     réussi : signaler l'échec ne ferait qu'aider à contourner le piège. */
  if (String(formData.get(HONEYPOT_FIELD) ?? "") !== "") return { ok: true };
  if (tooFast(formData.get(RENDERED_AT_FIELD))) return { ok: true };

  const parsed = messageSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    company: formData.get("company"),
    projectType: formData.get("projectType"),
    budget: formData.get("budget"),
    body: formData.get("body"),
  });

  if (!parsed.success) {
    return {
      error: "Le formulaire est incomplet.",
      fieldErrors: fieldErrorsOf(parsed.error),
    };
  }

  try {
    const hash = await senderHash();

    /* Le quota se vérifie après la validation : une soumission refusée pour
       une faute de frappe ne doit pas consommer le crédit du visiteur. */
    if (await isOverQuota(hash)) {
      return {
        error:
          "Plusieurs messages nous sont déjà parvenus depuis cette connexion. Réessayez plus tard, ou écrivez-nous directement.",
      };
    }

    await prisma.message.create({ data: { ...parsed.data, senderHash: hash } });
  } catch {
    /* L'erreur technique reste dans les journaux : la montrer au visiteur
       exposerait la base sans l'aider en quoi que ce soit. */
    return {
      error:
        "L'envoi a échoué. Réessayez dans un instant, ou écrivez-nous directement.",
    };
  }

  /* Rafraîchit la pastille « non lus » du menu de l'administration. */
  revalidatePath("/admin", "layout");
  return { ok: true };
}

/**
 * Vrai si le formulaire a été renvoyé trop vite après son affichage.
 *
 * L'horodatage est posé par le navigateur : sans JavaScript, il est absent et
 * le test ne s'applique pas. C'est délibéré — refuser dans ce cas écarterait
 * des visiteurs légitimes, alors que le quota, lui, attrape les robots qui en
 * profiteraient. Une valeur future ou illisible est traitée de même.
 */
function tooFast(value: FormDataEntryValue | null): boolean {
  const renderedAt = Number(value);
  if (!Number.isFinite(renderedAt) || renderedAt <= 0) return false;

  const elapsed = Date.now() - renderedAt;
  return elapsed >= 0 && elapsed < MIN_FILL_MS;
}
