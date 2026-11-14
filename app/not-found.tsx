import type { Metadata } from "next";
import Link from "next/link";
import { lienWhatsApp } from "@/content/site";

export const metadata: Metadata = {
  title: "Page introuvable",
};

/** Page 404 : même mise en page que les autres pages, en français, avec des sorties utiles. */
export default function NotFound() {
  return (
    <>
      <div className="page-top container">
        <p className="eyebrow">Erreur 404</p>
        <h1>Page introuvable</h1>
        <p>Cette page n&apos;existe pas ou a été déplacée. Voici où trouver ce que vous cherchez.</p>
      </div>

      <section className="section" style={{ paddingTop: "1rem" }}>
        <div className="container" style={{ display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "center" }}>
          <Link href="/" className="btn btn-outline-dark">Accueil</Link>
          <Link href="/menu" className="btn btn-outline-dark">Voir la carte</Link>
          <Link href="/reservation" className="btn btn-primary">Réserver une table</Link>
        </div>
        <p className="container" style={{ textAlign: "center", marginTop: "2rem", color: "var(--muted)" }}>
          Une question ? <a href={lienWhatsApp()} target="_blank" rel="noopener noreferrer" style={{ color: "var(--gold-text)", fontWeight: 600 }}>Écrivez-nous sur WhatsApp</a>.
        </p>
      </section>
    </>
  );
}
