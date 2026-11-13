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
              {site.instagram ? (
                <li><a href={site.instagram} target="_blank" rel="noopener noreferrer">Instagram</a></li>
              ) : null}
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
