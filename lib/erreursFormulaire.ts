/**
 * Erreurs par champ du formulaire de réservation.
 *
 * L'API répond en 422 avec `details` au format zod `flatten().fieldErrors` :
 * { telephone: ["message"], date: ["message"] }. On relie chaque nom de champ
 * de l'API à l'identifiant du champ dans le formulaire, pour afficher le
 * message sous le bon champ et le lui associer (aria-describedby, aria-invalid).
 */

/** Nom de champ côté API → identifiant du champ dans le formulaire. */
export const CHAMPS = {
  prenom: "firstname",
  nom: "lastname",
  email: "email",
  telephone: "phone",
  date: "date",
  heure: "time",
  personnes: "guests",
  message: "message",
} as const;

export type IdChamp = (typeof CHAMPS)[keyof typeof CHAMPS];

/** Libellé affiché de chaque champ (repris des <label> du formulaire). */
export const LIBELLES: Record<IdChamp, string> = {
  firstname: "Prénom",
  lastname: "Nom",
  email: "Email",
  phone: "Téléphone",
  date: "Date",
  time: "Heure",
  guests: "Nombre de personnes",
  message: "Message",
};

export type Erreurs = Partial<Record<IdChamp, string>>;

/** Garde le premier message de chaque champ connu ; ignore tout le reste. */
export function erreursParChamp(details: unknown): Erreurs {
  const erreurs: Erreurs = {};
  if (!details || typeof details !== "object") return erreurs;
  for (const [api, id] of Object.entries(CHAMPS) as [keyof typeof CHAMPS, IdChamp][]) {
    const messages = (details as Record<string, unknown>)[api];
    if (Array.isArray(messages) && typeof messages[0] === "string" && messages[0]) {
      erreurs[id] = messages[0];
    }
  }
  return erreurs;
}

/** Phrase annoncée aux lecteurs d'écran : « 2 champs à corriger : Téléphone, Date. » */
export function resumeErreurs(erreurs: Erreurs): string {
  const ids = (Object.keys(LIBELLES) as IdChamp[]).filter((id) => erreurs[id]);
  const n = ids.length;
  return `${n} champ${n > 1 ? "s" : ""} à corriger : ${ids.map((id) => LIBELLES[id]).join(", ")}.`;
}
