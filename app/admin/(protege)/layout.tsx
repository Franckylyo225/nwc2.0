import Link from "next/link";
import { redirect } from "next/navigation";
import { ADMIN_SECTIONS } from "@/components/admin/shell";
import { getCurrentUser } from "@/lib/auth";
import { isDatabaseConfigured } from "@/lib/db";
import { logout } from "../actions";

/* La session doit être relue à chaque requête. */
export const dynamic = "force-dynamic";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isDatabaseConfigured()) {
    return <SetupNotice />;
  }

  /* Validation réelle de la session : le middleware n'a vu que le cookie. */
  const user = await getCurrentUser();
  if (!user) redirect("/admin/connexion");

  return (
    <div className="lg:grid lg:min-h-dvh lg:grid-cols-[16rem_1fr]">
      <aside className="border-b border-line bg-white lg:sticky lg:top-0 lg:h-dvh lg:border-b-0 lg:border-r">
        <div className="flex h-full flex-col gap-8 p-6">
          <Link href="/admin" className="flex flex-col">
            <span className="display text-xl text-ink">New Wave</span>
            <span className="text-[0.65rem] uppercase tracking-[0.2em] text-muted">
              Administration
            </span>
          </Link>

          <nav className="flex-1">
            <ul className="flex flex-wrap gap-1 lg:flex-col">
              {ADMIN_SECTIONS.map((section) => (
                <li key={section.href}>
                  <Link
                    href={section.href}
                    className="block rounded-xl px-3 py-2 text-sm text-muted transition-colors hover:bg-surface hover:text-ink"
                  >
                    {section.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex flex-col gap-3 border-t border-line pt-5">
            <Link
              href="/"
              target="_blank"
              className="text-sm text-muted transition-colors hover:text-accent"
            >
              Voir le site ↗
            </Link>
            <p className="truncate text-xs text-muted" title={user.email}>
              {user.name ?? user.email}
            </p>
            <form action={logout}>
              <button
                type="submit"
                className="text-left text-sm text-muted transition-colors hover:text-accent"
              >
                Se déconnecter
              </button>
            </form>
          </div>
        </div>
      </aside>

      <main className="px-6 py-10 lg:px-10 lg:py-12">{children}</main>
    </div>
  );
}

/** Écran affiché tant que la base n'est pas branchée. */
function SetupNotice() {
  return (
    <div className="grid min-h-dvh place-items-center px-6">
      <div className="max-w-lg rounded-card bg-white p-8 ring-1 ring-line">
        <h1 className="display text-3xl text-ink">Base de données à configurer</h1>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          L&apos;administration a besoin d&apos;une base Postgres. Le site public,
          lui, fonctionne déjà : il affiche les contenus statiques de{" "}
          <code className="rounded bg-surface px-1.5 py-0.5">content/site.ts</code>{" "}
          en attendant.
        </p>
        <ol className="mt-6 flex list-decimal flex-col gap-2 pl-5 text-sm text-ink-soft">
          <li>
            Crée une base Postgres sur <strong>neon.com</strong> (offre gratuite).
          </li>
          <li>
            Copie <code className="rounded bg-surface px-1.5 py-0.5">.env.example</code>{" "}
            vers <code className="rounded bg-surface px-1.5 py-0.5">.env</code> et
            renseigne <code>DATABASE_URL</code>.
          </li>
          <li>
            Lance{" "}
            <code className="rounded bg-surface px-1.5 py-0.5">npm run db:deploy</code>{" "}
            puis <code className="rounded bg-surface px-1.5 py-0.5">npm run db:seed</code>.
          </li>
          <li>Redémarre le serveur.</li>
        </ol>
      </div>
    </div>
  );
}
