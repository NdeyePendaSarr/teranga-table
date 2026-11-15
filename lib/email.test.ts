import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { Reservation } from "@/db/schema";

const reservation: Reservation = {
  id: 1, prenom: "Aïda <b>", nom: "Diop & fils", email: "aida@example.com", telephone: "771234567",
  date: "2026-11-20", heure: "20:00", personnes: 4, message: null, statut: "confirmee", creeLe: new Date(),
};

describe("e-mails : couleur conforme et version texte", () => {
  it("le gabarit HTML n'utilise plus l'ancien gris et reprend la couleur du site", async () => {
    const { gabarit, contenu } = await import("./email");
    const html = gabarit(reservation, contenu("confirmee", "Aïda"));
    expect(html).not.toContain("#8a7d6f");
    expect(html).toContain("#6f6356");
    expect(html).toContain("20 novembre 2026");
  });

  it("la version texte reprend tout l'essentiel, sans balise ni entité HTML", async () => {
    const { texteBrut, contenu } = await import("./email");
    for (const variante of ["recue", "confirmee", "annulee"] as const) {
      const c = contenu(variante, reservation.prenom);
      const texte = texteBrut(reservation, c);
      expect(texte).toContain(c.titre);
      expect(texte).toContain("Aïda <b>"); // prénom brut : pas d'échappement HTML dans du texte
      expect(texte).toMatch(/Date\s*:\s*20 novembre 2026/);
      expect(texte).toMatch(/Heure\s*:\s*20:00/);
      expect(texte).toMatch(/Personnes\s*:\s*4/);
      expect(texte).toContain("+221 77 000 00 00");
      // Aucune balise ni entité HTML (hors le « <b> » qui fait partie du prénom de test)
      const sansPrenom = texte.split(reservation.prenom).join("");
      expect(sansPrenom).not.toMatch(/<[a-z!/]/i);
      expect(sansPrenom).not.toMatch(/&(amp|lt|gt|quot|#\d+);/);
    }
  });

  it("le prénom reste échappé dans le HTML", async () => {
    const { gabarit, contenu } = await import("./email");
    const { echapperHtml } = await import("./html");
    const html = gabarit(reservation, contenu("recue", echapperHtml(reservation.prenom)));
    expect(html).not.toContain("Aïda <b>");
    expect(html).toContain("Aïda &lt;b&gt;");
  });
});

describe("envoi Brevo : HTML et texte dans la même requête", () => {
  const fetchSimule = vi.fn(async () => new Response("{}", { status: 201 }));
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("BREVO_API_KEY", "cle-de-test");
    vi.stubEnv("EMAIL_FROM", "test@example.com");
    vi.stubGlobal("fetch", fetchSimule);
    fetchSimule.mockClear();
  });
  afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

  it("notifierClient envoie htmlContent et textContent cohérents", async () => {
    const { notifierClient } = await import("./email");
    await notifierClient(reservation);
    expect(fetchSimule).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSimule.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.brevo.com/v3/smtp/email");
    const corps = JSON.parse(String(init.body));
    expect(corps.subject).toMatch(/confirmée/);
    expect(corps.htmlContent).toContain("<!doctype html>");
    expect(corps.textContent).toContain("Votre table est confirmée");
    expect(corps.textContent.split(reservation.prenom).join("")).not.toMatch(/<[a-z!/]/i);
    expect(corps.to).toEqual([{ email: "aida@example.com", name: "Aïda <b> Diop & fils" }]);
  });
});
