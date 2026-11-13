import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import ReservationPage from "./page";
import { site, lienItineraire } from "@/content/site";

describe("page Réservation : infos pratiques sans la carte", () => {
  it("l'adresse et un lien d'itinéraire sont dans le HTML serveur", async () => {
    const h = renderToString(await ReservationPage({ searchParams: Promise.resolve({}) }));
    expect(h).toContain(site.adresseDetail);
    expect(h).toMatch(/href="https:\/\/www\.google\.com\/maps\/dir\/\?api=1&amp;destination=/);
  });

  it("le lien d'itinéraire pointe vers les coordonnées du restaurant", () => {
    expect(lienItineraire()).toBe(`https://www.google.com/maps/dir/?api=1&destination=${site.lat},${site.lng}`);
  });

  it("la carte ne charge pas Leaflet au rendu serveur (conteneur vide, sans role=img)", async () => {
    const h = renderToString(await ReservationPage({ searchParams: Promise.resolve({}) }));
    const conteneur = h.match(/<div[^>]*id="map"[^>]*>/)?.[0] ?? "";
    expect(conteneur).not.toBe("");
    expect(conteneur).not.toContain('role="img"');
    expect(h).not.toContain("leaflet-container");
  });
});
