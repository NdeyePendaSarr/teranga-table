import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import type { ReactElement } from "react";
import AccueilPage from "./page";
import MenuPage from "./menu/page";
import AProposPage from "./a-propos/page";
import ReservationPage from "./reservation/page";
import { Footer } from "@/components/Footer";

/**
 * Hiérarchie des titres (WCAG 1.3.1, règle axe heading-order) : un seul h1,
 * puis jamais de saut de niveau vers le bas (h1 → h3, h2 → h4…), pied de page
 * compris puisqu'il est rendu sur toutes les pages par le layout.
 */
function niveaux(html: string): number[] {
  return [...html.matchAll(/<h([1-6])[\s>]/g)].map((m) => Number(m[1]));
}

const PAGES: [string, () => ReactElement | Promise<ReactElement>][] = [
  ["accueil", () => AccueilPage()],
  ["carte", () => MenuPage()],
  ["à propos", () => AProposPage()],
  ["réservation", () => ReservationPage({ searchParams: Promise.resolve({}) })],
];

describe("ordre des titres, pied de page compris", () => {
  it("le garde-fou détecte un saut de niveau", () => {
    expect(niveaux("<h1>a</h1><h3>b</h3>")).toEqual([1, 3]);
  });

  for (const [nom, page] of PAGES) {
    it(`${nom} : un seul h1, puis aucun saut de niveau`, async () => {
      const html = renderToString(<>{await page()}<Footer /></>);
      const n = niveaux(html);
      expect(n.filter((x) => x === 1), `h1 sur ${nom}`).toHaveLength(1);
      expect(n[0]).toBe(1);
      const sauts = n.slice(1).map((x, i) => [n[i], x]).filter(([avant, apres]) => apres > avant + 1);
      expect(sauts, `sauts de niveau sur ${nom} : ${n.join(" ")}`).toEqual([]);
    });
  }
});
