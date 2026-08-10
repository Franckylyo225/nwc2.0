import { saveService } from "@/app/admin/actions";
import { ResourceForm } from "@/components/admin/ResourceForm";
import { FormShell } from "@/components/admin/shell";
import { serviceFields } from "../../fields";

export default function NewServicePage() {
  return (
    <FormShell title="Nouveau service">
      <ResourceForm
        fields={serviceFields}
        values={{ published: true, position: 0 }}
        action={saveService.bind(null, null)}
        backHref="/admin/services"
        submitLabel="Créer le service"
      />
    </FormShell>
  );
}
