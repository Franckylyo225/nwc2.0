import { removeWork, toggleWork } from "@/app/admin/actions";
import { RowActions } from "@/components/admin/RowActions";
import { List, PageHeader, Row } from "@/components/admin/shell";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function WorksPage() {
  const works = await prisma.work.findMany({
    orderBy: [{ position: "asc" }, { createdAt: "desc" }],
  });

  return (
    <>
      <PageHeader
        title="Réalisations"
        description="Les projets menés pour vos clients."
        action={{ href: "/admin/realisations/nouveau", label: "Ajouter un projet" }}
      />

      <List empty="Aucune réalisation pour l'instant.">
        {works.map((work) => (
          <Row
            key={work.id}
            title={work.name}
            muted={!work.published}
            meta={
              <>
                <span>{work.category}</span>
                <span aria-hidden>·</span>
                <span>{work.year}</span>
                {work.image ? (
                  <>
                    <span aria-hidden>·</span>
                    <span>visuel</span>
                  </>
                ) : null}
              </>
            }
            actions={
              <RowActions
                editHref={`/admin/realisations/${work.id}`}
                published={work.published}
                label={work.name}
                onToggle={async () => {
                  "use server";
                  return toggleWork(work.id);
                }}
                onRemove={async () => {
                  "use server";
                  return removeWork(work.id);
                }}
              />
            }
          />
        ))}
      </List>
    </>
  );
}
