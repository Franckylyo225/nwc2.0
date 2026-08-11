import { FormShell } from "@/components/admin/shell";
import { ArticleForm } from "../form";

export const dynamic = "force-dynamic";

export default function NewArticleFormPage() {
  return (
    <FormShell title="Nouvel article">
      <ArticleForm />
    </FormShell>
  );
}
