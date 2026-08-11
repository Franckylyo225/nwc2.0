import { FormShell } from "@/components/admin/shell";
import { ProductForm } from "../form";

export const dynamic = "force-dynamic";

export default function NewProductFormPage() {
  return (
    <FormShell title="Nouveau projet maison">
      <ProductForm />
    </FormShell>
  );
}
