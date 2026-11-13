import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Base et e-mails simulés : aucun accès réseau, aucune écriture réelle.
const inserees: unknown[] = [];
vi.mock("@/db", () => ({
  getDb: () => ({
    insert: () => ({
      values: (v: Record<string, unknown>) => ({
        returning: async () => {
          inserees.push(v);
          return [{ id: inserees.length, ...v, statut: "en_attente", creeLe: new Date() }];
        },
      }),
    }),
  }),
}));
const notifier = vi.fn(async () => {});
vi.mock("@/lib/email", () => ({ notifierDemandeRecue: (...a: unknown[]) => notifier(...(a as [])) }));

const { POST } = await import("./route");
const { reinitialiserLimites, LIMITE_RESERVATIONS } = await import("@/lib/rateLimit");
const { today, HONEYPOT } = await import("@/lib/validation");

const valide = () => ({
  prenom: "Aïda", nom: "Diop", email: "aida@example.com", telephone: "77 123 45 67",
  date: today(), heure: "20:00", personnes: 2, message: "",
});
const json = (corps: object, ip: string) =>
  POST(new Request("http://localhost/api/reservations", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify(corps),
  }));
const formulaire = (corps: Record<string, string>, ip: string) =>
  POST(new Request("http://localhost/api/reservations", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded", "x-forwarded-for": ip },
    body: new URLSearchParams(corps).toString(),
  }));

beforeEach(() => { inserees.length = 0; notifier.mockClear(); reinitialiserLimites(); });
afterEach(() => { vi.useRealTimers(); });

describe("limite de débit sur POST /api/reservations", () => {
  it("la limite est de 5 demandes par 10 minutes et par IP", () => {
    expect(LIMITE_RESERVATIONS).toEqual({ max: 5, fenetreMs: 10 * 60 * 1000 });
  });

  it("accepte 5 demandes puis refuse la 6e (429), sans l'enregistrer", async () => {
    for (let i = 0; i < 5; i++) expect((await json(valide(), "203.0.113.1")).status).toBe(201);
    const res = await json(valide(), "203.0.113.1");
    expect(res.status).toBe(429);
    expect(inserees).toHaveLength(5);
    expect(notifier).toHaveBeenCalledTimes(5);
  });

  it("donne un message clair : délai en minutes et alternative WhatsApp, plus l'en-tête Retry-After", async () => {
    for (let i = 0; i < 5; i++) await json(valide(), "203.0.113.2");
    const res = await json(valide(), "203.0.113.2");
    const attente = Number(res.headers.get("retry-after"));
    expect(attente).toBeGreaterThan(0);
    expect(attente).toBeLessThanOrEqual(600);
    const { error } = await res.json();
    expect(error).toMatch(/^Trop de demandes/);
    expect(error).toMatch(/Réessayez dans 10 minutes/);
    expect(error).toContain("WhatsApp");
  });

  it("compte chaque IP séparément", async () => {
    for (let i = 0; i < 6; i++) await json(valide(), "203.0.113.3");
    expect((await json(valide(), "203.0.113.4")).status).toBe(201);
  });

  it("réautorise après la fenêtre de 10 minutes", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-11-13T12:00:00Z"));
    for (let i = 0; i < 6; i++) await json({ ...valide(), date: "2026-11-20" }, "203.0.113.5");
    expect((await json({ ...valide(), date: "2026-11-20" }, "203.0.113.5")).status).toBe(429);
    vi.setSystemTime(new Date("2026-11-13T12:10:01Z"));
    expect((await json({ ...valide(), date: "2026-11-20" }, "203.0.113.5")).status).toBe(201);
  });

  it("sans JavaScript : redirige vers ?demande=limite avec le délai en minutes (aucune donnée personnelle)", async () => {
    const corps = { ...valide(), personnes: "2", [HONEYPOT]: "" };
    for (let i = 0; i < 5; i++) await formulaire(corps, "203.0.113.6");
    const res = await formulaire(corps, "203.0.113.6");
    expect(res.status).toBe(303);
    const loc = new URL(res.headers.get("location")!);
    expect(loc.pathname).toBe("/reservation");
    expect(loc.searchParams.get("demande")).toBe("limite");
    expect(loc.searchParams.get("attente")).toBe("10");
    expect([...loc.searchParams.keys()].sort()).toEqual(["attente", "demande"]);
  });
});

describe("champ piège (honeypot) côté serveur", () => {
  it("JSON : un robot qui remplit le champ reçoit un faux succès, rien n'est enregistré ni envoyé", async () => {
    const res = await json({ ...valide(), [HONEYPOT]: "https://spam.example" }, "198.51.100.1");
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ ok: true });
    expect(inserees).toHaveLength(0);
    expect(notifier).not.toHaveBeenCalled();
  });

  it("formulaire HTML : même faux succès, rien d'enregistré ni d'envoyé", async () => {
    const res = await formulaire({ ...valide(), personnes: "2", [HONEYPOT]: "spam" }, "198.51.100.2");
    expect(res.status).toBe(303);
    expect(res.headers.get("location")).toContain("demande=envoyee");
    expect(inserees).toHaveLength(0);
    expect(notifier).not.toHaveBeenCalled();
  });

  it("un champ piège vide ou fait d'espaces n'empêche pas une vraie demande", async () => {
    expect((await json({ ...valide(), [HONEYPOT]: "   " }, "198.51.100.3")).status).toBe(201);
    expect(inserees).toHaveLength(1);
  });

  it("les essais d'un robot comptent dans la limite de débit", async () => {
    for (let i = 0; i < 5; i++) await json({ ...valide(), [HONEYPOT]: "spam" }, "198.51.100.4");
    expect((await json(valide(), "198.51.100.4")).status).toBe(429);
  });
});
