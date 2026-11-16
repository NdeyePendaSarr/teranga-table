import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToString } from "react-dom/server";
import { Footer } from "@/components/Footer";
import { site } from "@/content/site";
import AProposPage from "./a-propos/page";

describe("pied de page : pas de lien vers un réseau social inexistant", () => {
  it("le restaurant est fictif : aucun lien Instagram, Facebook ou TikTok", () => {
    const html = renderToString(<Footer />);
    expect(html).not.toMatch(/instagram|facebook|tiktok/i);
    expect("instagram" in site).toBe(false);
  });
});

describe("globals.css : en-tête de fichier", () => {
  it("ne se présente plus comme un « template »", () => {
    const tete = readFileSync(join(process.cwd(), "app", "globals.css"), "utf8").slice(0, 600);
    expect(tete).not.toMatch(/template/i);
    expect(tete).toMatch(/Teranga Table/);
  });
});

describe("photo de la page À propos : pas téléchargée depuis les autres pages", () => {
  it("l'image est en chargement différé (le préchargement de la route ne l'entraîne plus)", () => {
    const img = renderToString(AProposPage()).match(/<img[^>]*pirogues-mbour[^>]*>/)?.[0] ?? "";
    expect(img).toMatch(/loading="lazy"/);
  });
});

describe("pied de page : accès à l'espace équipe", () => {
  const html = renderToString(<Footer />);
  const lien = html.match(/<a[^>]*href="\/admin"[^>]*>[^<]*<\/a>/)?.[0] ?? "";

  it("un lien « Espace équipe » mène à /admin (la connexion s'affiche si besoin)", () => {
    expect(lien).toMatch(/>Espace équipe<\/a>$/);
  });

  it("le lien n'est pas dans la navigation principale, réservée aux clients", async () => {
    const { Header } = await import("@/components/Header");
    expect(renderToString(<Header />)).not.toMatch(/href="\/admin/);
  });
});

/**
 * Formulaire sur iPhone : Safari donne au champ date natif une largeur minimale
 * intrinsèque ; dans la grille, il débordait de la carte. Garde-fou statique :
 * ce rendu ne se reproduit pas dans Chrome, il se vérifie sur un iPhone.
 */
describe("formulaire : le champ date ne déborde pas sur mobile (Safari iOS)", () => {
  const css = readFileSync(join(process.cwd(), "app", "globals.css"), "utf8");
  const regle = (selecteur: RegExp) => css.match(new RegExp(`${selecteur.source}\\s*\\{[^}]*\\}`))?.[0] ?? "";

  it("les éléments de la grille du formulaire peuvent rétrécir sous leur contenu", () => {
    expect(regle(/\n\.form-group/)).toMatch(/min-width:\s*0/);
  });

  it("le champ date perd l'apparence native qui impose sa largeur, sans dépasser 100 %", () => {
    const date = regle(/\.form-group input\[type="date"\]/);
    expect(date).toMatch(/-webkit-appearance:\s*none/);
    expect(date).toMatch(/appearance:\s*none/);
    expect(date).toMatch(/min-width:\s*0/);
    expect(date).toMatch(/max-width:\s*100%/);
  });

  it("la date s'aligne à gauche, comme les autres champs", () => {
    expect(regle(/\.form-group input\[type="date"\]::-webkit-date-and-time-value/)).toMatch(/text-align:\s*left/);
  });
});
