import { describe, it, expect } from "vitest";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { renderToString } from "react-dom/server";
import { menu } from "@/content/menu";
import { imagePlat, TAILLES_CARTE } from "@/lib/imagePlat";
import AccueilPage from "@/app/page";
import MenuPage from "@/app/menu/page";

/**
 * Cartes de plats : les photos s'affichent à ~370 px de large au plus. On sert
 * des WebP de 400 et 800 px (écrans haute densité), le navigateur choisissant
 * selon la largeur réelle de la carte. Les JPEG d'origine ont été retirés.
 */
const PUBLIC = join(process.cwd(), "public");
const locales = menu.filter((p) => p.img?.startsWith("/plats/")).map((p) => p.img!);

describe("photos des cartes : versions WebP adaptées à la taille affichée", () => {
  it("chaque photo locale a ses versions 400 et 800 px en WebP, légères", () => {
    expect(locales.length).toBeGreaterThan(0);
    for (const img of locales) {
      expect(img, "le menu pointe vers la version 800 px").toMatch(/^\/plats\/[\w-]+-800\.webp$/);
      for (const [largeur, max] of [[400, 40], [800, 120]] as const) {
        const fichier = join(PUBLIC, img.replace(/-800\.webp$/, `-${largeur}.webp`));
        expect(existsSync(fichier), fichier).toBe(true);
        expect(readFileSync(fichier).subarray(8, 12).toString("ascii"), fichier).toBe("WEBP");
        expect(statSync(fichier).size, fichier).toBeLessThan(max * 1024);
      }
    }
  });

  it("plus aucun JPEG inutilisé dans public/plats/", () => {
    expect(readdirSync(join(PUBLIC, "plats")).filter((f) => /\.jpe?g$/i.test(f))).toEqual([]);
  });

  it("imagePlat donne la version 800 par défaut et les deux largeurs au navigateur", () => {
    expect(imagePlat("/plats/mafe-800.webp")).toEqual({
      src: "/plats/mafe-800.webp",
      srcSet: "/plats/mafe-400.webp 400w, /plats/mafe-800.webp 800w",
    });
  });

  it("la photo Unsplash restante passe aussi en deux largeurs, via ses paramètres d'URL", () => {
    const { src, srcSet } = imagePlat("https://images.unsplash.com/photo-1?auto=format&fit=crop&w=800&q=80");
    expect(src).toContain("w=800");
    expect(srcSet).toMatch(/w=400[^,]* 400w, .*w=800[^,]* 800w$/);
  });

  it("les tailles annoncées suivent la grille (1, 2 puis 3 colonnes, 1120 px au plus)", () => {
    expect(TAILLES_CARTE).toMatch(/min-width: 900px/);
    expect(TAILLES_CARTE).toMatch(/min-width: 640px/);
  });

  for (const [nom, page] of [["accueil", () => AccueilPage()], ["carte", () => MenuPage()]] as const) {
    it(`page ${nom} : chaque carte sert les WebP avec srcSet et sizes, plus aucun JPEG`, () => {
      const imgs = renderToString(page()).match(/<img class="card-img"[^>]*>/g) ?? [];
      expect(imgs.length).toBeGreaterThan(0);
      for (const img of imgs) {
        expect(img).toMatch(/srcSet="[^"]*400w, [^"]*800w"/);
        expect(img).toMatch(/sizes="[^"]+"/);
        expect(img).not.toMatch(/src="[^"]*\.jpg"/);
        expect(img).toMatch(/loading="lazy"/);
      }
    });
  }
});
