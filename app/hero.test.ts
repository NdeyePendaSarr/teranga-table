import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/** Hero : l'ancienne photo de fond (Unsplash) montrait un bistrot occidental. */
describe("hero sans photo de fond", () => {
  const css = readFileSync(join(process.cwd(), "app", "globals.css"), "utf8");

  it("la photo du bistrot occidental n'est plus utilisée", () => {
    expect(css).not.toContain("photo-1414235077428");
  });

  it("le fond du hero ne charge plus aucune image", () => {
    const hero = css.match(/\n\.hero \{[\s\S]*?\n\}/)?.[0] ?? "";
    expect(hero).not.toBe("");
    expect(hero).not.toMatch(/url\(/);
  });
});
