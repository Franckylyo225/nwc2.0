import { notFound } from "next/navigation";
import { saveTestimonial } from "@/app/admin/actions";
import { ResourceForm } from "@/components/admin/ResourceForm";
import { prisma } from "@/lib/db";
import { testimonialFields } from "../fields";

/**
 * Corps du formulaire, partagé par la page pleine et le panneau latéral.
 * Sans `id`, c'est une création.
 */
export async function TestimonialForm({
  id,
  variant = "page",
}: {
  id?: string;
  variant?: "page" | "drawer";
}) {
  const row = id ? await prisma.testimonial.findUnique({ where: { id } }) : null;
  if (id && !row) notFound();

  return (
    <ResourceForm
      fields={testimonialFields}
      values={
        row
          ? {
            quote: row.quote,
            author: row.author,
            role: row.role,
            company: row.company,
            avatar: row.avatar,
            position: row.position,
            published: row.published,
          }
          : { published: true, position: 0 }
      }
      action={saveTestimonial.bind(null, row?.id ?? null)}
      variant={variant}
      backHref="/admin/temoignages"
      submitLabel={row ? "Enregistrer" : "Créer le témoignage"}
    />
  );
}
