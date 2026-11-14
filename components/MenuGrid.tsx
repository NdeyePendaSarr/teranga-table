"use client";

import { useMemo, useState } from "react";
import { CATEGORIES, type CategorieId, type Plat } from "@/content/menu";

type Filtre = CategorieId | "all";

const FILTRES: { id: Filtre; label: string }[] = [
  { id: "all", label: "Tout" },
  ...CATEGORIES.map((c) => ({ id: c.id as Filtre, label: c.label })),
];

export function MenuGrid({ plats }: { plats: Plat[] }) {
  const [filtre, setFiltre] = useState<Filtre>("all");
  // Les cartes ne s'animent qu'après un changement de filtre : au premier
  // rendu (HTML serveur), elles sont affichées telles quelles, sans animation.
  const [aFiltre, setAFiltre] = useState(false);

  const visibles = useMemo(
    () => (filtre === "all" ? plats : plats.filter((p) => p.cat === filtre)),
    [filtre, plats]
  );
  const avecPhoto = visibles.filter((p) => p.img);
  const sansPhoto = visibles.filter((p) => !p.img);

  return (
    <>
      <div className="filters" role="group" aria-label="Filtrer par catégorie">
        {FILTRES.map((f) => (
          <button
            key={f.id}
            type="button"
            className={`filter-btn ${filtre === f.id ? "active" : ""}`}
            aria-pressed={filtre === f.id}
            onClick={() => {
              setFiltre(f.id);
              setAFiltre(true);
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div aria-live="polite">
        {visibles.length === 0 ? (
          <p className="empty-state">Aucun plat dans cette catégorie.</p>
        ) : null}

        {/* Plats avec une photo fidèle : cartes illustrées */}
        {avecPhoto.length > 0 ? (
          <div id="menu-grid" className="grid-3">
            {avecPhoto.map((p, i) => (
              // clé = filtre+nom pour rejouer l'animation card-enter au changement de filtre.
              // Décalage en cascade en CSS (variable --i), coupé par prefers-reduced-motion.
              <article
                className={aFiltre ? "card card-enter" : "card"}
                key={`${filtre}-${p.nom}`}
                style={aFiltre ? ({ "--i": Math.min(i, 8) } as React.CSSProperties) : undefined}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="card-img" src={p.img} alt={p.nom} loading="lazy" width={400} height={275} />
                <div className="card-body">
                  {/* h2 : la page Carte n'a pas d'autre titre entre le h1 et les plats */}
                  <h2>{p.nom}</h2>
                  <p>{p.desc}</p>
                  <p className="card-price">{p.prix}</p>
                </div>
              </article>
            ))}
          </div>
        ) : null}

        {/* Plats sans photo fidèle : liste façon carte de restaurant, plutôt
            qu'une photo d'un autre plat ou une carte vide */}
        {sansPhoto.length > 0 ? (
          <section className="menu-liste" aria-labelledby="menu-liste-titre">
            <h2 id="menu-liste-titre" className="menu-liste-titre">
              {avecPhoto.length > 0 ? "Également à la carte" : "À la carte"}
            </h2>
            <ul>
              {sansPhoto.map((p) => (
                <li className="plat-ligne" key={p.nom}>
                  <div className="plat-ligne-tete">
                    <h3>{p.nom}</h3>
                    <span className="plat-ligne-pointilles" aria-hidden="true" />
                    <p className="plat-ligne-prix">{p.prix}</p>
                  </div>
                  <p className="plat-ligne-desc">{p.desc}</p>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </>
  );
}
