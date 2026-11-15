import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import { ReservationForm } from "./ReservationForm";
import { erreursParChamp, LIBELLES, resumeErreurs } from "@/lib/erreursFormulaire";

const html = renderToString(<ReservationForm />);
const champ = (id: string) => html.match(new RegExp(`<input[^>]*id="${id}"[^>]*>|<select[^>]*id="${id}"[^>]*>|<textarea[^>]*id="${id}"[^>]*>`))?.[0] ?? "";
const attr = (balise: string, nom: string) => balise.match(new RegExp(`${nom}="([^"]*)"`))?.[1];

describe("téléphone : le motif accepte le format montré dans le placeholder", () => {
  const tel = champ("phone");
  const motif = attr(tel, "pattern")!;
  // Même compilation que le navigateur : motif entier, indicateur v.
  const regex = new RegExp(`^(?:${motif})$`, "v");

  it("le placeholder lui-même est accepté", () => {
    expect(regex.test(attr(tel, "placeholder")!)).toBe(true);
  });

  it("accepte les écritures courantes, avec ou sans indicatif, espaces ou points", () => {
    for (const v of ["77 123 45 67", "771234567", "+221 77 123 45 67", "+221771234567", "00221 76 123 45 67", "78.123.45.67", "70 123 45 67"]) {
      expect(regex.test(v), v).toBe(true);
    }
  });

  it("refuse un numéro qui n'est pas un mobile sénégalais", () => {
    for (const v of ["12 34", "771234", "+33 6 12 34 56 78", "33 123 45 67", "77 123 45 678", "abc"]) {
      expect(regex.test(v), v).toBe(false);
    }
  });

  it("accepte exactement ce que le serveur accepte (espaces et points retirés)", async () => {
    const { reservationSchema } = await import("@/lib/validation");
    const base = { prenom: "A", nom: "B", email: "a@b.co", date: "2999-01-01", heure: "20:00", personnes: "2", message: "" };
    for (const v of ["77 123 45 67", "+221 77 123 45 67", "78.123.45.67", "12 34", "+33 6 12 34 56 78"]) {
      expect(regex.test(v), v).toBe(reservationSchema.safeParse({ ...base, telephone: v }).success);
    }
  });

  it("en cas de refus, le navigateur affiche un message en français (attribut title)", () => {
    const title = attr(tel, "title") ?? "";
    expect(title).toMatch(/commençant par 7/);
    expect(title).toMatch(/77 123 45 67/);
  });
});

describe("erreurs par champ renvoyées par l'API", () => {
  it("relie chaque champ de l'API à son champ du formulaire, premier message seulement", () => {
    expect(erreursParChamp({ telephone: ["Numéro sénégalais invalide", "autre"], date: ["La date ne peut pas être dans le passé"] })).toEqual({
      phone: "Numéro sénégalais invalide",
      date: "La date ne peut pas être dans le passé",
    });
  });

  it("ignore les champs inconnus et les formes inattendues", () => {
    expect(erreursParChamp({ inconnu: ["x"], prenom: [] })).toEqual({});
    expect(erreursParChamp(null)).toEqual({});
    expect(erreursParChamp("texte")).toEqual({});
  });

  it("résume les erreurs en une phrase lisible, avec les libellés des champs", () => {
    expect(resumeErreurs({ phone: "x", date: "y" })).toBe("2 champs à corriger : Téléphone, Date.");
    expect(resumeErreurs({ email: "x" })).toBe("1 champ à corriger : Email.");
    expect(Object.values(LIBELLES)).toContain("Nombre de personnes");
  });

  it("au premier rendu, aucun champ n'est marqué invalide et les aides sont reliées aux champs", () => {
    expect(html).not.toContain('aria-invalid="true"');
    expect(attr(champ("phone"), "aria-describedby")).toBe("aide-phone");
    expect(attr(champ("guests"), "aria-describedby")).toBe("aide-guests");
    expect(html).toMatch(/<p[^>]*id="aide-phone"/);
    expect(html).toMatch(/<p[^>]*id="aide-guests"/);
  });
});
