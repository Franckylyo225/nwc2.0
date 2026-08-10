import { notFound } from "next/navigation";
import { saveService } from "@/app/admin/actions";
import { ResourceForm } from "@/components/admin/ResourceForm";
import { FormShell } from "@/components/admin/shell";
import { prisma } from "@/lib/db";
import { serviceFields } from "../../fields";

export const dynamic = "force-dynamic";

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const service = await prisma.service.findUnique({ where: { id } });
  if (!service) notFound();

  return (
    <FormShell title="Modifier le service">
      <ResourceForm
        fields={serviceFields}
        values={{
          title: service.title,
          description: service.description,
          bullets: service.bullets,
          position: service.position,
          published: service.published,
        }}
        action={saveService.bind(null, service.id)}
        backHref="/admin/services"
      />
    </FormShell>
  );
}
