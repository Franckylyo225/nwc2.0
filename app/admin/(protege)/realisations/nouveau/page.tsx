import { FormShell } from "@/components/admin/shell";
import { WorkForm } from "../form";

export const dynamic = "force-dynamic";

export default function NewWorkFormPage() {
  return (
    <FormShell title="Nouvelle réalisation">
      <WorkForm />
    </FormShell>
  );
}
