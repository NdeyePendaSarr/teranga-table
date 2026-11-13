import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToString } from "react-dom/server";
import type { ReactElement } from "react";
import AccueilPage from "./page";
import MenuPage from "./menu/page";
import AProposPage from "./a-propos/page";
import ReservationPage from "./reservation/page";
import { WhatsAppFab } from "@/components/WhatsAppFab";

/**
 * Animations des éléments présents dans le HTML serveur :
 * - aucune ne tourne en boucle infinie (une page qui bouge sans fin n'est
 *   jamais « visuellement complète », distrait la lecture, WCAG 2.2.2) ;
 * - elles n'animent que transform et opacity (propriétés composées par le
 *   GPU, sans repeindre la page ; Lighthouse « animations non composées »).
 * Les animations ajoutées côté client seulement (carte Leaflet) sont hors champ.
 */
const CSS = readFileSync(join(process.cwd(), "app", "globals.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");

function blocs(css: string, debut: RegExp): { nom: string; corps: string }[] {
  const out: { nom: string; corps: string }[] = [];
  for (const m of css.matchAll(debut)) {
    let i = m.index + m[0].length, prof = 1;
    const d = i;
    for (; i < css.length && prof > 0; i++) { if (css[i] === "{") prof++; else if (css[i] === "}") prof--; }
    out.push({ nom: m[1], corps: css.slice(d, i - 1) });
  }
  return out;
}
const KEYFRAMES = Object.fromEntries(blocs(CSS, /@keyframes\s+([\w-]+)\s*\{/g).map((b) => [b.nom, b.corps]));

/** CSS sans les blocs prefers-reduced-motion: reduce (qui coupent tout) ni les @keyframes. */
const ETAT_NORMAL = (() => {
  let s = CSS;
  for (const re of [/@keyframes\s+[\w-]+\s*\{/g, /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{/g]) {
    for (const b of blocs(s, re)) s = s.replace(b.corps, "");
  }
  return s;
})();

/** Règles CSS [sélecteur, déclarations] qui posent une animation. */
const REGLES_ANIMEES = [...ETAT_NORMAL.matchAll(/([^{}@]+)\{([^{}]*)\}/g)]
  .filter(([, , decl]) => /animation(-name)?\s*:/.test(decl) && !/animation(-name)?\s*:\s*none/.test(decl))
  .flatMap(([, sel, decl]) => sel.split(",").map((s) => [s.trim(), decl] as const));

const PAGES: (() => ReactElement | Promise<ReactElement>)[] = [
  () => AccueilPage(), () => MenuPage(), () => AProposPage(),
  () => ReservationPage({ searchParams: Promise.resolve({}) }), () => <WhatsAppFab />,
];

async function classesDuHtml(): Promise<Set<string>> {
  const html = (await Promise.all(PAGES.map(async (p) => renderToString(await p())))).join("");
  return new Set([...html.matchAll(/class="([^"]*)"/g)].flatMap((m) => m[1].split(/\s+/)).filter(Boolean));
}
const sAppliqueA = (sel: string, classes: Set<string>) => {
  if (/:hover|:focus|:active|::before|::after/.test(sel)) return false;
  const cls = [...sel.matchAll(/\.([\w-]+)/g)].map((m) => m[1]);
  return cls.length > 0 && cls.every((c) => classes.has(c));
};

describe("animations des éléments du HTML serveur", () => {
  it("le garde-fou trouve bien des règles animées (il ne passe pas à vide)", () => {
    expect(REGLES_ANIMEES.length).toBeGreaterThan(0);
    expect(Object.keys(KEYFRAMES).length).toBeGreaterThan(0);
  });

  it("aucune animation infinie", async () => {
    const classes = await classesDuHtml();
    const infinies = REGLES_ANIMEES.filter(([sel, decl]) => sAppliqueA(sel, classes) && /infinite/.test(decl)).map(([s]) => s);
    expect(infinies).toEqual([]);
  });

  it("n'animent que transform et opacity (animations composées)", async () => {
    const classes = await classesDuHtml();
    const fautes: string[] = [];
    for (const [sel, decl] of REGLES_ANIMEES.filter(([s]) => sAppliqueA(s, classes))) {
      for (const [nom, corps] of Object.entries(KEYFRAMES)) {
        if (!new RegExp(`\\b${nom}\\b`).test(decl)) continue;
        const props = [...corps.matchAll(/([\w-]+)\s*:/g)].map((m) => m[1]);
        for (const p of props) if (!["transform", "opacity"].includes(p)) fautes.push(`${sel} → @keyframes ${nom} anime ${p}`);
      }
    }
    expect([...new Set(fautes)]).toEqual([]);
  });
});
