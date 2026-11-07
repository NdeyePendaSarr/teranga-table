import { beforeEach, describe, expect, it } from "vitest";
import { echapperHtml } from "./html";
import { cheminInterne } from "./redirect";
import { ipClient, limiter, reinitialiserLimites } from "./rateLimit";
import { MAX_PERSONNES, reservationSchema, today } from "./validation";

describe("echapperHtml", () => {
  it("neutralise les balises et les guillemets", () => {
    expect(echapperHtml('<a href="https://x.io">clic</a>')).toBe(
      "&lt;a href=&quot;https://x.io&quot;&gt;clic&lt;/a&gt;"
    );
  });
  it("échappe & et l'apostrophe", () => {
    expect(echapperHtml("Tom & Jerry's")).toBe("Tom &amp; Jerry&#39;s");
  });
  it("laisse un prénom normal intact (accents compris)", () => {
    expect(echapperHtml("Aïda")).toBe("Aïda");
  });
  it("accepte les nombres et null", () => {
    expect(echapperHtml(4)).toBe("4");
    expect(echapperHtml(null)).toBe("");
  });
});

describe("cheminInterne (anti redirection ouverte)", () => {
  it("garde un chemin interne", () => {
    expect(cheminInterne("/admin")).toBe("/admin");
    expect(cheminInterne("/admin/x?y=1")).toBe("/admin/x?y=1");
  });
  it("refuse les destinations externes", () => {
    for (const s of ["https://evil.com", "//evil.com", "/\\evil.com", "javascript:alert(1)", "evil.com"]) {
      expect(cheminInterne(s)).toBe("/admin");
    }
  });
  it("refuse les caractères de contrôle", () => {
    expect(cheminInterne("/\t/evil.com")).toBe("/admin");
  });
  it("renvoie la valeur par défaut si vide", () => {
    expect(cheminInterne(null)).toBe("/admin");
    expect(cheminInterne("")).toBe("/admin");
  });
});

describe("limiter", () => {
  beforeEach(() => reinitialiserLimites());

  it("autorise jusqu'à max puis bloque", () => {
    const t = 1_000_000;
    for (let i = 0; i < 3; i++) expect(limiter("k", 3, 60_000, t).ok).toBe(true);
    const bloque = limiter("k", 3, 60_000, t + 1000);
    expect(bloque.ok).toBe(false);
    expect(bloque.retryAfter).toBe(59);
  });

  it("réautorise après la fenêtre", () => {
    const t = 1_000_000;
    for (let i = 0; i < 4; i++) limiter("k", 3, 60_000, t);
    expect(limiter("k", 3, 60_000, t + 60_000).ok).toBe(true);
  });

  it("compte chaque clé séparément", () => {
    const t = 1_000_000;
    for (let i = 0; i < 4; i++) limiter("a", 3, 60_000, t);
    expect(limiter("b", 3, 60_000, t).ok).toBe(true);
  });
});

describe("ipClient", () => {
  it("prend la première IP de x-forwarded-for", () => {
    const req = new Request("http://x", { headers: { "x-forwarded-for": "1.2.3.4, 10.0.0.1" } });
    expect(ipClient(req)).toBe("1.2.3.4");
  });
  it("a une valeur de repli", () => {
    expect(ipClient(new Request("http://x"))).toBe("inconnue");
  });
});

describe("nombre de personnes", () => {
  it(`accepte ${MAX_PERSONNES} personnes (la valeur maximale proposée par le formulaire)`, () => {
    const r = reservationSchema.safeParse({
      prenom: "Aïda",
      nom: "Diop",
      email: "aida@example.com",
      telephone: "771234567",
      date: today(),
      heure: "20:00",
      personnes: String(MAX_PERSONNES),
    });
    expect(r.success).toBe(true);
  });
});
