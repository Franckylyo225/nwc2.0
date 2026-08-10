import { saveArticle } from "@/app/admin/actions";
import { ResourceForm } from "@/components/admin/ResourceForm";
import { FormShell } from "@/components/admin/shell";
import { articleFields } from "../../fields";

export default function NewArticlePage() {
  return (
    <FormShell title="Nouvel article">
      <ResourceForm
        fields={articleFields}
        values={{
          category: "NEWS",
          published: false,
          publishedAt: new Date().toISOString().slice(0, 10),
        }}
        action={saveArticle.bind(null, null)}
        backHref="/admin/articles"
        submitLabel="Créer l'article"
      />
    </FormShell>
  );
}
