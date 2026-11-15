import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import { ChampMotDePasse } from "./ChampMotDePasse";

/** Connexion admin : on doit pouvoir afficher ce que l'on a saisi (bouton « œil »). */
describe("champ mot de passe avec bouton afficher/masquer", () => {
  const html = renderToString(
    <ChampMotDePasse id="mdp" label="Mot de passe administrateur" value="" onChange={() => {}} />
  );
  const input = html.match(/<input[^>]*>/)?.[0] ?? "";
  const bouton = html.match(/<button[^>]*>/)?.[0] ?? "";

  it("masque la saisie par défaut, avec un libellé relié au champ", () => {
    expect(input).toMatch(/type="password"/);
    expect(input).toMatch(/id="mdp"/);
    expect(html).toMatch(/<label[^>]*for="mdp"[^>]*>Mot de passe administrateur<\/label>/);
  });

  it("propose un bouton accessible pour afficher le mot de passe, hors soumission du formulaire", () => {
    expect(bouton).toMatch(/type="button"/);
    expect(bouton).toMatch(/aria-label="Afficher le mot de passe"/);
    expect(bouton).toMatch(/aria-pressed="false"/);
    expect(bouton).toMatch(/aria-controls="mdp"/);
  });

  it("l'icône est décorative et le bouton porte le texte, pas l'inverse", () => {
    expect(html).toMatch(/<svg[^>]*aria-hidden="true"/);
    expect(html).not.toMatch(/<button[^>]*>\s*<\/button>/);
  });
});
