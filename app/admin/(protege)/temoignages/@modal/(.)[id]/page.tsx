import { Drawer } from "@/components/admin/Drawer";
import { TestimonialForm } from "../../form";

export const dynamic = "force-dynamic";

export default async function EditTestimonialFormDrawer({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Drawer title="Modifier le témoignage">
      <TestimonialForm id={id} variant="drawer" />
    </Drawer>
  );
}
