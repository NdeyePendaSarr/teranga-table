/**
 * Configuration du restaurant — source unique de vérité pour l'identité,
 * le contact, les horaires et la localisation. Typée et réutilisable côté
 * serveur comme client.
 */

export type Horaire = { jour: string; heures: string };

export const site = {
  nom: "Teranga Table",
  slogan: "La cuisine sénégalaise, revisitée",
  description:
    "Restaurant sénégalais moderne à Mbour. Produits locaux, recettes traditionnelles, service attentionné.",
   email: "contact@teranga-table.sn",
  telephone: "+221 77 000 00 00", // numéro fictif (projet de démonstration)
  whatsapp: "221770000000",
   adresse: "Darou Salam, Mbour",
   adresseDetail: "Darou Salam, Mbour — Thiès, Sénégal",

  // Localisation (carte OpenStreetMap)
   lat: 14.42,
  lng: -16.965,

  horaires: [
    { jour: "Lundi – Jeudi", heures: "12h – 15h · 19h – 23h" },
    { jour: "Vendredi – Samedi", heures: "12h – 15h · 19h – 00h" },
    { jour: "Dimanche", heures: "12h – 16h" },
  ] as Horaire[],

  instagram: "https://instagram.com/",
  facebook: "https://facebook.com/",
  tiktok: "",

  url: "https://teranga-table.vercel.app",
} as const;

/** Lien WhatsApp prérempli pour une demande de réservation. */
export function lienWhatsApp(message?: string): string {
  const msg = encodeURIComponent(
    message ?? `Bonjour, je souhaite réserver une table chez ${site.nom}.`
  );
  return `https://wa.me/${site.whatsapp}?text=${msg}`;
}
