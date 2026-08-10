import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { isDatabaseConfigured } from "@/lib/db";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ suite?: string }>;
}) {
  /* Déjà connecté : inutile de repasser par le formulaire. */
  if (isDatabaseConfigured() && (await getCurrentUser())) {
    redirect("/admin");
  }

  const { suite } = await searchParams;

  return (
    <div className="grid min-h-dvh place-items-center px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="display block text-3xl text-ink">New Wave</span>
          <span className="text-[0.65rem] uppercase tracking-[0.2em] text-muted">
            Administration
          </span>
        </div>

        <div className="rounded-card bg-white p-7 ring-1 ring-line">
          <LoginForm next={suite} />
        </div>

        <p className="mt-6 text-center text-xs text-muted">
          Accès réservé. Toute tentative est enregistrée côté serveur.
        </p>
      </div>
    </div>
  );
}
