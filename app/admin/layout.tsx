import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Administration",
  /* L'admin ne doit jamais finir dans un index de moteur de recherche. */
  robots: { index: false, follow: false },
};

/**
 * Enveloppe commune à tout /admin, y compris la page de connexion.
 * L'authentification et le menu vivent dans (protege)/layout.tsx : ce groupe
 * de routes couvre toutes les pages sauf la connexion, sans changer les URL.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh bg-surface/40">{children}</div>;
}
