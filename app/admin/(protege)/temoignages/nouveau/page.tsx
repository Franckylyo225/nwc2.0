import { FormShell } from "@/components/admin/shell";
import { TestimonialForm } from "../form";

export const dynamic = "force-dynamic";

export default function NewTestimonialFormPage() {
  return (
    <FormShell title="Nouveau témoignage">
      <TestimonialForm />
    </FormShell>
  );
}
