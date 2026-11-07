import type { Reservation } from "@/db/schema";
import { site } from "@/content/site";
import { echapperHtml } from "@/lib/html";

const KEY = process.env.BREVO_API_KEY;
// Adresse expéditeur VÉRIFIÉE dans Brevo (Senders). Le nom affiché par défaut
// reprend le nom du restaurant.
const FROM_EMAIL = process.env.EMAIL_FROM;
const FROM_NAME = process.env.EMAIL_FROM_NAME ?? site.nom;

type Variante = "recue" | "confirmee" | "annulee";

/** "2026-08-20" → "20 août 2026". */
function jolieDate(iso: string): string {
  const mois = [
    "janvier", "février", "mars", "avril", "mai", "juin",
    "juillet", "août", "septembre", "octobre", "novembre", "décembre",
  ];
  const [a, m, j] = iso.split("-").map(Number);
  return `${j} ${mois[m - 1]} ${a}`;
}

/** Sujet + textes propres à chaque type d'email. */
function contenu(r: Reservation, variante: Variante) {
  // Le prénom vient du formulaire public : on l'échappe avant de l'insérer
  // dans le HTML de l'email (anti-injection / phishing).
  const prenom = echapperHtml(r.prenom);
  switch (variante) {
    case "recue":
      return {
        sujet: `Demande de réservation reçue — ${site.nom}`,
        titre: "Demande reçue 📩",
        intro: `Merci ${prenom}, nous avons bien reçu votre demande de réservation.`,
        clore: "Nous revenons vers vous très vite pour la confirmer. Pour toute question, contactez-nous directement.",
      };
    case "confirmee":
      return {
        sujet: `Réservation confirmée — ${site.nom}`,
        titre: "Votre table est confirmée ✅",
        intro: `Bonne nouvelle ${prenom} — nous vous attendons !`,
        clore: "Au plaisir de vous recevoir. En cas d'empêchement, prévenez-nous.",
      };
    case "annulee":
      return {
        sujet: `Réservation annulée — ${site.nom}`,
        titre: "Réservation annulée",
        intro: `Bonjour ${prenom}, votre réservation n'a malheureusement pas pu être retenue.`,
        clore: "Pour trouver un autre créneau, répondez à cet email ou écrivez-nous sur WhatsApp.",
      };
  }
}

function gabarit(r: Reservation, c: ReturnType<typeof contenu>): string {
  const or = "#a86518";
  const charcoal = "#17211c";

  return `<!doctype html><html lang="fr"><body style="margin:0;background:#faf5ec;font-family:Arial,Helvetica,sans-serif;color:${charcoal}">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#faf5ec;padding:32px 16px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #efe4d2">
        <tr><td style="background:${charcoal};padding:24px 28px">
          <span style="color:#fff;font-size:20px;font-weight:700">${site.nom.split(" ")[0]} <span style="color:${or}">${site.nom.split(" ").slice(1).join(" ")}</span></span>
        </td></tr>
        <tr><td style="padding:28px">
          <h1 style="margin:0 0 12px;font-size:22px;color:${charcoal}">${c.titre}</h1>
          <p style="margin:0 0 20px;line-height:1.6">${c.intro}</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#faf5ec;border-radius:12px;padding:16px;margin-bottom:20px">
            <tr><td style="padding:6px 12px;color:#8a7d6f;font-size:13px">Date</td><td style="padding:6px 12px;font-weight:700;text-align:right">${echapperHtml(jolieDate(r.date))}</td></tr>
            <tr><td style="padding:6px 12px;color:#8a7d6f;font-size:13px">Heure</td><td style="padding:6px 12px;font-weight:700;text-align:right">${echapperHtml(r.heure)}</td></tr>
            <tr><td style="padding:6px 12px;color:#8a7d6f;font-size:13px">Personnes</td><td style="padding:6px 12px;font-weight:700;text-align:right">${echapperHtml(r.personnes)}</td></tr>
          </table>
          <p style="margin:0 0 8px;line-height:1.6">${c.clore}</p>
          <p style="margin:20px 0 0;font-size:13px;color:#8a7d6f">${site.nom} · ${site.adresseDetail}<br>${site.telephone}</p>
        </td></tr>
      </table>
      <p style="max-width:520px;margin:16px auto 0;font-size:12px;color:#8a7d6f">Cet email vous est envoyé suite à votre demande de réservation chez ${site.nom}.</p>
    </td></tr>
  </table></body></html>`;
}

/**
 * Envoie un email au client via Brevo. Ne lève jamais : un échec d'envoi ne
 * doit pas faire échouer l'action appelante (on logge seulement).
 */
async function envoyer(r: Reservation, variante: Variante): Promise<void> {
  if (!KEY || !FROM_EMAIL) {
    console.warn("[email] BREVO_API_KEY ou EMAIL_FROM absent — email non envoyé.");
    return;
  }

  const c = contenu(r, variante);
  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": KEY,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        sender: { name: FROM_NAME, email: FROM_EMAIL },
        to: [{ email: r.email, name: `${r.prenom} ${r.nom}` }],
        subject: c.sujet,
        htmlContent: gabarit(r, c),
      }),
    });
    if (!res.ok) {
      console.error("[email] Brevo a répondu", res.status, await res.text().catch(() => ""));
    }
  } catch (err) {
    console.error("[email] envoi échoué :", err);
  }
}

/**
 * Notifie le client d'un changement de statut (confirmée / annulée).
 * Appelée depuis la route PATCH admin (app/api/reservations/[id]/route.ts).
 */
export async function notifierClient(r: Reservation): Promise<void> {
  if (r.statut !== "confirmee" && r.statut !== "annulee") return;
  await envoyer(r, r.statut === "confirmee" ? "confirmee" : "annulee");
}

/**
 * Envoie l'accusé de réception juste après la soumission d'une demande.
 * Appelée depuis la route POST publique (app/api/reservations/route.ts).
 */
export async function notifierDemandeRecue(r: Reservation): Promise<void> {
  await envoyer(r, "recue");
}