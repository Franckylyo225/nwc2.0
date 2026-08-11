import { FormShell } from "@/components/admin/shell";
import { ProductForm } from "../form";

export const dynamic = "force-dynamic";

export default async function EditProductFormPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <FormShell title="Modifier le projet maison">
      <ProductForm id={id} />
    </FormShell>
  );
}
