/**
 * Échappe les caractères spéciaux HTML d'une valeur saisie par l'utilisateur
 * avant de l'insérer dans un gabarit HTML (emails). Empêche l'injection de
 * balises ou de liens dans les messages envoyés au nom du restaurant.
 */
export function echapperHtml(valeur: unknown): string {
  return String(valeur ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
