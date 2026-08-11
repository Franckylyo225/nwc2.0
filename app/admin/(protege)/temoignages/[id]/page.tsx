import { FormShell } from "@/components/admin/shell";
import { TestimonialForm } from "../form";

export const dynamic = "force-dynamic";

export default async function EditTestimonialFormPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <FormShell title="Modifier le témoignage">
      <TestimonialForm id={id} />
    </FormShell>
  );
}
