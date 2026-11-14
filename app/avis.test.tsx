import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import AccueilPage from "./page";

/** Le restaurant est fictif : les avis de l'accueil doivent être présentés comme tels. */
describe("accueil : avis présentés comme fictifs", () => {
  const html = renderToString(AccueilPage());
  const section = html.slice(html.indexOf("Ce qu"), html.indexOf("</section>", html.indexOf("Ce qu")));

  it("la section Avis indique que les avis sont fictifs", () => {
    expect(section).toMatch(/avis fictifs/i);
  });

  it("la mention est visible avant les citations (lue avant elles)", () => {
    const mention = section.search(/avis fictifs/i);
    expect(mention).toBeGreaterThan(0);
    expect(mention).toBeLessThan(section.indexOf("<blockquote"));
  });

  it("les citations restent affichées", () => {
    expect(section.match(/<blockquote/g)).toHaveLength(2);
  });
});
