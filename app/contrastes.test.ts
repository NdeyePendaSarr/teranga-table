import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

/**
 * Contrastes WCAG 2.1 AA (critère 1.4.3) des couleurs de texte du design system.
 * Texte courant : 4,5:1 minimum. Grand texte (24 px, ou 18,66 px en gras) : 3:1.
 */
const RACINE = process.cwd();
const CSS = readFileSync(join(RACINE, "app", "globals.css"), "utf8");

function jeton(nom: string): string {
  const m = CSS.match(new RegExp(`--${nom}:\\s*(#[0-9a-fA-F]{6})`));
  if (!m) throw new Error(`jeton --${nom} introuvable dans globals.css`);
  return m[1].toLowerCase();
}
function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
export function contraste(a: string, b: string): number {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

// Fonds clairs sur lesquels ces couleurs de texte apparaissent.
const FONDS = {
  crème: () => jeton("cream"),
  "crème foncé": () => jeton("cream-dark"),
  blanc: () => "#ffffff",
  "or pâle (menu mobile actif)": () => jeton("gold-pale"),
  "en-tête translucide (mesuré par axe)": () => "#faf6f1",
};

describe("contrastes du texte (WCAG AA, 4,5:1)", () => {
  it("le calcul de contraste est juste (noir/blanc = 21:1, gris #767676/blanc ≈ 4,54:1)", () => {
    expect(contraste("#000000", "#ffffff")).toBeCloseTo(21, 1);
    expect(contraste("#767676", "#ffffff")).toBeCloseTo(4.54, 2);
  });

  for (const texte of ["muted", "gold-text", "ink-soft", "ink"]) {
    for (const [fond, couleur] of Object.entries(FONDS)) {
      it(`--${texte} sur ${fond} ≥ 4,5:1`, () => {
        const r = contraste(jeton(texte), couleur());
        expect(r, `--${texte} ${jeton(texte)} sur ${couleur()} = ${r.toFixed(2)}:1`).toBeGreaterThanOrEqual(4.5);
      });
    }
  }

  it("le logo, seul texte en --gold, est un grand texte (≥ 3:1 sur crème)", () => {
    expect(contraste(jeton("gold"), jeton("cream"))).toBeGreaterThanOrEqual(3);
  });
});

describe("--gold est réservé aux fonds, bordures et grand texte", () => {
  const fichiers = [join(RACINE, "app", "globals.css"),
    ...["app", "components"].flatMap((d) => lister(join(RACINE, d))).filter((f) => /\.tsx$/.test(f) && !/\.test\./.test(f))];

  function lister(dossier: string): string[] {
    return readdirSync(dossier, { withFileTypes: true }).flatMap((e) =>
      e.isDirectory() ? lister(join(dossier, e.name)) : [join(dossier, e.name)]);
  }

  it("aucun texte courant n'utilise color: var(--gold) (sauf le logo)", () => {
    const fautes: string[] = [];
    for (const f of fichiers) {
      readFileSync(f, "utf8").split("\n").forEach((ligne, i) => {
        if (/(^|[^-\w])color:\s*"?var\(--gold\)/.test(ligne) && !/^\s*\.logo span/.test(ligne)) {
          fautes.push(`${f.slice(RACINE.length + 1)}:${i + 1}  ${ligne.trim()}`);
        }
      });
    }
    expect(fautes, "utiliser var(--gold-text) pour du texte").toEqual([]);
  });
});
