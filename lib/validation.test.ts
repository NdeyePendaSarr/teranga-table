import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { reservationSchema, today, CRENEAUX } from "./validation";
import { menu, signatures, CATEGORIES } from "../content/menu";
import { site, lienWhatsApp } from "../content/site";

const CAT_IDS = CATEGORIES.map((c) => c.id);
const PUBLIC = join(process.cwd(), "public");

function base() {
  return {
    prenom: "Aïda",
    nom: "Diop",
    email: "aida@example.com",
    telephone: "771234567".padStart(9, "7"),
    date: today(),
    heure: "20:00",
    personnes: 2,
    message: "",
  };
}

describe("reservationSchema", () => {
  it("accepte une réservation valide", () => {
    const r = reservationSchema.safeParse(base());
    expect(r.success).toBe(true);
  });

  it("normalise un téléphone avec espaces", () => {
    const r = reservationSchema.safeParse({ ...base(), telephone: "77 123 45 67" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.telephone).toBe("771234567");
  });

  it("rejette un téléphone qui ne commence pas par 7", () => {
    const r = reservationSchema.safeParse({ ...base(), telephone: "601234567" });
    expect(r.success).toBe(false);
  });

  it("rejette une date passée", () => {
    const r = reservationSchema.safeParse({ ...base(), date: "2000-01-01" });
    expect(r.success).toBe(false);
  });

  it("rejette un créneau non proposé", () => {
    const r = reservationSchema.safeParse({ ...base(), heure: "23:45" });
    expect(r.success).toBe(false);
  });

  it("coerce le nombre de personnes et borne le maximum", () => {
    const ok = reservationSchema.safeParse({ ...base(), personnes: "4" });
    expect(ok.success).toBe(true);
    const trop = reservationSchema.safeParse({ ...base(), personnes: 50 });
    expect(trop.success).toBe(false);
  });

  it("exige prénom, nom et email valides", () => {
    expect(reservationSchema.safeParse({ ...base(), prenom: "" }).success).toBe(false);
    expect(reservationSchema.safeParse({ ...base(), email: "pas-un-email" }).success).toBe(false);
  });
});

describe("today", () => {
  it("formate une date locale en yyyy-mm-dd", () => {
    expect(today(new Date(2026, 7, 5))).toBe("2026-08-05");
  });
});

describe("créneaux", () => {
  it("sont au format HH:MM et uniques", () => {
    for (const c of CRENEAUX) expect(c).toMatch(/^\d{2}:\d{2}$/);
    expect(new Set(CRENEAUX).size).toBe(CRENEAUX.length);
  });
});

describe("carte (menu)", () => {
  it("chaque plat a des champs non vides et une catégorie valide", () => {
    for (const p of menu) {
      expect(p.nom.trim()).not.toBe("");
      expect(p.desc.trim()).not.toBe("");
      expect(p.prix.trim()).not.toBe("");
      expect(CAT_IDS).toContain(p.cat);
    }
  });

  it("a des noms uniques (clé React)", () => {
    const noms = menu.map((p) => p.nom);
    expect(new Set(noms).size).toBe(noms.length);
  });

  it("expose au moins une signature", () => {
    expect(signatures.length).toBeGreaterThan(0);
  });

  it("chaque image locale existe dans public/", () => {
    for (const p of menu) {
      if (!p.img?.startsWith("/")) continue;
      expect(existsSync(join(PUBLIC, p.img))).toBe(true);
    }
  });
});

describe("config du site", () => {
  it("a un numéro WhatsApp sénégalais valide", () => {
    expect(site.whatsapp).toMatch(/^221\d{9}$/);
  });
  it("construit un lien wa.me encodé", () => {
    const l = lienWhatsApp();
    expect(l.startsWith(`https://wa.me/${site.whatsapp}?text=`)).toBe(true);
    expect(l).not.toContain(" ");
  });
});
