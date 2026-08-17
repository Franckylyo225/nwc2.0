import { notFound } from "next/navigation";
import { saveService } from "@/app/admin/actions";
import { ResourceForm } from "@/components/admin/ResourceForm";
import { prisma } from "@/lib/db";
import { storageMode } from "@/lib/upload";
import { serviceFields } from "../fields";

/**
 * Corps du formulaire, partagé par la page pleine et le panneau latéral.
 * Sans `id`, c'est une création.
 */
export async function ServiceForm({
  id,
  variant = "page",
}: {
  id?: string;
  variant?: "page" | "drawer";
}) {
  const row = id ? await prisma.service.findUnique({ where: { id } }) : null;
  if (id && !row) notFound();

  return (
    <ResourceForm
      fields={serviceFields}
      values={
        row
          ? {
            title: row.title,
            description: row.description,
            bullets: row.bullets,
            image: row.image,
            position: row.position,
            published: row.published,
          }
          : { published: true, position: 0 }
      }
      action={saveService.bind(null, row?.id ?? null)}
      variant={variant}
      storage={storageMode() === "blob" ? "blob" : "server"}
      backHref="/admin/services"
      submitLabel={row ? "Enregistrer" : "Créer le service"}
    />
  );
}
