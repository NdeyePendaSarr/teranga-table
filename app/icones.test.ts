import { describe, it, expect } from "vitest";
import { createHash } from "node:crypto";
import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const APP = join(process.cwd(), "app");
const lire = (f: string) => readFileSync(join(APP, f));
/** Largeur × hauteur d'un PNG (bloc IHDR). */
const taillePng = (b: Buffer) => {
  expect(b.subarray(1, 4).toString("ascii")).toBe("PNG");
  return [b.readUInt32BE(16), b.readUInt32BE(20)];
};

describe("favicon et icônes", () => {
  it("le favicon n'est plus celui de create-next-app (triangle Vercel)", () => {
    const ico = lire("favicon.ico");
    expect(createHash("sha1").update(ico).digest("hex")).not.toBe("9ecfcc8f0ead0bf3d2d7c39e084b88f41cc89a2e");
    // en-tête ICO : réservé 0, type 1 (icône), au moins une image
    expect(ico.readUInt16LE(0)).toBe(0);
    expect(ico.readUInt16LE(2)).toBe(1);
    expect(ico.readUInt16LE(4)).toBeGreaterThan(0);
  });

  it("fournit une icône 192 px (Android) et une icône Apple 180 px, légères", () => {
    // 192 px suffit ; la version 512 px pesait 136 kB, trop pour une icône
    // téléchargée par le navigateur sur un téléphone en 3G.
    expect(taillePng(lire("icon.png"))).toEqual([192, 192]);
    expect(taillePng(lire("apple-icon.png"))).toEqual([180, 180]);
    for (const f of ["icon.png", "apple-icon.png", "favicon.ico"]) expect(statSync(join(APP, f)).size, f).toBeLessThan(40 * 1024);
  });

  it("le layout ne déclare plus l'icône émoji en data URI (les fichiers app/ suffisent)", () => {
    const layout = lire("layout.tsx").toString();
    expect(layout).not.toContain("data:image/svg+xml");
    expect(layout).not.toMatch(/icons:\s*\{/);
  });
});
