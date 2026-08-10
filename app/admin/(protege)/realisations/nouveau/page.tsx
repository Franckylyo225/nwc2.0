import { saveWork } from "@/app/admin/actions";
import { ResourceForm } from "@/components/admin/ResourceForm";
import { FormShell } from "@/components/admin/shell";
import { workFields } from "../../fields";

export default function NewWorkPage() {
  return (
    <FormShell title="Nouvelle réalisation">
      <ResourceForm
        fields={workFields}
        values={{ published: true, position: 0, year: String(new Date().getFullYear()) }}
        action={saveWork.bind(null, null)}
        backHref="/admin/realisations"
        submitLabel="Créer le projet"
      />
    </FormShell>
  );
}
