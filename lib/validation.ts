import { z } from "zod";

/** Nom du champ piège du formulaire (invisible pour un humain, rempli par les robots). */
export const HONEYPOT = "site_web";

/** Nombre maximum de couverts réservables en ligne. */
export const MAX_PERSONNES = 20;

/** Créneaux de réservation proposés (service midi et soir). */
export const CRENEAUX = [
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "19:00",
  "19:30",
  "20:00",
  "20:30",
  "21:00",
  "21:30",
] as const;

// Mobile sénégalais : 9 chiffres commençant par 7, préfixe international
// optionnel. Les espaces sont tolérés puis retirés avant validation.
const telephoneRegex = /^(\+221|00221)?7\d{8}$/;

export const reservationSchema = z.object({
  prenom: z.string().trim().min(1, "Prénom requis").max(80),
  nom: z.string().trim().min(1, "Nom requis").max(80),
  email: z.email("Email invalide").max(160),
  telephone: z
    .string()
    .transform((v) => v.replace(/[\s.]/g, ""))
    .pipe(z.string().regex(telephoneRegex, "Numéro sénégalais invalide (ex. 77 123 45 67)")),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide")
    .refine((d) => d >= today(), "La date ne peut pas être dans le passé"),
  heure: z.enum(CRENEAUX, { message: "Choisis un créneau proposé" }),
  personnes: z.coerce
    .number()
    .int()
    .min(1, "Au moins 1 personne")
    .max(MAX_PERSONNES, `Pour plus de ${MAX_PERSONNES} personnes, appelle-nous directement`),
  message: z.string().trim().max(500).optional().or(z.literal("")),
});

export type ReservationInput = z.infer<typeof reservationSchema>;

/** Date du jour au format ISO (yyyy-mm-dd), en heure locale. */
export function today(d = new Date()): string {
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
}
