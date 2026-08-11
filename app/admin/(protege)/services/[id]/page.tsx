import { FormShell } from "@/components/admin/shell";
import { ServiceForm } from "../form";

export const dynamic = "force-dynamic";

export default async function EditServiceFormPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <FormShell title="Modifier le service">
      <ServiceForm id={id} />
    </FormShell>
  );
}
