import type { Metadata } from "next";
import Link from "next/link";
import { site, lienWhatsApp } from "@/content/site";

export const metadata: Metadata = {
  title: "À propos",
  description: `L'histoire, les horaires et l'adresse de ${site.nom} à Mbour.`,
};

export default function AProposPage() {
  return (
    <>
      <div className="page-top container reveal">
        <p className="eyebrow">Maison</p>
        <h1>Notre histoire</h1>
      </div>

      <section className="section" style={{ paddingTop: "1rem" }}>
        <div className="container about-grid">
          <div className="about-text reveal">
            <p className="eyebrow">L'esprit</p>
            <h2 style={{ fontSize: "1.8rem", margin: "0.4rem 0 1.25rem" }}>
              Tradition, précision, teranga
            </h2>
            <p>
              Nous cuisinons les grands classiques sénégalais avec des produits de
              saison, des circuits courts et une exécution soignée. Chaque assiette
              vise la clarté des goûts : épices juste dosées, cuissons maîtrisées,
              présentation simple.
            </p>
            <p>
              La salle accueille déjeuners d'affaires comme dîners en famille. Le
              service est direct, attentif, sans superflu — comme une bonne table de
              quartier qui prend son métier au sérieux.
            </p>
            <p>
              <strong>Ce qui compte pour nous :</strong> la qualité des produits, le
              respect des recettes, et le plaisir de recevoir.
            </p>
            <p style={{ marginTop: "1.75rem" }}>
              <Link href="/reservation" className="btn btn-primary">Réserver une table</Link>
            </p>
          </div>
          <div className="about-image reveal">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=900&q=80"
              alt="Salle du restaurant"
              width={600}
              height={750}
              loading="lazy"
            />
          </div>
        </div>
      </section>

      <section className="section section-dark">
        <div className="container">
          <div className="info-strip reveal-group">
            <div className="info-item reveal">
              <h3>Horaires</h3>
              <div>
                {site.horaires.map((h) => (
                  <div className="horaire-row" key={h.jour}>
                    <span>{h.jour}</span>
                    <strong>{h.heures}</strong>
                  </div>
                ))}
              </div>
            </div>
            <div className="info-item reveal">
              <h3>Adresse</h3>
              <p>{site.adresseDetail}</p>
            </div>
            <div className="info-item reveal">
              <h3>Contact</h3>
              <p><a href={`tel:${site.telephone.replace(/\s/g, "")}`} style={{ color: "#e7e5e4" }}>{site.telephone}</a></p>
              <p style={{ marginTop: "0.35rem" }}>
                <a href={lienWhatsApp()} style={{ color: "#fcd34d" }} target="_blank" rel="noopener noreferrer">WhatsApp</a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
