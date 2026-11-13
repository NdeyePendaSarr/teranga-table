import { describe, it, expect } from "vitest";
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

/**
 * Polices hébergées dans le dépôt : le build ne doit plus rien télécharger
 * chez Google Fonts (cause des échecs de CI « next/font/google queries have
 * exactly one entry » quand le téléchargement échoue).
 */
const APP = join(process.cwd(), "app");
const LAYOUT = readFileSync(join(APP, "layout.tsx"), "utf8");
const chemins = [...LAYOUT.matchAll(/path:\s*"\.\/(fonts\/[^"]+)"/g)].map((m) => m[1]);

describe("polices auto-hébergées", () => {
  it("le layout n'utilise plus next/font/google", () => {
    expect(LAYOUT).not.toContain("next/font/google");
    expect(LAYOUT).toContain("next/font/local");
  });

  it("déclare Fraunces (droit et italique) et DM Sans", () => {
    expect(chemins).toEqual(expect.arrayContaining([
      "fonts/fraunces-latin.woff2", "fonts/fraunces-italic-latin.woff2", "fonts/dm-sans-latin.woff2",
    ]));
  });

  it("chaque fichier déclaré existe, est un WOFF2 valide et reste léger (< 60 kB)", () => {
    expect(chemins.length).toBeGreaterThan(0);
    for (const c of chemins) {
      const f = join(APP, c);
      expect(existsSync(f), c).toBe(true);
      expect(readFileSync(f).subarray(0, 4).toString("ascii"), c).toBe("wOF2");
      expect(statSync(f).size, c).toBeLessThan(60 * 1024);
    }
  });

  it("garde exactement les polices de secours d'avant (valeurs générées par Google Fonts)", () => {
    // Métriques relevées dans le CSS produit par next/font/google le 13/11/2026 :
    // les reprendre telles quelles évite tout décalage de mise en page (CLS)
    // pendant le remplacement de la police de secours par la vraie police.
    const css = readFileSync(join(APP, "globals.css"), "utf8").replace(/\s+/g, " ");
    expect(LAYOUT.match(/adjustFontFallback:\s*false/g)).toHaveLength(2);
    expect(LAYOUT).toContain('fallback: ["Fraunces Fallback"');
    expect(LAYOUT).toContain('fallback: ["DM Sans Fallback"');
    expect(css).toMatch(/font-family: "Fraunces Fallback"; src: local\("Times New Roman"\); ascent-override: 84\.71%; descent-override: 22\.09%; line-gap-override: 0%; size-adjust: 115\.45%;/);
    expect(css).toMatch(/font-family: "DM Sans Fallback"; src: local\("Arial"\); ascent-override: 94\.9%; descent-override: 29\.66%; line-gap-override: 0%; size-adjust: 104\.53%;/);
  });

  it("la licence SIL OFL 1.1 et les copyrights accompagnent les fichiers", () => {
    const licence = readFileSync(join(APP, "fonts", "LICENCES.md"), "utf8");
    expect(licence).toContain("SIL Open Font License");
    expect(licence).toContain("The Fraunces Project Authors");
    expect(licence).toContain("The DM Sans Project Authors");
  });
});
