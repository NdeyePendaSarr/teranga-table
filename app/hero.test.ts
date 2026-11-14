import { describe, it, expect } from "vitest";
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { renderToString } from "react-dom/server";
import AccueilPage from "./page";

/**
 * Hero : photo de fond des piments du marché de Notto Gouye Diama (Sénégal,
 * Wikimedia Commons, CC BY-SA 4.0), sous un voile vert sombre. Elle illustre
 * les produits locaux sans se faire passer pour la salle du restaurant, qui
 * est fictif. L'ancienne photo (Unsplash) montrait un bistrot occidental.
 */
const css = readFileSync(join(process.cwd(), "app", "globals.css"), "utf8");
const html = renderToString(AccueilPage());
const hero = html.match(/<section class="hero"[\s\S]*?<\/section>/)?.[0] ?? "";

function luminance([r, g, b]: number[]): number {
  const [R, G, B] = [r, g, b].map((v) => v / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}
const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const contraste = (a: number[], b: number[]) => {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

describe("hero : photo de fond des piments du marché", () => {
  it("la photo du bistrot occidental n'est plus utilisée", () => {
    expect(css).not.toContain("photo-1414235077428");
  });

  it("toutes les versions de la photo sont locales, en WebP, et légères (< 200 ko)", () => {
    const srcs = [...hero.matchAll(/(?:src|srcSet|srcset)="([^"]*)"/g)]
      .flatMap((m) => m[1].split(",").map((s) => s.trim().split(/\s+/)[0]));
    expect(srcs.length).toBeGreaterThanOrEqual(3);
    for (const src of new Set(srcs)) {
      expect(src).toMatch(/^\/hero\/piments-[\w-]+\.webp$/);
      const fichier = join(process.cwd(), "public", src);
      expect(existsSync(fichier), src).toBe(true);
      expect(readFileSync(fichier).subarray(8, 12).toString("ascii"), src).toBe("WEBP");
      expect(statSync(fichier).size, src).toBeLessThan(200 * 1024);
    }
  });

  it("une version portrait pour les mobiles, des largeurs adaptées pour les autres écrans", () => {
    expect(hero).toMatch(/<source[^>]*media="[^"]*portrait[^"]*"/);
    expect(hero).toMatch(/<img[^>]*srcSet="[^"]*\d+w[^"]*,[^"]*\d+w/i);
    expect(hero).toMatch(/<img[^>]*sizes="100vw"/);
  });

  it("image décorative chargée en priorité : alt vide (ignorée des lecteurs d'écran), jamais en lazy", () => {
    const img = hero.match(/<img[^>]*>/)?.[0] ?? "";
    expect(img).toMatch(/alt=""/);
    expect(img).toMatch(/fetchPriority="high"/i);
    expect(img).not.toMatch(/loading="lazy"/);
    expect(img).toMatch(/width="\d+"[^>]*height="\d+"/);
  });

  it("le crédit est visible dans le hero : auteur, lieu, licence et source", () => {
    const credit = hero.match(/<p class="hero-credit"[\s\S]*?<\/p>/)?.[0] ?? "";
    expect(credit).toContain("Thiam Babel Design");
    expect(credit).toMatch(/Notto Gouye Diama/);
    expect(credit).toContain(
      'href="https://commons.wikimedia.org/wiki/File:Des_cassettes_de_piments_et_de_poivrons_sur_une_table_au_march%C3%A9_de_Notto_Gouy_Diama.jpg"'
    );
    expect(credit).toContain('href="https://creativecommons.org/licenses/by-sa/4.0/deed.fr"');
    expect(credit).toMatch(/recadrée/);
  });

  it("le voile garde le texte lisible même sur la zone la plus claire de la photo (4,5:1)", () => {
    const voile = css.match(/\.hero::before \{[\s\S]*?\n\}/)?.[0] ?? "";
    const rgba = (txt: string) => [...txt.matchAll(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/g)]
      .map((m) => ({ rgb: [+m[1], +m[2], +m[3]], a: +m[4] }));
    // En CSS, la dernière couche de fond est la plus basse : le dégradé linéaire
    // (voile vert) est posé sur la photo, le halo ambre par-dessus.
    const [halo, ...voiles] = voile.split(/\n\s*linear-gradient/).map(rgba);
    expect(voiles.flat().length).toBeGreaterThanOrEqual(2);
    const poser = (fond: number[], { rgb, a }: { rgb: number[]; a: number }) => rgb.map((c, i) => a * c + (1 - a) * fond[i]);
    // Pire cas : pixel blanc sous l'arrêt le plus transparent du voile, halo à pleine intensité.
    for (const arret of voiles.flat()) {
      const fond = halo.reduce(poser, poser([255, 255, 255], arret));
      for (const texte of ["#fdf8ef", "#fcd34d"]) {
        expect(contraste(hex(texte), fond), `${texte} sur voile ${arret.a}`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });
});
