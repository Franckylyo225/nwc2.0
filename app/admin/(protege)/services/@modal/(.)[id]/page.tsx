import { Drawer } from "@/components/admin/Drawer";
import { ServiceForm } from "../../form";

export const dynamic = "force-dynamic";

export default async function EditServiceFormDrawer({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Drawer title="Modifier le service">
      <ServiceForm id={id} variant="drawer" />
    </Drawer>
  );
}
