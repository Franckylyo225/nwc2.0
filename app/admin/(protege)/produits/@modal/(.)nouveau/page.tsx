import { Drawer } from "@/components/admin/Drawer";
import { ProductForm } from "../../form";

export const dynamic = "force-dynamic";

export default function NewProductFormDrawer() {
  return (
    <Drawer title="Nouveau projet maison">
      <ProductForm variant="drawer" />
    </Drawer>
  );
}
