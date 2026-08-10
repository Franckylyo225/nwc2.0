import { saveProduct } from "@/app/admin/actions";
import { ResourceForm } from "@/components/admin/ResourceForm";
import { FormShell } from "@/components/admin/shell";
import { productFields } from "../../fields";

export default function NewProductPage() {
  return (
    <FormShell title="Nouveau projet maison">
      <ResourceForm
        fields={productFields}
        values={{ published: true, position: 0, status: "ONLINE" }}
        action={saveProduct.bind(null, null)}
        backHref="/admin/produits"
        submitLabel="Créer le produit"
      />
    </FormShell>
  );
}
