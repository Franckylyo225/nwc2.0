import { notFound } from "next/navigation";
import { saveWork } from "@/app/admin/actions";
import { ResourceForm } from "@/components/admin/ResourceForm";
import { FormShell } from "@/components/admin/shell";
import { prisma } from "@/lib/db";
import { workFields } from "../../fields";

export const dynamic = "force-dynamic";

export default async function EditWorkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const work = await prisma.work.findUnique({ where: { id } });
  if (!work) notFound();

  return (
    <FormShell title="Modifier la réalisation">
      <ResourceForm
        fields={workFields}
        values={{
          name: work.name,
          slug: work.slug,
          category: work.category,
          year: work.year,
          summary: work.summary,
          href: work.href,
          image: work.image,
          position: work.position,
          published: work.published,
        }}
        action={saveWork.bind(null, work.id)}
        backHref="/admin/realisations"
      />
    </FormShell>
  );
}
