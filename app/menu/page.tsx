import type { Metadata } from "next";
import Link from "next/link";
import { menu } from "@/content/menu";

const credits = menu.filter((p) => p.credit);
import { MenuGrid } from "@/components/MenuGrid";

export const metadata: Metadata = {
  title: "La carte",
  description:
    "Entrées, plats signature sénégalais, grillades du soir, desserts et jus frais. Découvrez la carte de Teranga Table.",
};

export default function MenuPage() {
  return (
    <>
      <div className="page-top container reveal">
        <p className="eyebrow">Menu</p>
        <h1>Notre carte</h1>
        <p>Produits locaux, recettes de famille, exécution soignée. Prix en francs CFA.</p>
      </div>
      <section className="section" style={{ paddingTop: "1.5rem" }}>
        <div className="container">
          <MenuGrid plats={menu} />
          <p style={{ textAlign: "center", marginTop: "3rem" }}>
            <Link href="/reservation" className="btn btn-primary">Réserver une table</Link>
          </p>
          {credits.length > 0 ? (
            // Crédits exigés par la licence CC BY-SA 4.0 des photos Wikimedia Commons
            <aside className="credits-photos" aria-labelledby="credits-photos-titre">
              <h2 id="credits-photos-titre">Crédits photos</h2>
              <ul>
                {credits.map((p) => (
                  <li key={p.nom}>
                    {p.nom} : photo de <a href={p.credit!.source} target="_blank" rel="noopener noreferrer">{p.credit!.auteur}</a>{" "}
                    (Wikimedia Commons), licence{" "}
                    <a href={p.credit!.licenceUrl} target="_blank" rel="noopener noreferrer">{p.credit!.licence}</a>
                    {p.credit!.modification ? `, ${p.credit!.modification}` : ""}.
                  </li>
                ))}
              </ul>
            </aside>
          ) : null}
        </div>
      </section>
    </>
  );
}
