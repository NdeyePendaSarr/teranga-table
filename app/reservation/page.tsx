import type { Metadata } from "next";
import { site, lienItineraire } from "@/content/site";
import { ReservationForm } from "@/components/ReservationForm";
import { RestaurantMap } from "@/components/RestaurantMap";

export const metadata: Metadata = {
  title: "Réserver une table",
  description: `Réservez votre table chez ${site.nom} en ligne. Confirmation rapide par téléphone ou WhatsApp.`,
};

/** Résultat d'un envoi sans JavaScript (redirection de l'API vers ?demande=…). */
const ISSUES = {
  envoyee: { role: "status", classe: "success", texte: "Demande envoyée ! Nous vous confirmons très vite, par e-mail ou par téléphone." },
  erreur: { role: "alert", classe: "error", texte: "Certains champs sont invalides. Vérifiez le formulaire, ou contactez-nous sur WhatsApp." },
  limite: { role: "alert", classe: "error", texte: "Trop de demandes depuis votre connexion. Réessayez plus tard, ou contactez-nous sur WhatsApp." },
} as const;

export default async function ReservationPage({
  searchParams,
}: {
  searchParams: Promise<{ demande?: string }>;
}) {
  const { demande } = await searchParams;
  const issue = demande && demande in ISSUES ? ISSUES[demande as keyof typeof ISSUES] : null;

  return (
    <>
      <div className="page-top container reveal">
        <p className="eyebrow">Réservation</p>
        <h1>Réserver une table</h1>
        <p>Remplissez le formulaire. Nous confirmons en général sous quelques heures.</p>
      </div>

      <section className="section" style={{ paddingTop: "0.5rem" }}>
        <div className="container">
          {issue ? (
            <div className={`form-message ${issue.classe} form-issue`} role={issue.role}>{issue.texte}</div>
          ) : null}
          <ReservationForm />

          <div className="contact-aside reveal">
            <div className="contact-pill">
              <p className="label">Téléphone</p>
              <a href={`tel:${site.telephone.replace(/\s/g, "")}`}>{site.telephone}</a>
            </div>
            <div className="contact-pill">
              <p className="label">Adresse</p>
              <span className="value">{site.adresse}</span>
            </div>
          </div>

          <div className="map-wrap reveal">
            {/* Adresse et itinéraire dans le HTML : utilisables sans la carte ni JavaScript */}
            <div className="map-infos">
              <p>
                <span className="label">Nous trouver</span>
                <span className="value">{site.adresseDetail}</span>
              </p>
              <a className="btn btn-primary btn-sm" href={lienItineraire()} target="_blank" rel="noopener noreferrer">
                Itinéraire
              </a>
            </div>
            <RestaurantMap />
          </div>
        </div>
      </section>
    </>
  );
}
