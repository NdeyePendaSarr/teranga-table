import { describe, it, expect } from "vitest";
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { site } from "@/content/site";

const APP = join(process.cwd(), "app");
const lire = (f: string) => readFileSync(join(APP, f));
/** Largeur × hauteur d'un JPEG (segment SOF0/SOF2). */
const tailleJpeg = (b: Buffer) => {
  expect(b.readUInt16BE(0)).toBe(0xffd8);
  for (let i = 2; i < b.length; ) {
    const marqueur = b.readUInt16BE(i), longueur = b.readUInt16BE(i + 2);
    if (marqueur === 0xffc0 || marqueur === 0xffc2) return [b.readUInt16BE(i + 7), b.readUInt16BE(i + 5)];
    i += 2 + longueur;
  }
  throw new Error("dimensions JPEG introuvables");
};

describe("image de partage (Open Graph)", () => {
  // JPEG : le dégradé de fond pèse 318 kB en PNG ; WhatsApp ignore souvent
  // l'aperçu au-delà d'environ 300 kB. Déclarée dans les métadonnées du layout
  // (et non par app/opengraph-image.jpg) : Turbopack ignore les fichiers
  // .alt.txt, donc le texte alternatif n'était pas publié.
  const layout = lire("layout.tsx").toString();
  const IMAGE = "/og-teranga-table.jpg";

  it("1200 × 630, moins de 300 kB", () => {
    const f = join(process.cwd(), "public", IMAGE);
    expect(tailleJpeg(readFileSync(f))).toEqual([1200, 630]);
    expect(statSync(f).size).toBeLessThan(300 * 1024);
  });

  it("déclarée pour Open Graph et X/Twitter, avec dimensions et texte alternatif en français", () => {
    expect(layout.match(/images:\s*\[IMAGE_PARTAGE\]/g)).toHaveLength(2);
    expect(layout).toContain(`url: "${IMAGE}"`);
    expect(layout).toMatch(/width:\s*1200/);
    expect(layout).toMatch(/height:\s*630/);
    const alt = layout.match(/alt:\s*"([^"]+)"/)?.[1] ?? "";
    expect(alt).toContain(site.nom);
    expect(alt.length).toBeGreaterThan(20);
  });

  it("plus de fichiers opengraph-image / twitter-image dans app/ (pas de doublon)", () => {
    for (const f of ["opengraph-image.jpg", "twitter-image.jpg", "opengraph-image.png", "twitter-image.png", "opengraph-image.alt.txt", "twitter-image.alt.txt"]) {
      expect(existsSync(join(APP, f)), f).toBe(false);
    }
  });
});
