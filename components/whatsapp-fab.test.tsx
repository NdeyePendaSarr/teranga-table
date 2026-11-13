import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import { WhatsAppFab } from "./WhatsAppFab";

/**
 * Règle axe « region » : tout contenu doit être dans un repère (landmark).
 * Le bouton flottant est rendu hors de <header>, <main> et <footer> par le
 * layout : il doit donc porter son propre repère, nommé.
 */
describe("bouton WhatsApp flottant", () => {
  const html = renderToString(<WhatsAppFab />);

  it("est dans un repère complémentaire nommé (<aside aria-label>)", () => {
    expect(html).toMatch(/^<aside[^>]*aria-label="[^"]+"/);
  });

  it("garde un nom accessible explicite sur le lien", () => {
    expect(html).toMatch(/<a[^>]*aria-label="[^"]*WhatsApp[^"]*"/);
  });
});
