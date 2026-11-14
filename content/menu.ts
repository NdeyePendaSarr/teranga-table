/**
 * Carte du restaurant. Les catégories sont un type fermé : ajouter un plat
 * hors de ces catégories provoque une erreur de compilation (garde-fou).
 */

export const CATEGORIES = [
  { id: "entrees", label: "Entrées" },
  { id: "plats", label: "Plats" },
  { id: "diner", label: "Dîner" },
  { id: "desserts", label: "Desserts" },
  { id: "boissons", label: "Boissons" },
] as const;

export type CategorieId = (typeof CATEGORIES)[number]["id"];

export type Plat = {
  nom: string;
  desc: string;
  prix: string;
  cat: CategorieId;
  /**
   * Photo du plat (locale dans public/plats/ de préférence). Absente quand on
   * n'a pas de photo fidèle : mieux vaut pas de photo qu'une photo d'un autre
   * plat. La carte affiche alors une carte « texte ».
   */
  img?: string;
  /** Texte alternatif de la photo, quand elle ne montre pas exactement le nom du plat. */
  imgAlt?: string;
  /** Crédit obligatoire pour une photo sous licence libre (affiché sous la carte). */
  credit?: Credit;
  /** Plat mis en avant sur l'accueil. */
  signature?: boolean;
};

export type Credit = {
  auteur: string;
  licence: "CC BY-SA 4.0";
  licenceUrl: string;
  /** Page du fichier sur Wikimedia Commons. */
  source: string;
  /** Modification apportée (exigée par CC BY-SA pour une œuvre adaptée). */
  modification?: string;
};

const CC_BY_SA_4 = { licence: "CC BY-SA 4.0", licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0/deed.fr" } as const;

export const menu: Plat[] = [
  {
    nom: "Pastels au thon",
    desc: "Beignets croustillants farcis au thon épicé, sauce maison",
    prix: "1 500 F",
    cat: "entrees",
    img: "/plats/pastels-fataya.jpg",
    imgAlt: "Fataya, chaussons frits proches des pastels",
    credit: { auteur: "Cheikh cherif", ...CC_BY_SA_4, source: "https://commons.wikimedia.org/wiki/File:Fataya.jpg", modification: "recadrée et redimensionnée" },
  },
  {
    nom: "Accras de crevettes",
    desc: "Beignets de crevettes, oignons et piment doux",
    prix: "2 000 F",
    cat: "entrees",
  },
  {
    nom: "Thiéboudienne",
    desc: "Le plat national : riz au poisson, légumes du marché, sauce tomate parfumée",
    prix: "2 500 F",
    cat: "plats",
    img: "/plats/thiebou-dieune.jpg",
    signature: true,
  },
  {
    nom: "Thiébou yapp",
    desc: "Riz à la viande mijotée, légumes, œuf et garniture fraîche",
    prix: "4 000 F",
    cat: "plats",
    img: "/plats/thiebou-yapp.jpg",
  },
  {
    nom: "Yassa poulet",
    desc: "Poulet mariné, oignons caramélisés au citron, riz blanc",
    prix: "4 000 F",
    cat: "plats",
    img: "/plats/yassa-poulet.jpg",
    signature: true,
  },
  {
    nom: "Mafé",
    desc: "Ragoût de viande à la pâte d'arachide, légumes fondants, riz",
    prix: "3 000 F",
    cat: "plats",
    img: "/plats/mafe.jpg",
    signature: true,
  },
  {
    nom: "Mbaxalou Saloum",
    desc: "Spécialité du Saloum : mil aux fruits de mer, arachide et gombo",
    prix: "3 500 F",
    cat: "plats",
    img: "/plats/mbaxalou-saloum.jpg",
  },
  {
    nom: "Poulet frites",
    desc: "Poulet grillé mariné, frites maison, sauce oignon",
    prix: "4 000 F",
    cat: "diner",
    img: "/plats/poulet-frites.jpg",
    credit: { auteur: "Mandanye", ...CC_BY_SA_4, source: "https://commons.wikimedia.org/wiki/File:Plat_de_frites_au_poulet.jpg" },
  },
  {
    nom: "Poisson braisé",
    desc: "Dorade grillée à la sénégalaise, pommes de terre sautées, sauce oignon citronnée",
    prix: "5 000 F",
    cat: "diner",
    img: "/plats/poisson-braise-dorade.jpg",
    imgAlt: "Dorade grillée à la sénégalaise, pommes de terre sautées",
    credit: { auteur: "Ourytima", ...CC_BY_SA_4, source: "https://commons.wikimedia.org/wiki/File:Dorate_grill%C3%A9_%C3%A0_la_s%C3%A9n%C3%A9galaise.jpg", modification: "recadrée et redimensionnée" },
  },
  {
    nom: "Brochettes de bœuf (dibi)",
    desc: "Viande grillée à la braise, oignons, moutarde, pain ou frites",
    prix: "4 000 F",
    cat: "diner",
    img: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80",
  },
  {
    nom: "Thiakry",
    desc: "Mil, lait caillé, raisins secs, fleur d'oranger",
    prix: "1 500 F",
    cat: "desserts",
  },
  {
    nom: "Sombi",
    desc: "Riz au lait de coco, vanille et cannelle",
    prix: "1 500 F",
    cat: "desserts",
  },
  {
    nom: "Bissap glacé",
    desc: "Jus d'hibiscus frais, légèrement sucré",
    prix: "1 000 F",
    cat: "boissons",
  },
  {
    nom: "Bouye",
    desc: "Jus de pain de singe, onctueux et vitaminé",
    prix: "1 000 F",
    cat: "boissons",
    img: "/plats/bouye.jpg",
  },
  {
    nom: "Jus de gingembre",
    desc: "Gingembre pressé, citron vert, menthe",
    prix: "1 000 F",
    cat: "boissons",
  },
];

export const signatures = menu.filter((p) => p.signature);
