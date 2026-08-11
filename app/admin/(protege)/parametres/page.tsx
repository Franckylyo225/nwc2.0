import { PageHeader } from "@/components/admin/shell";
import { getSettings } from "@/lib/settings";
import { storageMode } from "@/lib/upload";
import { SettingsForm } from "./SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await getSettings();

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Paramètres"
        description="L'ouverture du site au public, et ce que voient les visiteurs quand il est fermé."
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
    </div>
  );
}
