"use client";

import { useState } from "react";
import { CRENEAUX, HONEYPOT, MAX_PERSONNES, today } from "@/lib/validation";
import { lienWhatsApp } from "@/content/site";
import { erreursParChamp, resumeErreurs, type Erreurs, type IdChamp } from "@/lib/erreursFormulaire";

type Etat =
  | { statut: "idle" | "envoi" | "ok" }
  | { statut: "erreur"; message: string };

// Motif du téléphone, côté navigateur : mobile sénégalais (9 chiffres commençant
// par 7), indicatif +221 ou 00221 facultatif, espaces et points tolérés entre
// les chiffres. Même règle que le serveur (lib/validation.ts), qui retire les
// espaces et les points avant de vérifier.
const MOTIF_TELEPHONE = "(\\+221|00221)?[\\s.]*7([\\s.]*[0-9]){8}";
const AIDE_TELEPHONE = "9 chiffres commençant par 7, avec ou sans +221 (ex. 77 123 45 67)";

export function ReservationForm() {
  const [etat, setEtat] = useState<Etat>({ statut: "idle" });
  const [erreurs, setErreurs] = useState<Erreurs>({});

  /** Attributs d'accessibilité d'un champ : aide et erreur reliées, état invalide. */
  function a11y(id: IdChamp, avecAide = false) {
    const ids = [avecAide ? `aide-${id}` : "", erreurs[id] ? `erreur-${id}` : ""].filter(Boolean);
    return {
      "aria-describedby": ids.length ? ids.join(" ") : undefined,
      "aria-invalid": erreurs[id] ? true : undefined,
    };
  }
  const erreur = (id: IdChamp) =>
    erreurs[id] ? <p className="form-erreur" id={`erreur-${id}`}>{erreurs[id]}</p> : null;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setEtat({ statut: "envoi" });
    setErreurs({});
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const parChamp = erreursParChamp(body?.details);
        if (Object.keys(parChamp).length > 0) {
          // Erreurs de validation : message sous chaque champ, résumé annoncé,
          // et focus sur le premier champ à corriger.
          setErreurs(parChamp);
          setEtat({ statut: "erreur", message: resumeErreurs(parChamp) });
          const premier = form.querySelector<HTMLElement>(
            Object.keys(parChamp).map((id) => `#${id}`).join(", ")
          );
          premier?.focus();
          return;
        }
        throw new Error(body?.error ?? "Envoi impossible. Réessayez, ou contactez-nous sur WhatsApp.");
      }
      setEtat({ statut: "ok" });
      form.reset();
    } catch (err) {
      setEtat({ statut: "erreur", message: err instanceof Error ? err.message : "Une erreur est survenue." });
    }
  }

  /** Dès que l'utilisateur corrige un champ, son erreur disparaît. */
  function onInput(e: React.FormEvent<HTMLFormElement>) {
    const id = (e.target as HTMLElement).id as IdChamp;
    if (erreurs[id]) setErreurs((e) => Object.fromEntries(Object.entries(e).filter(([k]) => k !== id)));
  }

  return (
    // method/action : sans JavaScript, le navigateur envoie le formulaire en
    // POST à l'API, qui redirige vers /reservation?demande=… (rien dans l'URL).
    // Avec JavaScript, onSubmit prend la main et envoie du JSON.
    <form className="form-card reveal" id="formulaire" method="post" action="/api/reservations" onSubmit={onSubmit} onInput={onInput}>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="firstname">Prénom <span className="required">*</span></label>
          <input type="text" id="firstname" name="prenom" required autoComplete="given-name" placeholder="Aïda" {...a11y("firstname")} />
          {erreur("firstname")}
        </div>
        <div className="form-group">
          <label htmlFor="lastname">Nom <span className="required">*</span></label>
          <input type="text" id="lastname" name="nom" required autoComplete="family-name" placeholder="Diop" {...a11y("lastname")} />
          {erreur("lastname")}
        </div>
        <div className="form-group form-full">
          <label htmlFor="email">Email <span className="required">*</span></label>
          <input type="email" id="email" name="email" required autoComplete="email" placeholder="vous@email.com" {...a11y("email")} />
          {erreur("email")}
        </div>
        <div className="form-group form-full">
          <label htmlFor="phone">Téléphone <span className="required">*</span></label>
          <input
            type="tel" id="phone" name="telephone" required autoComplete="tel"
            pattern={MOTIF_TELEPHONE} title={AIDE_TELEPHONE} placeholder="+221 77 000 00 00"
            {...a11y("phone", true)}
          />
          <p className="form-hint" id="aide-phone">Format sénégalais : 77 / 76 / 78 / 70…</p>
          {erreur("phone")}
        </div>
        <div className="form-group">
          <label htmlFor="date">Date <span className="required">*</span></label>
          <input type="date" id="date" name="date" required min={today()} defaultValue={today()} {...a11y("date")} />
          {erreur("date")}
        </div>
        <div className="form-group">
          <label htmlFor="time">Heure <span className="required">*</span></label>
          <select id="time" name="heure" required defaultValue="" {...a11y("time")}>
            <option value="" disabled>Choisir…</option>
            {CRENEAUX.map((h) => <option key={h}>{h}</option>)}
          </select>
          {erreur("time")}
        </div>
        <div className="form-group form-full">
          <label htmlFor="guests">Nombre de personnes <span className="required">*</span></label>
          <select id="guests" name="personnes" required defaultValue="2" {...a11y("guests", true)}>
            {Array.from({ length: MAX_PERSONNES }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>{`${n} personne${n > 1 ? "s" : ""}`}</option>
            ))}
          </select>
          <p className="form-hint" id="aide-guests">Au-delà de {MAX_PERSONNES} personnes, contactez-nous directement.</p>
          {erreur("guests")}
        </div>
        <div className="form-group form-full">
          <label htmlFor="message">Message (optionnel)</label>
          <textarea id="message" name="message" rows={3} placeholder="Allergies, anniversaire, préférence de table…" {...a11y("message")} />
          {erreur("message")}
        </div>
      </div>

      {/* Champ piège anti-robots : masqué aux humains et aux lecteurs d'écran. */}
      <div aria-hidden="true" style={{ position: "absolute", left: "-10000px", width: 1, height: 1, overflow: "hidden" }}>
        <label htmlFor={HONEYPOT}>Ne pas remplir</label>
        <input type="text" id={HONEYPOT} name={HONEYPOT} tabIndex={-1} autoComplete="off" />
      </div>

      <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "1.25rem", padding: "1rem" }} disabled={etat.statut === "envoi"}>
        {etat.statut === "envoi" ? "Envoi en cours…" : "Confirmer la réservation"}
      </button>

      {etat.statut === "ok" && (
        <div className="form-message success" role="status">
          Réservation envoyée ! Nous vous confirmons très vite.
        </div>
      )}
      {etat.statut === "erreur" && (
        <div className="form-message error" role="alert">{etat.message}</div>
      )}

      <p className="form-hint" style={{ textAlign: "center", marginTop: "1rem" }}>
        Ou réservez directement sur{" "}
        <a href={lienWhatsApp()} style={{ color: "var(--gold-text)", fontWeight: 600 }} target="_blank" rel="noopener noreferrer">WhatsApp</a>
      </p>
    </form>
  );
}
