import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      /**
       * Les Server Actions plafonnent le corps des requêtes à 1 Mo par défaut,
       * ce qui rejette la plupart des photos avant même d'atteindre notre code.
       * 6 Mo laisse passer confortablement une image de 4 Mo plus le reste du
       * formulaire (voir MAX_BYTES dans lib/upload.ts).
       */
      bodySizeLimit: "6mb",
    },
  },

  images: {
    /**
     * Les images envoyées depuis l'administration sont servies par Vercel Blob.
     * next/image refuse tout domaine distant non déclaré.
     */
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],

    /**
     * Échappatoire réservée au développement local.
     *
     * Sur un réseau NAT64 (fréquent chez certains opérateurs, et sur les réseaux
     * IPv6 seuls), un hôte public comme `…blob.vercel-storage.com` résout en
     * IPv6 mappé `64:ff9b::/96`. L'optimiseur d'images la prend pour une adresse
     * privée et bloque la requête au nom de la protection anti-SSRF — alors que
     * l'adresse encapsulée est bien publique.
     *
     * La protection reste active par défaut, donc en production. Pour la lever
     * sur une machine concernée : ALLOW_LOCAL_IP_IMAGES=true dans .env.
     */
    dangerouslyAllowLocalIP: process.env.ALLOW_LOCAL_IP_IMAGES === "true",
  },
};

export default nextConfig;
