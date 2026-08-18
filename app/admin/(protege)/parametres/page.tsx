import { CategoryManager } from "@/components/admin/CategoryManager";
import { PageHeader } from "@/components/admin/shell";
import { getArticleCategories } from "@/lib/content";
import { getSettings } from "@/lib/settings";
import { storageMode } from "@/lib/upload";
import { SettingsForm } from "./SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [settings, categories] = await Promise.all([
    getSettings(),
    getArticleCategories(),
  ]);

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Paramètres"
        description="L'ouverture du site au public et les visuels des blocs de l'accueil."
      />

      <div className="rounded-card bg-surface/40 px-6 py-7 ring-1 ring-line">
        <SettingsForm
          settings={settings}
          storage={storageMode() === "blob" ? "blob" : "server"}
        />
      </div>

      <p className="mt-6 text-sm leading-relaxed text-muted">
        L&apos;administration reste accessible en permanence, mode maintenance
        actif ou non.
      </p>

      {/* Les rubriques vivent hors du formulaire de réglages : ce sont des
          lignes qui se créent et se suppriment une à une, là où les réglages
          forment un seul enregistrement. Les imbriquer donnerait en outre un
          formulaire dans un formulaire, que le HTML n'accepte pas. */}
      <section className="mt-12">
        <h2 className="display text-2xl text-ink">Rubriques du journal</h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
          Elles classent les articles et composent le filtre de la page{" "}
          <code className="rounded bg-surface px-1.5 py-0.5">/blog</code>. Le
          slug apparaît dans l&apos;adresse du filtre : le changer casse les
          liens déjà partagés. Une rubrique ne se supprime pas tant qu&apos;elle
          classe des articles.
        </p>

        <div className="mt-6">
          <CategoryManager categories={categories} />
        </div>
      </section>
    </div>
  );
}
