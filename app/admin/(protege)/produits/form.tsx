import { notFound } from "next/navigation";
import { saveProduct } from "@/app/admin/actions";
import { ResourceForm } from "@/components/admin/ResourceForm";
import { prisma } from "@/lib/db";
import { productFields } from "../fields";

/**
 * Corps du formulaire, partagé par la page pleine et le panneau latéral.
 * Sans `id`, c'est une création.
 */
export async function ProductForm({
  id,
  variant = "page",
}: {
  id?: string;
  variant?: "page" | "drawer";
}) {
  const row = id ? await prisma.product.findUnique({ where: { id } }) : null;
  if (id && !row) notFound();

  return (
    <ResourceForm
      fields={productFields}
      values={
        row
          ? {
            name: row.name,
            slug: row.slug,
            tagline: row.tagline,
            description: row.description,
            status: row.status,
            tags: row.tags,
            href: row.href,
            image: row.image,
            position: row.position,
            published: row.published,
          }
          : { published: true, position: 0, status: "ONLINE" }
      }
      action={saveProduct.bind(null, row?.id ?? null)}
      variant={variant}
      backHref="/admin/produits"
      submitLabel={row ? "Enregistrer" : "Créer le produit"}
    />
  );
}
