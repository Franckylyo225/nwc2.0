import { Drawer } from "@/components/admin/Drawer";
import { WorkForm } from "../../form";

export const dynamic = "force-dynamic";

export default function NewWorkFormDrawer() {
  return (
    <Drawer title="Nouvelle réalisation">
      <WorkForm variant="drawer" />
    </Drawer>
  );
}
