import Link from "next/link";
import { site, lienWhatsApp } from "@/content/site";
import { signatures } from "@/content/menu";

const avis = [
  "« Le meilleur thiéb que j'ai mangé à Mbour depuis longtemps. Accueil chaleureux, assiettes généreuses. »",
  "« Service impeccable et yassa parfait. On a réservé pour un anniversaire, tout était soigné. »",
];

export default function AccueilPage() {
  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <p className="eyebrow" style={{ color: "#fcd34d" }}>Restaurant · Mbour</p>
          <h1>{site.slogan}</h1>
          <p>{site.description}</p>
          <div className="hero-actions">
            <Link href="/menu" className="btn btn-primary">Voir la carte</Link>
            <Link href="/reservation" className="btn btn-outline">Réserver une table</Link>
          </div>
          <div className="hero-meta">
            <div><strong>Adresse</strong><span>{site.adresse}</span></div>
            <div><strong>Ouvert</strong><span>Lun – Dim</span></div>
            <div><strong>Réservation</strong><span>{site.telephone}</span></div>
          </div>
        </div>
      </section>

      {/* Signatures */}
      <section className="section">
        <div className="container">
          <div className="section-header reveal">
            <p className="eyebrow">À la carte</p>
            <h2>Nos signatures</h2>
            <p>Trois plats qui définissent l'esprit de la maison — tradition et précision.</p>
          </div>
          <div className="grid-3 reveal-group">
            {signatures.map((p) => (
              <article className="card reveal" key={p.nom}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="card-img" src={p.img} alt={p.nom} width={400} height={275} loading="lazy" />
                <div className="card-body">
                  <h3>{p.nom}</h3>
                  <p>{p.desc}</p>
                  <p className="card-price">{p.prix}</p>
                </div>
              </article>
            ))}
          </div>
          <p className="reveal" style={{ textAlign: "center", marginTop: "2.5rem" }}>
            <Link href="/menu" className="btn btn-outline-dark">Toute la carte →</Link>
          </p>
        </div>
      </section>

      {/* Témoignages */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header reveal">
            <p className="eyebrow">Avis</p>
            <h2>Ce qu'ils en disent</h2>
            <p>Avis fictifs : Teranga Table est un restaurant imaginaire, créé pour ce projet.</p>
          </div>
          <div className="testimonials reveal-group">
            {avis.map((t, i) => (
              <figure className="testimonial reveal" key={i}>
                <blockquote>{t}</blockquote>
                <footer>— {i === 0 ? "Aïda Diop" : "Mamadou Ndiaye"}, client·e</footer>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section section-dark">
        <div className="container reveal" style={{ textAlign: "center", maxWidth: "560px" }}>
          <p className="eyebrow" style={{ color: "#fcd34d" }}>Réservation</p>
          <h2 style={{ color: "white", margin: "0.5rem 0 1rem", fontSize: "clamp(1.8rem,4vw,2.4rem)" }}>
            Une table vous attend
          </h2>
          <p style={{ color: "#a8a29e", marginBottom: "2rem" }}>
            Réservez en ligne ou écrivez-nous sur WhatsApp. Confirmation rapide.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "center" }}>
            <Link href="/reservation" className="btn btn-primary">Réserver en ligne</Link>
            <a href={lienWhatsApp()} className="btn btn-outline" target="_blank" rel="noopener noreferrer">WhatsApp</a>
          </div>
        </div>
      </section>
    </>
  );
}
