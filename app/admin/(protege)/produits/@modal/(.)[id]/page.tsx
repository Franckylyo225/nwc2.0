import { Drawer } from "@/components/admin/Drawer";
import { ProductForm } from "../../form";

export const dynamic = "force-dynamic";

export default async function EditProductFormDrawer({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Drawer title="Modifier le projet maison">
      <ProductForm id={id} variant="drawer" />
    </Drawer>
  );
}
