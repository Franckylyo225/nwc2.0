import { notFound } from "next/navigation";
import { saveTestimonial } from "@/app/admin/actions";
import { ResourceForm } from "@/components/admin/ResourceForm";
import { FormShell } from "@/components/admin/shell";
import { prisma } from "@/lib/db";
import { testimonialFields } from "../../fields";

export const dynamic = "force-dynamic";

export default async function EditTestimonialPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const testimonial = await prisma.testimonial.findUnique({ where: { id } });
  if (!testimonial) notFound();

  return (
    <FormShell title="Modifier le témoignage">
      <ResourceForm
        fields={testimonialFields}
        values={{
          quote: testimonial.quote,
          author: testimonial.author,
          role: testimonial.role,
          company: testimonial.company,
          avatar: testimonial.avatar,
          position: testimonial.position,
          published: testimonial.published,
        }}
        action={saveTestimonial.bind(null, testimonial.id)}
        backHref="/admin/temoignages"
      />
    </FormShell>
  );
}
