"use client";

import { useState } from "react";

type Props = {
  id: string;
  label: string;
  value: string;
  onChange: (valeur: string) => void;
  autoFocus?: boolean;
};

/**
 * Champ mot de passe avec un bouton « œil » pour afficher ou masquer la
 * saisie. Le bouton est un vrai bouton (type="button", jamais soumis),
 * nommé pour les lecteurs d'écran, avec son état (aria-pressed).
 */
export function ChampMotDePasse({ id, label, value, onChange, autoFocus }: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>
      <div className="champ-mdp">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          autoComplete="current-password"
          autoFocus={autoFocus}
        />
        <button
          type="button"
          className="champ-mdp-oeil"
          aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          aria-pressed={visible}
          aria-controls={id}
          onClick={() => setVisible((v) => !v)}
        >
          {visible ? (
            // Œil barré : la saisie est visible, le bouton la masquera
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3l18 18" />
              <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
              <path d="M9.4 5.3A10.4 10.4 0 0 1 12 5c5 0 8.6 3.5 10 7-.5 1.2-1.3 2.4-2.3 3.5M6.2 6.2C4.3 7.6 2.9 9.6 2 12c1.4 3.5 5 7 10 7 1.6 0 3.1-.4 4.4-1" />
            </svg>
          ) : (
            // Œil ouvert : la saisie est masquée, le bouton l'affichera
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 12c1.4-3.5 5-7 10-7s8.6 3.5 10 7c-1.4 3.5-5 7-10 7S3.4 15.5 2 12Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
