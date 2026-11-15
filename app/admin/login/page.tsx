"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { cheminInterne } from "@/lib/redirect";
import { ChampMotDePasse } from "@/components/ChampMotDePasse";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const suite = cheminInterne(params.get("suite"));
  const [motDePasse, setMotDePasse] = useState("");
  const [erreur, setErreur] = useState("");
  const [envoi, setEnvoi] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEnvoi(true);
    setErreur("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ motDePasse }),
    });
    if (res.ok) {
      router.replace(suite);
      router.refresh();
    } else {
      const body = await res.json().catch(() => ({}));
      setErreur(body?.error ?? "Mot de passe incorrect.");
      setEnvoi(false);
    }
  }

  return (
    <form className="form-card login-card" onSubmit={onSubmit}>
      <ChampMotDePasse id="mdp" label="Mot de passe administrateur" value={motDePasse} onChange={setMotDePasse} autoFocus />
      {erreur && <div className="form-message error">{erreur}</div>}
      <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "1rem" }} disabled={envoi}>
        {envoi ? "Connexion…" : "Se connecter"}
      </button>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <>
      <div className="page-top container">
        <p className="eyebrow">Espace équipe</p>
        <h1>Connexion</h1>
      </div>
      <section className="section" style={{ paddingTop: "1rem" }}>
        <div className="container">
          <Suspense><LoginForm /></Suspense>
        </div>
      </section>
    </>
  );
}
