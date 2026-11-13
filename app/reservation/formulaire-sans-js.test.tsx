import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import ReservationPage from "./page";

const rendu = async (demande?: string) =>
  renderToString(await ReservationPage({ searchParams: Promise.resolve(demande ? { demande } : {}) }));

describe("page Réservation sans JavaScript : formulaire", () => {
  it("le formulaire est présent et s'envoie en POST vers l'API (pas de données dans l'URL)", async () => {
    const h = await rendu();
    const form = h.match(/<form[^>]*>/)?.[0] ?? "";
    expect(form).toMatch(/method="post"/);
    expect(form).toMatch(/action="\/api\/reservations"/);
    for (const champ of ["prenom", "nom", "email", "telephone", "date", "heure", "personnes", "message"]) {
      expect(h).toContain(`name="${champ}"`);
    }
    expect(h).toMatch(/<button[^>]*type="submit"/);
  });

  it("affiche le résultat d'un envoi sans JavaScript (paramètre ?demande=)", async () => {
    expect(await rendu("envoyee")).toContain("Demande envoyée");
    expect(await rendu("erreur")).toMatch(/role="alert"[^>]*>[^<]*invalides/);
    expect(await rendu("limite")).toMatch(/role="alert"[^>]*>[^<]*Trop de demandes/);
    expect(await rendu()).not.toContain('role="alert"');
  });
});
