import { describe, it, expect } from "vitest";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { renderToString } from "react-dom/server";
import { menu } from "@/content/menu";
import { MenuGrid } from "@/components/MenuGrid";

/**
 * Carte : aucune photo ne doit montrer un autre plat que celui annoncé
 * (critique design du 13/11/2026). En attendant de vraies photos, ces plats
 * s'affichent dans une liste façon carte de restaurant, sans image.
 */
const RACINE = process.cwd();

// Photos Unsplash retirées : plat différent de celui annoncé.
const PHOTOS_RETIREES: Record<string, string> = {
  "photo-1601050690597": "Pastels au thon (samoussas)",
  "photo-1626804475297": "Accras de crevettes (nouilles sautées)",
  "photo-1598103442097": "Poulet frites (poulet rôti entier, sans frites)",
  "photo-1544025162": "Poisson braisé (travers de porc)",
  "photo-1488477181946": "Thiakry (panna cotta aux fraises)",
  "photo-1551024506": "Sombi (glace nappée de caramel)",
  "photo-1544145945": "Bissap glacé (cocktails en verres à martini)",
  "photo-1622597467836": "Jus de gingembre (smoothies)",
};
// Pastels au thon, Poulet frites et Poisson braisé ont retrouvé une photo
// fidèle (Wikimedia Commons, CC BY-SA 4.0) ; ces cinq-là restent sans photo.
const PLATS_SANS_PHOTO = ["Accras de crevettes", "Thiakry", "Sombi", "Bissap glacé", "Jus de gingembre"];
// Seule photo distante conservée : Brochettes (dibi), grillade mixte, licence Unsplash.
const DISTANTES_AUTORISEES = ["https://images.unsplash.com/photo-1555939594-58d7cb561ad1"];

function sources(racine: string): string[] {
  const out: string[] = [];
  const parcourir = (d: string) => readdirSync(d, { withFileTypes: true }).forEach((e) => {
    const p = join(d, e.name);
    if (e.isDirectory()) parcourir(p);
    else if (/\.(tsx?|css)$/.test(e.name) && !/\.test\./.test(e.name)) out.push(p);
  });
  ["app", "components", "content"].forEach((d) => parcourir(join(racine, d)));
  return out;
}

describe("carte : photos fidèles aux plats", () => {
  it("aucune des photos de plats signalées n'est encore utilisée", () => {
    const restes: string[] = [];
    for (const f of sources(RACINE)) {
      const txt = readFileSync(f, "utf8");
      for (const [id, quoi] of Object.entries(PHOTOS_RETIREES)) if (txt.includes(id)) restes.push(`${f.slice(RACINE.length + 1)} : ${quoi}`);
    }
    expect(restes).toEqual([]);
  });

  it("les plats sans photo fidèle n'ont pas de photo ; les autres gardent une photo locale ou autorisée", () => {
    expect(menu.filter((p) => !p.img).map((p) => p.nom).sort()).toEqual([...PLATS_SANS_PHOTO].sort());
    for (const p of menu.filter((x) => x.img)) {
      const ok = p.img!.startsWith("/plats/") ? existsSync(join(RACINE, "public", p.img!)) : DISTANTES_AUTORISEES.some((u) => p.img!.startsWith(u));
      expect(ok, `${p.nom} : ${p.img}`).toBe(true);
    }
  });

  it("plats avec photo en cartes, plats sans photo en liste façon menu, chacun avec son prix", () => {
    // Des cartes sans image, étirées à la hauteur des cartes avec photo,
    // laissaient un grand vide blanc : les plats sans photo vont dans une liste.
    const html = renderToString(<MenuGrid plats={menu} />);
    const cartes = [...html.matchAll(/<article[^>]*class="card[^"]*"[^>]*>([\s\S]*?)<\/article>/g)].map((m) => m[1]);
    const lignes = [...html.matchAll(/<li class="plat-ligne">([\s\S]*?)<\/li>/g)].map((m) => m[1]);
    const avec = menu.filter((p) => p.img), sans = menu.filter((p) => !p.img);
    expect(cartes).toHaveLength(avec.length);
    expect(lignes).toHaveLength(sans.length);
    cartes.forEach((c, i) => { expect(c, avec[i].nom).toContain("<img"); expect(c).toContain(avec[i].prix); });
    lignes.forEach((l, i) => { expect(l).not.toContain("<img"); expect(l, sans[i].nom).toContain(sans[i].nom); expect(l).toContain(sans[i].prix); });
    expect(html).toContain("Également à la carte");
  });
});

describe("photos Wikimedia Commons : crédits obligatoires (CC BY-SA 4.0)", () => {
  const COMMONS = menu.filter((p) => p.credit);

  it("trois plats illustrés par Commons, fichiers locaux présents", () => {
    expect(COMMONS.map((p) => p.nom).sort()).toEqual(["Pastels au thon", "Poisson braisé", "Poulet frites"]);
    for (const p of COMMONS) expect(existsSync(join(RACINE, "public", p.img!)), p.nom).toBe(true);
  });

  it("chaque photo a son auteur, sa licence avec lien et sa page source", () => {
    for (const p of COMMONS) {
      const c = p.credit!;
      expect(c.auteur.trim(), p.nom).not.toBe("");
      expect(c.licence).toBe("CC BY-SA 4.0");
      expect(c.licenceUrl).toBe("https://creativecommons.org/licenses/by-sa/4.0/deed.fr");
      expect(c.source, p.nom).toMatch(/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
    }
  });

  it("le texte alternatif décrit ce que montre la photo (fataya, pas « pastels »)", () => {
    const pastels = menu.find((p) => p.nom === "Pastels au thon")!;
    expect(pastels.imgAlt).toMatch(/fataya/i);
    const html = renderToString(<MenuGrid plats={menu} />);
    expect(html).toMatch(/<img[^>]*alt="[^"]*[Ff]ataya[^"]*"/);
  });

  it("la page Carte affiche une section « Crédits photos » avec auteur, licence et source", async () => {
    const { default: MenuPage } = await import("./menu/page");
    const html = renderToString(MenuPage());
    expect(html).toContain("Crédits photos");
    for (const p of COMMONS) {
      const c = p.credit!;
      expect(html, p.nom).toContain(c.auteur);
      expect(html).toContain(`href="${c.licenceUrl}"`);
      expect(html).toContain(`href="${c.source}"`);
    }
  });
});
