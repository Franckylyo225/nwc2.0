import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { getCurrentUser } from "@/lib/auth";
import { blobToken } from "@/lib/upload";

/**
 * Délivre un jeton d'envoi au navigateur, pour qu'il dépose ses fichiers
 * directement sur Vercel Blob.
 *
 * Pourquoi ne pas simplement poster le fichier au serveur : sur Vercel, le
 * corps d'une requête vers une fonction serverless est plafonné à 4,5 Mo par
 * la plateforme, quelle que soit la configuration de Next. Une photo un peu
 * lourde est donc rejetée avec un « 413 » avant même d'atteindre le code.
 * En passant par le navigateur, le fichier ne transite plus par la fonction.
 *
 * Le jeton n'est délivré qu'à un administrateur connecté : sans ce contrôle,
 * n'importe qui pourrait déposer des fichiers dans le store.
 */
export const runtime = "nodejs";

const MAX_BYTES = 8 * 1024 * 1024; // 8 Mo
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/svg+xml"];

export async function POST(request: Request) {
  const token = blobToken();
  if (!token) {
    return Response.json(
      { error: "Stockage d'images non configuré sur cet hébergement." },
      { status: 501 },
    );
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const result = await handleUpload({
      body,
      request,
      token,
      onBeforeGenerateToken: async () => {
        const user = await getCurrentUser();
        if (!user) throw new Error("Non authentifié");

        return {
          allowedContentTypes: ALLOWED,
          maximumSizeInBytes: MAX_BYTES,
          addRandomSuffix: true,
        };
      },
      /* Rien à faire à la fin : c'est le formulaire qui enregistre l'URL,
         au moment où l'administrateur valide. */
      onUploadCompleted: async () => {},
    });

    return Response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Envoi impossible.";
    return Response.json({ error: message }, { status: 400 });
  }
}
