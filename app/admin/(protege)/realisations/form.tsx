import { notFound } from "next/navigation";
import { saveWork } from "@/app/admin/actions";
import { ResourceForm } from "@/components/admin/ResourceForm";
import { prisma } from "@/lib/db";
import { workFields } from "../fields";

/**
 * Corps du formulaire, partagé par la page pleine et le panneau latéral.
 * Sans `id`, c'est une création.
 */
export async function WorkForm({
  id,
  variant = "page",
}: {
  id?: string;
  variant?: "page" | "drawer";
}) {
  const row = id ? await prisma.work.findUnique({ where: { id } }) : null;
  if (id && !row) notFound();

  return (
    <ResourceForm
      fields={workFields}
      values={
        row
          ? {
            name: row.name,
            slug: row.slug,
            category: row.category,
            year: row.year,
            summary: row.summary,
            href: row.href,
            image: row.image,
            position: row.position,
            published: row.published,
          }
          : { published: true, position: 0, year: String(new Date().getFullYear()) }
      }
      action={saveWork.bind(null, row?.id ?? null)}
      variant={variant}
      backHref="/admin/realisations"
      submitLabel={row ? "Enregistrer" : "Créer le projet"}
    />
  );
}
