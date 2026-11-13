"use client";

import { useState } from "react";
import { CRENEAUX, HONEYPOT, MAX_PERSONNES, today } from "@/lib/validation";
import { lienWhatsApp } from "@/content/site";

type Etat =
  | { statut: "idle" | "envoi" | "ok" }
  | { statut: "erreur"; message: string };

export function ReservationForm() {
  const [etat, setEtat] = useState<Etat>({ statut: "idle" });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setEtat({ statut: "envoi" });
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? "Envoi impossible. Réessayez, ou contactez-nous sur WhatsApp.");
      }
      setEtat({ statut: "ok" });
      form.reset();
    } catch (err) {
      setEtat({ statut: "erreur", message: err instanceof Error ? err.message : "Une erreur est survenue." });
    }
  }

  return (
    // method/action : sans JavaScript, le navigateur envoie le formulaire en
    // POST à l'API, qui redirige vers /reservation?demande=… (rien dans l'URL).
    // Avec JavaScript, onSubmit prend la main et envoie du JSON.
    <form className="form-card reveal" id="formulaire" method="post" action="/api/reservations" onSubmit={onSubmit}>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="firstname">Prénom <span className="required">*</span></label>
          <input type="text" id="firstname" name="prenom" required autoComplete="given-name" placeholder="Aïda" />
        </div>
        <div className="form-group">
          <label htmlFor="lastname">Nom <span className="required">*</span></label>
          <input type="text" id="lastname" name="nom" required autoComplete="family-name" placeholder="Diop" />
        </div>
        <div className="form-group form-full">
          <label htmlFor="email">Email <span className="required">*</span></label>
          <input type="email" id="email" name="email" required autoComplete="email" placeholder="vous@email.com" />
        </div>
        <div className="form-group form-full">
          <label htmlFor="phone">Téléphone <span className="required">*</span></label>
          <input
            type="tel" id="phone" name="telephone" required autoComplete="tel"
            pattern="^(\+221|00221)?7[0-9]{8}$" placeholder="+221 77 000 00 00"
          />
          <p className="form-hint">Format sénégalais : 77 / 76 / 78 / 70…</p>
        </div>
        <div className="form-group">
          <label htmlFor="date">Date <span className="required">*</span></label>
          <input type="date" id="date" name="date" required min={today()} defaultValue={today()} />
        </div>
        <div className="form-group">
          <label htmlFor="time">Heure <span className="required">*</span></label>
          <select id="time" name="heure" required defaultValue="">
            <option value="" disabled>Choisir…</option>
            {CRENEAUX.map((h) => <option key={h}>{h}</option>)}
          </select>
        </div>
        <div className="form-group form-full">
          <label htmlFor="guests">Nombre de personnes <span className="required">*</span></label>
          <select id="guests" name="personnes" required defaultValue="2">
            {Array.from({ length: MAX_PERSONNES }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>{`${n} personne${n > 1 ? "s" : ""}`}</option>
            ))}
          </select>
          <p className="form-hint">Au-delà de {MAX_PERSONNES} personnes, contactez-nous directement.</p>
        </div>
        <div className="form-group form-full">
          <label htmlFor="message">Message (optionnel)</label>
          <textarea id="message" name="message" rows={3} placeholder="Allergies, anniversaire, préférence de table…" />
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
