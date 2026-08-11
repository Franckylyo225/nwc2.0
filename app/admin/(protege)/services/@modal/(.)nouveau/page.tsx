import { Drawer } from "@/components/admin/Drawer";
import { ServiceForm } from "../../form";

export const dynamic = "force-dynamic";

export default function NewServiceFormDrawer() {
  return (
    <Drawer title="Nouveau service">
      <ServiceForm variant="drawer" />
    </Drawer>
  );
}
