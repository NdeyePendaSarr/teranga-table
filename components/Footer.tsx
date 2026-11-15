import Link from "next/link";
import { site } from "@/content/site";

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link href="/" className="logo">
              {site.nom.split(" ")[0]} <span>{site.nom.split(" ").slice(1).join(" ")}</span>
            </Link>
            <p>{site.description}</p>
          </div>
          <div>
            <h2>Contact</h2>
            <ul className="footer-links">
              <li><a href={`tel:${site.telephone.replace(/\s/g, "")}`}>{site.telephone}</a></li>
              <li><a href={`mailto:${site.email}`}>{site.email}</a></li>
              <li><span>{site.adresse}</span></li>
            </ul>
          </div>
          <div>
            <h2>Navigation</h2>
            <ul className="footer-links">
              <li><Link href="/menu">Carte</Link></li>
              <li><Link href="/a-propos">À propos</Link></li>
              <li><Link href="/reservation">Réserver</Link></li>
              {/* Accès équipe : /admin affiche la connexion si besoin (middleware), sinon les réservations.
                  Pas de préchargement : la route admin n'a rien à faire sur les pages publiques. */}
              <li><Link href="/admin" prefetch={false}>Espace équipe</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} {site.nom}</span>
          <span>Conçu par Ndeye Penda Sarr</span>
        </div>
      </div>
    </footer>
  );
}
