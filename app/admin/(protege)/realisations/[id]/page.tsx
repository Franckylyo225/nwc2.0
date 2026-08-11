import { FormShell } from "@/components/admin/shell";
import { WorkForm } from "../form";

export const dynamic = "force-dynamic";

export default async function EditWorkFormPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <FormShell title="Modifier la réalisation">
      <WorkForm id={id} />
    </FormShell>
  );
}
