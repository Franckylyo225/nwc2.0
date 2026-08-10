import { removeService, toggleService } from "@/app/admin/actions";
import { RowActions } from "@/components/admin/RowActions";
import { List, PageHeader, Row } from "@/components/admin/shell";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  const services = await prisma.service.findMany({
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
  });

  return (
    <>
      <PageHeader
        title="Services"
        description="Les prestations affichées sur la page d'accueil."
        action={{ href: "/admin/services/nouveau", label: "Ajouter un service" }}
      />

      <List empty="Aucun service pour l'instant.">
        {services.map((service) => (
          <Row
            key={service.id}
            title={service.title}
            muted={!service.published}
            meta={
              <>
                <span>Position {service.position}</span>
                <span aria-hidden>·</span>
                <span>
                  {service.bullets.length} point
                  {service.bullets.length > 1 ? "s" : ""} clé
                  {service.bullets.length > 1 ? "s" : ""}
                </span>
              </>
            }
            actions={
              <RowActions
                editHref={`/admin/services/${service.id}`}
                published={service.published}
                label={service.title}
                onToggle={async () => {
                  "use server";
                  return toggleService(service.id);
                }}
                onRemove={async () => {
                  "use server";
                  return removeService(service.id);
                }}
              />
            }
          />
        ))}
      </List>
    </>
  );
}
