import { Drawer } from "@/components/admin/Drawer";
import { ArticleForm } from "../../form";

export const dynamic = "force-dynamic";

export default function NewArticleFormDrawer() {
  return (
    <Drawer title="Nouvel article">
      <ArticleForm variant="drawer" />
    </Drawer>
  );
}
