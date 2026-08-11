import { Drawer } from "@/components/admin/Drawer";
import { WorkForm } from "../../form";

export const dynamic = "force-dynamic";

export default async function EditWorkFormDrawer({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Drawer title="Modifier la réalisation">
      <WorkForm id={id} variant="drawer" />
    </Drawer>
  );
}
