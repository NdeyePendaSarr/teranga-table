import { describe, it, expect } from "vitest";
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { renderToString } from "react-dom/server";
import AProposPage from "./page";

/** À propos : l'ancienne photo (terrasse sur un lac de montagne) ne pouvait pas être le restaurant de Mbour. */
describe("page À propos sans photo hors sujet", () => {
  it("n'utilise plus la photo de la terrasse sur un lac", () => {
    expect(readFileSync(join(process.cwd(), "app", "a-propos", "page.tsx"), "utf8")).not.toContain("photo-1559339352");
  });

  it("n'affiche qu'une seule image, locale : la photo de Mbour", () => {
    const html = renderToString(AProposPage());
    const srcs = [...html.matchAll(/<img[^>]*src="([^"]*)"/g)].map((m) => m[1]);
    expect(srcs).toEqual(["/a-propos/pirogues-mbour.jpg"]);
  });
});

/**
 * À propos : une photo réelle de Mbour (pirogues sur la plage), jamais une
 * photo présentée comme le restaurant, qui est fictif. Licence CC BY-SA 4.0 :
 * auteur, licence, source et modification doivent être affichés.
 */
const SRC = "/a-propos/pirogues-mbour.jpg";
const FICHIER = join(process.cwd(), "public", SRC);

describe("À propos : photo des pirogues de Mbour", () => {
  const html = renderToString(AProposPage());
  const figure = html.match(/<figure[^>]*about-image[\s\S]*?<\/figure>/)?.[0] ?? "";

  it("le fichier existe, est un JPEG et reste léger (< 200 ko)", () => {
    expect(existsSync(FICHIER)).toBe(true);
    const octets = readFileSync(FICHIER);
    expect(octets[0]).toBe(0xff);
    expect(octets[1]).toBe(0xd8);
    expect(statSync(FICHIER).size).toBeLessThan(200 * 1024);
  });

  it("la page affiche la photo dans une figure, avec dimensions (pas de décalage de mise en page)", () => {
    expect(figure).toContain(`src="${SRC}"`);
    expect(figure).toMatch(/<img[^>]*width="\d+"[^>]*height="\d+"/);
  });

  it("le texte alternatif décrit la scène : des pirogues à Mbour, pas le restaurant", () => {
    const alt = figure.match(/alt="([^"]*)"/)?.[1] ?? "";
    expect(alt).toMatch(/pirogues/i);
    expect(alt).toMatch(/Mbour/);
    expect(alt).not.toMatch(/restaurant|salle|terrasse/i);
  });

  it("la légende crédite l'auteur, la licence et la source Commons", () => {
    expect(figure).toMatch(/<figcaption/);
    expect(figure).toContain("Gerardo Russo");
    expect(figure).toContain('href="https://commons.wikimedia.org/wiki/File:Piroghe_di_Mbour.jpg"');
    expect(figure).toContain('href="https://creativecommons.org/licenses/by-sa/4.0/deed.fr"');
    expect(figure).toMatch(/CC BY-SA 4\.0/);
    expect(figure).toMatch(/recadrée/);
  });

  it("la mise en page repasse en deux colonnes (texte et photo)", () => {
    expect(html).not.toContain("about-grid--texte");
  });
});
