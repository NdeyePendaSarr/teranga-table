import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToString } from "react-dom/server";
import AProposPage from "./page";

/** À propos : l'ancienne photo (terrasse sur un lac de montagne) ne pouvait pas être le restaurant de Mbour. */
describe("page À propos sans photo hors sujet", () => {
  it("n'utilise plus la photo de la terrasse sur un lac", () => {
    expect(readFileSync(join(process.cwd(), "app", "a-propos", "page.tsx"), "utf8")).not.toContain("photo-1559339352");
  });

  it("n'affiche plus de photo, et le texte occupe une colonne de lecture", () => {
    const html = renderToString(AProposPage());
    expect(html).not.toContain("<img");
    expect(html).not.toContain("about-image");
    expect(html).toContain("about-grid--texte");
  });
});
