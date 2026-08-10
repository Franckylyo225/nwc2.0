import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/session-cookie";

/**
 * Barrière de premier niveau devant /admin.
 *
 * Le middleware s'exécute sur le runtime Edge, où Prisma n'est pas disponible :
 * on se contente ici de vérifier la *présence* du cookie, ce qui évite d'afficher
 * l'admin à un visiteur anonyme. La validation réelle de la session (existence
 * en base, expiration) est faite dans app/admin/layout.tsx, côté Node.
 */
export function middleware(request: NextRequest) {
  const hasCookie = Boolean(request.cookies.get(SESSION_COOKIE)?.value);

  if (!hasCookie) {
    const url = new URL("/admin/connexion", request.url);
    url.searchParams.set("suite", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  /* Tout /admin sauf la page de connexion elle-même. */
  matcher: ["/admin/((?!connexion).*)", "/admin"],
};
