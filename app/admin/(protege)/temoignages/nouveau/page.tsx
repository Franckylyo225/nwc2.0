import { saveTestimonial } from "@/app/admin/actions";
import { ResourceForm } from "@/components/admin/ResourceForm";
import { FormShell } from "@/components/admin/shell";
import { testimonialFields } from "../../fields";

export default function NewTestimonialPage() {
  return (
    <FormShell title="Nouveau témoignage">
      <ResourceForm
        fields={testimonialFields}
        values={{ published: true, position: 0 }}
        action={saveTestimonial.bind(null, null)}
        backHref="/admin/temoignages"
        submitLabel="Créer le témoignage"
      />
    </FormShell>
  );
}
