import { FormShell } from "@/components/admin/shell";
import { ArticleForm } from "../form";

export const dynamic = "force-dynamic";

export default async function EditArticleFormPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <FormShell title="Modifier l'article">
      <ArticleForm id={id} />
    </FormShell>
  );
}
