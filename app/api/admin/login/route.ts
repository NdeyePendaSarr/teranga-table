import { NextResponse } from "next/server";
import { COOKIE, creerSession, motDePasseValide } from "@/lib/auth";
import { ipClient, limiter } from "@/lib/rateLimit";

export async function POST(req: Request) {
  // 5 tentatives / 15 min par IP : rend la force brute impraticable.
  const rl = limiter(`login:${ipClient(req)}`, 5, 15 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Trop de tentatives. Réessayez dans quelques minutes." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
    );
  }

  const { motDePasse } = await req.json().catch(() => ({ motDePasse: "" }));

  if (!motDePasseValide(String(motDePasse ?? ""))) {
    return NextResponse.json({ error: "Mot de passe incorrect." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, await creerSession(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 h
  });
  return res;
}
