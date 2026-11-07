/**
 * Limiteur de débit simple, en mémoire, par clé (ex. "login:<ip>").
 * Fenêtre fixe : au plus `max` requêtes par `fenetreMs`.
 *
 * Limite connue : en serverless (Vercel), chaque instance a sa propre
 * mémoire — la protection est « au mieux ». Pour une limite globale, brancher
 * un store partagé (ex. Upstash Redis) derrière la même interface.
 */
type Compteur = { nb: number; reset: number };

const compteurs = new Map<string, Compteur>();

export type Resultat = { ok: boolean; retryAfter: number };

export function limiter(
  cle: string,
  max: number,
  fenetreMs: number,
  maintenant = Date.now()
): Resultat {
  // Nettoyage opportuniste pour éviter que la Map grossisse indéfiniment.
  if (compteurs.size > 5000) {
    for (const [k, c] of compteurs) if (c.reset <= maintenant) compteurs.delete(k);
  }

  const c = compteurs.get(cle);
  if (!c || c.reset <= maintenant) {
    compteurs.set(cle, { nb: 1, reset: maintenant + fenetreMs });
    return { ok: true, retryAfter: 0 };
  }
  c.nb += 1;
  if (c.nb > max) {
    return { ok: false, retryAfter: Math.ceil((c.reset - maintenant) / 1000) };
  }
  return { ok: true, retryAfter: 0 };
}

/** Vide les compteurs (tests uniquement). */
export function reinitialiserLimites(): void {
  compteurs.clear();
}

/** IP du client derrière le proxy Vercel / un reverse proxy. */
export function ipClient(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "inconnue";
}
