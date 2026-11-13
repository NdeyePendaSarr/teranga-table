import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { getDb } from "@/db";
import { reservations } from "@/db/schema";
import { HONEYPOT, reservationSchema } from "@/lib/validation";
import { estAdmin } from "@/lib/auth";
import { notifierDemandeRecue } from "@/lib/email";
import { ipClient, limiter } from "@/lib/rateLimit";

type Issue = "envoyee" | "erreur" | "limite";

/**
 * Public : enregistre une demande de réservation.
 *
 * Deux façons d'appeler cette route :
 * - avec JavaScript, le formulaire envoie du JSON et reçoit du JSON ;
 * - sans JavaScript, le navigateur envoie le formulaire HTML (POST encodé) :
 *   on répond par une redirection 303 vers /reservation?demande=… pour
 *   afficher le résultat, sans jamais mettre de donnée personnelle dans l'URL.
 */
export async function POST(req: Request) {
  const type = req.headers.get("content-type") ?? "";
  const formulaireHtml = type.includes("application/x-www-form-urlencoded") || type.includes("multipart/form-data");
  const retour = (issue: Issue) =>
    NextResponse.redirect(new URL(`/reservation?demande=${issue}#formulaire`, req.url), 303);

  // 5 demandes / 10 min par IP : protège la base et le quota d'emails Brevo.
  const rl = limiter(`resa:${ipClient(req)}`, 5, 10 * 60 * 1000);
  if (!rl.ok) {
    if (formulaireHtml) return retour("limite");
    return NextResponse.json(
      { error: "Trop de demandes. Réessayez plus tard ou contactez-nous sur WhatsApp." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
    );
  }

  let payload: unknown;
  try {
    payload = formulaireHtml ? Object.fromEntries((await req.formData()).entries()) : await req.json();
  } catch {
    if (formulaireHtml) return retour("erreur");
    return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 });
  }

  // Honeypot rempli → robot. On répond comme un succès sans rien enregistrer
  // ni envoyer, pour ne pas lui indiquer qu'il a été détecté.
  if (
    payload &&
    typeof payload === "object" &&
    String((payload as Record<string, unknown>)[HONEYPOT] ?? "").trim() !== ""
  ) {
    if (formulaireHtml) return retour("envoyee");
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  const parsed = reservationSchema.safeParse(payload);
  if (!parsed.success) {
    if (formulaireHtml) return retour("erreur");
    return NextResponse.json(
      { error: "Champs invalides.", details: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const { message, ...reste } = parsed.data;
  // Renvoie la ligne complète : on a besoin de l'email et des détails pour
  // l'accusé de réception.
  const [creee] = await getDb()
    .insert(reservations)
    .values({ ...reste, message: message || null })
    .returning();

  // Email au client confirmant la bonne réception de sa demande. Non
  // bloquant : un échec d'envoi ne compromet pas l'enregistrement.
  await notifierDemandeRecue(creee);

  if (formulaireHtml) return retour("envoyee");
  return NextResponse.json({ ok: true, id: creee.id }, { status: 201 });
}

/** Admin : liste les réservations, les plus récentes d'abord. */
export async function GET() {
  if (!(await estAdmin())) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }
  const lignes = await getDb()
    .select()
    .from(reservations)
    .orderBy(desc(reservations.creeLe));
  return NextResponse.json({ reservations: lignes });
}
