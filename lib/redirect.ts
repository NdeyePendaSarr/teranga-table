/**
 * Valide une destination de redirection lue dans l'URL (?suite=...).
 * N'accepte que les chemins internes ("/admin", "/admin/x?y=1") : refuse les
 * URL absolues ("https://..."), protocol-relative ("//site.com"), les
 * variantes avec antislash ("/\site.com") et les caractères de contrôle,
 * pour éviter une redirection ouverte.
 */
export function cheminInterne(suite: string | null | undefined, defaut = "/admin"): string {
  if (!suite) return defaut;
  if (!suite.startsWith("/")) return defaut;
  if (suite.startsWith("//") || suite.startsWith("/\\")) return defaut;
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u001f\u007f]/.test(suite)) return defaut;
  return suite;
}
