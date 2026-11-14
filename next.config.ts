import type { NextConfig } from "next";

/** Ancienne adresse Vercel du projet (dépôt renommé « restaurant-template » → « teranga-table »). */
const ANCIENNE_ADRESSE = "restaurant-template-five-pi.vercel.app";
const ADRESSE_ACTUELLE = "https://teranga-table.vercel.app";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        // L'ancienne adresse servait le même site sans redirection : contenu en
        // double pour les moteurs de recherche et « template » visible dans
        // l'URL. Redirection définitive (308), chemin et paramètres conservés.
        source: "/:path*",
        has: [{ type: "host", value: ANCIENNE_ADRESSE }],
        destination: `${ADRESSE_ACTUELLE}/:path*`,
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
