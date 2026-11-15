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
