import { removeTestimonial, toggleTestimonial } from "@/app/admin/actions";
import { RowActions } from "@/components/admin/RowActions";
import { List, PageHeader, Row } from "@/components/admin/shell";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function TestimonialsPage() {
  const testimonials = await prisma.testimonial.findMany({
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
  });

  return (
    <>
      <PageHeader
        title="Témoignages"
        description="Les retours clients du carrousel de la page d'accueil."
        action={{ href: "/admin/temoignages/nouveau", label: "Ajouter un témoignage" }}
      />

      <List empty="Aucun témoignage pour l'instant.">
        {testimonials.map((testimonial) => (
          <Row
            key={testimonial.id}
            title={testimonial.author}
            muted={!testimonial.published}
            meta={
              <>
                <span>
                  {testimonial.role} · {testimonial.company}
                </span>
                <span aria-hidden>·</span>
                <span className="truncate">
                  « {testimonial.quote.slice(0, 60)}
                  {testimonial.quote.length > 60 ? "…" : ""} »
                </span>
              </>
            }
            actions={
              <RowActions
                editHref={`/admin/temoignages/${testimonial.id}`}
                published={testimonial.published}
                label={testimonial.author}
                onToggle={async () => {
                  "use server";
                  return toggleTestimonial(testimonial.id);
                }}
                onRemove={async () => {
                  "use server";
                  return removeTestimonial(testimonial.id);
                }}
              />
            }
          />
        ))}
      </List>
    </>
  );
}
