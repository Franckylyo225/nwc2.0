import { FormShell } from "@/components/admin/shell";
import { ServiceForm } from "../form";

export const dynamic = "force-dynamic";

export default function NewServiceFormPage() {
  return (
    <FormShell title="Nouveau service">
      <ServiceForm />
    </FormShell>
  );
}
