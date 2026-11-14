/**
 * Photos des cartes de plats. Les cartes font ~370 px de large au plus : on
 * sert des WebP de 400 et 800 px (écrans haute densité) plutôt que les JPEG
 * d'origine de 800 px, qui restent dans public/plats/ comme fichiers sources.
 */
export function imagePlat(img: string): { src: string; srcSet: string } {
  if (img.startsWith("/plats/") && img.endsWith(".jpg")) {
    const base = img.slice(0, -".jpg".length);
    return { src: `${base}-800.webp`, srcSet: `${base}-400.webp 400w, ${base}-800.webp 800w` };
  }
  // Photo distante (Unsplash) : la largeur se règle par le paramètre w de l'URL.
  const largeur = (w: number) => (/[?&]w=\d+/.test(img) ? img.replace(/([?&])w=\d+/, `$1w=${w}`) : img);
  return { src: largeur(800), srcSet: `${largeur(400)} 400w, ${largeur(800)} 800w` };
}

/** Largeur affichée des cartes selon la grille .grid-3 (1, 2 puis 3 colonnes, conteneur de 1120 px au plus). */
export const TAILLES_CARTE =
  "(min-width: 1160px) 357px, (min-width: 900px) calc((100vw - 5.5rem) / 3), (min-width: 640px) calc((100vw - 4rem) / 2), calc(100vw - 2.5rem)";
