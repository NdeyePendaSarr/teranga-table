import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { renderToString } from "react-dom/server";

const APP = join(process.cwd(), "app");

describe("page 404", () => {
  it("existe, en français, dans le style du site, avec des liens utiles", async () => {
    expect(existsSync(join(APP, "not-found.tsx"))).toBe(true);
    const { default: NotFound } = await import("./not-found");
    const html = renderToString(<NotFound />);
    expect(html).toContain("Page introuvable");
    expect(html).not.toMatch(/could not be found/i);
    expect([...html.matchAll(/<h1[\s>]/g)]).toHaveLength(1);
    for (const lien of ['href="/"', 'href="/menu"', 'href="/reservation"']) expect(html).toContain(lien);
    expect(html).toContain("page-top"); // même en-tête de page que les autres pages
  });

  it("a un titre d'onglet en français", async () => {
    const { metadata } = await import("./not-found");
    expect(metadata?.title).toBe("Page introuvable");
  });
});
