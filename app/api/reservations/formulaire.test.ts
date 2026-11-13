import { describe, it, expect, vi, beforeEach } from "vitest";

// Base et e-mails simulés : aucun accès réseau, aucune écriture réelle.
const inserees: unknown[] = [];
vi.mock("@/db", () => ({
  getDb: () => ({
    insert: () => ({
      values: (v: Record<string, unknown>) => ({
        returning: async () => {
          inserees.push(v);
          return [{ id: 42, ...v, statut: "en_attente", creeLe: new Date() }];
        },
      }),
    }),
  }),
}));
vi.mock("@/lib/email", () => ({ notifierDemandeRecue: vi.fn(async () => {}) }));

const { POST } = await import("./route");
const { reinitialiserLimites } = await import("@/lib/rateLimit");
const { today } = await import("@/lib/validation");

let ip = 0;
function formulaire(champs: Record<string, string>) {
  return new Request("http://localhost/api/reservations", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded", "x-forwarded-for": `10.0.0.${++ip}` },
    body: new URLSearchParams(champs).toString(),
  });
}
const valide = () => ({
  prenom: "Aïda", nom: "Diop", email: "aida@example.com", telephone: "77 123 45 67",
  date: today(), heure: "20:00", personnes: "2", message: "", site_web: "",
});

describe("POST /api/reservations depuis un formulaire HTML (sans JavaScript)", () => {
  beforeEach(() => { inserees.length = 0; reinitialiserLimites(); });

  it("enregistre la demande et redirige (303) vers la page de réservation avec un message de succès", async () => {
    const res = await POST(formulaire(valide()));
    expect(res.status).toBe(303);
    expect(new URL(res.headers.get("location")!).pathname + new URL(res.headers.get("location")!).search)
      .toBe("/reservation?demande=envoyee");
    expect(inserees).toHaveLength(1);
  });

  it("redirige avec un message d'erreur si un champ est invalide, sans rien enregistrer", async () => {
    const res = await POST(formulaire({ ...valide(), telephone: "12345" }));
    expect(res.status).toBe(303);
    expect(res.headers.get("location")).toContain("/reservation?demande=erreur");
    expect(inserees).toHaveLength(0);
  });

  it("ne met aucune donnée personnelle dans l'URL de redirection", async () => {
    const res = await POST(formulaire(valide()));
    const loc = res.headers.get("location")!;
    for (const v of ["Aïda", "Diop", "aida@example.com", "771234567"]) expect(loc).not.toContain(encodeURIComponent(v));
  });

  it("honeypot rempli : faux succès, rien d'enregistré", async () => {
    const res = await POST(formulaire({ ...valide(), site_web: "http://spam.example" }));
    expect(res.status).toBe(303);
    expect(res.headers.get("location")).toContain("demande=envoyee");
    expect(inserees).toHaveLength(0);
  });

  it("garde le comportement JSON pour le formulaire avec JavaScript", async () => {
    const res = await POST(new Request("http://localhost/api/reservations", {
      method: "POST", headers: { "content-type": "application/json", "x-forwarded-for": "10.0.1.1" },
      body: JSON.stringify({ ...valide(), personnes: 2 }),
    }));
    expect(res.status).toBe(201);
    expect(await res.json()).toMatchObject({ ok: true, id: 42 });
  });
});
