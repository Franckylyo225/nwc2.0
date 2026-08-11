import { Drawer } from "@/components/admin/Drawer";
import { TestimonialForm } from "../../form";

export const dynamic = "force-dynamic";

export default function NewTestimonialFormDrawer() {
  return (
    <Drawer title="Nouveau témoignage">
      <TestimonialForm variant="drawer" />
    </Drawer>
  );
}
