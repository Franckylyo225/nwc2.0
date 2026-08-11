import { Drawer } from "@/components/admin/Drawer";
import { ArticleForm } from "../../form";

export const dynamic = "force-dynamic";

export default async function EditArticleFormDrawer({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Drawer title="Modifier l'article">
      <ArticleForm id={id} variant="drawer" />
    </Drawer>
  );
}
