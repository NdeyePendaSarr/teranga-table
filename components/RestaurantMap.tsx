"use client";

import { useEffect, useRef } from "react";
import { site } from "@/content/site";

/**
 * Carte Leaflet (OpenStreetMap, sans clé API) avec marqueur doré pulsé.
 *
 * Chargement à la demande : rien n'est téléchargé (ni le code Leaflet, ni son
 * CSS, ni les tuiles) tant que la carte n'approche pas de l'écran. L'adresse
 * et le lien d'itinéraire sont affichés à côté, dans le HTML serveur : ils
 * restent utilisables sans JavaScript et sans la carte.
 */
export function RestaurantMap() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let map: import("leaflet").Map | null = null;
    let annule = false;

    async function charger() {
      if (!el || el.dataset.init) return;
      el.dataset.init = "1";
      const L = (await import("leaflet")).default;
      if (annule) return;

      // CSS Leaflet chargé dynamiquement (une seule fois).
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      map = L.map(el, { scrollWheelZoom: false }).setView([site.lat, site.lng], 16);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      const icon = L.divIcon({
        className: "resto-marker",
        html: '<span class="resto-marker-dot"></span>',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });
      // title : nom accessible du marqueur (bouton Leaflet).
      L.marker([site.lat, site.lng], { icon, title: `${site.nom}, ${site.adresseDetail}` })
        .addTo(map)
        .bindPopup(`<strong>${site.nom}</strong><br>${site.adresseDetail}`)
        .openPopup();

      map.on("click", () => map?.scrollWheelZoom.enable());
      map.on("mouseout", () => map?.scrollWheelZoom.disable());
    }

    // Charge la carte quand elle arrive à moins de 300 px de l'écran.
    let obs: IntersectionObserver | null = null;
    if ("IntersectionObserver" in window) {
      obs = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            obs?.disconnect();
            charger();
          }
        },
        { rootMargin: "300px 0px" }
      );
      obs.observe(el);
    } else {
      charger();
    }

    return () => {
      annule = true;
      obs?.disconnect();
      map?.remove();
      delete el.dataset.init;
    };
  }, []);

  // role="region" (et non "img") : la carte contient des boutons (zoom, marqueur).
  return <div id="map" ref={ref} role="region" aria-label={`Carte interactive : ${site.adresseDetail}`} />;
}
