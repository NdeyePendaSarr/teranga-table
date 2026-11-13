import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import { ReservationForm } from "./ReservationForm";
import { HONEYPOT } from "@/lib/validation";

/**
 * Le champ piège doit être invisible pour un humain, ignoré par les lecteurs
 * d'écran et hors de l'ordre de tabulation, tout en restant dans le DOM pour
 * qu'un robot le remplisse (donc ni display:none, ni visibility:hidden, ni
 * attribut hidden : certains robots ignorent les champs cachés ainsi).
 */
const html = renderToString(<ReservationForm />);
const conteneur = html.match(new RegExp(`<div[^>]*>(?:(?!</div>).)*name="${HONEYPOT}"`, "s"))?.[0] ?? "";
const ouverture = conteneur.match(/^<div[^>]*>/)?.[0] ?? "";
const input = html.match(new RegExp(`<input[^>]*name="${HONEYPOT}"[^>]*>`))?.[0] ?? "";

describe("champ piège (honeypot) du formulaire", () => {
  it("est présent dans le HTML serveur (il marche aussi sans JavaScript)", () => {
    expect(input).not.toBe("");
  });

  it("est ignoré par les lecteurs d'écran (conteneur aria-hidden)", () => {
    expect(ouverture).toContain('aria-hidden="true"');
  });

  it("est hors de l'ordre de tabulation et de la saisie automatique", () => {
    expect(input).toMatch(/tabindex="-1"/i);
    expect(input).toMatch(/autocomplete="off"/i);
    expect(input).not.toMatch(/\srequired/);
  });

  it("est rendu hors de l'écran, sans être retiré du DOM pour les robots", () => {
    expect(ouverture).toMatch(/position:absolute/);
    expect(ouverture).toMatch(/left:-10000px/);
    expect(ouverture).not.toMatch(/display:none|visibility:hidden/);
    expect(ouverture).not.toMatch(/\shidden(=|\s|>)/);
  });

  it("n'est pas un des champs visibles du formulaire", () => {
    for (const visible of ["prenom", "nom", "email", "telephone"]) {
      expect(conteneur).not.toContain(`name="${visible}"`);
    }
  });
});
