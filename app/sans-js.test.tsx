import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToString } from "react-dom/server";
import type { ReactElement } from "react";
import AccueilPage from "./page";
import MenuPage from "./menu/page";
import AProposPage from "./a-propos/page";
import ReservationPage from "./reservation/page";

/**
 * Garde-fou « contenu visible sans JavaScript » : le HTML rendu par le serveur
 * ne doit contenir aucun bloc qui démarre à opacity 0, ni par un style en
 * ligne, ni par une règle CSS de globals.css qui s'applique à l'état initial.
 * Sinon, tant que le JS n'a pas tourné (3G lente, JS bloqué ou en erreur),
 * le contenu existe mais reste invisible.
 */

const CSS = readFileSync(join(process.cwd(), "app", "globals.css"), "utf8");

/** Retire les blocs @keyframes et @media (prefers-reduced-motion) (accolades équilibrées). */
function sansBlocs(css: string, debut: RegExp): string {
  let out = css;
  for (let m = debut.exec(out); m; m = debut.exec(out)) {
    let i = out.indexOf("{", m.index);
    let prof = 0;
    for (; i < out.length; i++) {
      if (out[i] === "{") prof++;
      else if (out[i] === "}" && --prof === 0) break;
    }
    out = out.slice(0, m.index) + out.slice(i + 1);
    debut.lastIndex = 0;
  }
  return out;
}

const OPACITE_ZERO = /(^|;|\s|\{)opacity\s*:\s*0\s*(;|$|!|\})/;

/** Animations dont la première étape (from / 0%) est à opacity 0. */
function animationsDepuisZero(css: string): string[] {
  const noms: string[] = [];
  for (const m of css.matchAll(/@keyframes\s+([\w-]+)\s*\{/g)) {
    let i = m.index + m[0].length, prof = 1;
    const debut = i;
    for (; i < css.length && prof > 0; i++) { if (css[i] === "{") prof++; else if (css[i] === "}") prof--; }
    const premiere = css.slice(debut, i).match(/(from|0%)[^{]*\{([^}]*)\}/);
    if (premiere && OPACITE_ZERO.test(premiere[2])) noms.push(m[1]);
  }
  return noms;
}

/**
 * Sélecteurs (état initial) qui cachent l'élément : déclaration `opacity: 0`,
 * ou animation dont la première étape est à opacity 0.
 */
function selecteursOpaciteZero(): string[] {
  const sansCommentaires = CSS.replace(/\/\*[\s\S]*?\*\//g, "");
  const zero = animationsDepuisZero(sansCommentaires);
  const css = sansBlocs(sansBlocs(sansCommentaires, /@keyframes\s+[\w-]+\s*/g),
    /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*/g);
  const out: string[] = [];
  for (const [, sel, decl] of css.matchAll(/([^{}@]+)\{([^{}]*)\}/g)) {
    const cache = OPACITE_ZERO.test(decl.trim()) ||
      zero.some((nom) => new RegExp(`animation(-name)?\\s*:[^;]*\\b${nom}\\b`).test(decl));
    if (!cache) continue;
    for (const s of sel.split(",").map((x) => x.trim()).filter(Boolean)) {
      // un état déclenché par l'utilisateur n'est pas l'état initial
      if (/:hover|:focus|:active|\[aria-expanded="true"\]|\.is-|::before|::after/.test(s)) continue;
      out.push(s);
    }
  }
  return out;
}

const classesDuHtml = (html: string) =>
  new Set([...html.matchAll(/class="([^"]*)"/g)].flatMap((m) => m[1].split(/\s+/)).filter(Boolean));

async function html(page: () => ReactElement | Promise<ReactElement>): Promise<string> {
  return renderToString(await page());
}

const PAGES: [string, () => ReactElement | Promise<ReactElement>][] = [
  ["accueil", () => AccueilPage()],
  ["carte", () => MenuPage()],
  ["à propos", () => AProposPage()],
  ["réservation", () => ReservationPage({ searchParams: Promise.resolve({}) })],
];

describe("contenu visible sans JavaScript", () => {
  it("le garde-fou détecte bien opacity: 0 et les animations qui partent de 0 (il ne passe pas à vide)", () => {
    const faux = sansBlocs("@keyframes a { from { opacity: 0 } } .x { opacity: 0; }", /@keyframes\s+[\w-]+\s*/g);
    expect(faux).toContain(".x { opacity: 0; }");
    expect(faux).not.toContain("from");
    expect(animationsDepuisZero("@keyframes a { from { opacity: 0; } to { opacity: 1; } } @keyframes b { from { transform: none } }"))
      .toEqual(["a"]);
  });

  for (const [nom, page] of PAGES) {
    it(`${nom} : aucun bloc ne démarre à opacity 0 dans le HTML serveur`, async () => {
      const h = await html(page);
      expect(h, "style en ligne opacity:0").not.toMatch(/style="[^"]*opacity:\s*0(;|")/);
      const classes = classesDuHtml(h);
      const fautifs = selecteursOpaciteZero().filter((s) => {
        const cls = [...s.matchAll(/\.([\w-]+)/g)].map((m) => m[1]);
        return cls.length > 0 && cls.every((c) => classes.has(c));
      });
      expect(fautifs, `règles CSS qui cachent du contenu au départ sur la page ${nom}`).toEqual([]);
    });
  }
});
