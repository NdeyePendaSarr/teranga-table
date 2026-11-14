import { describe, it, expect } from "vitest";
import { site } from "@/content/site";

describe("redirection de l'ancienne adresse", () => {
  it("restaurant-template-five-pi.vercel.app redirige définitivement vers l'adresse actuelle, chemin conservé", async () => {
    const { default: config } = await import("../next.config");
    const regles = (await config.redirects?.()) ?? [];
    const regle = regles.find((r) => r.has?.some((h) => h.type === "host" && h.value === "restaurant-template-five-pi.vercel.app"));
    expect(regle).toBeDefined();
    expect(regle!.source).toBe("/:path*");
    expect(regle!.destination).toBe(`${site.url}/:path*`);
    expect(regle!.permanent).toBe(true);
    expect(new URL(site.url).host).toBe("teranga-table.vercel.app");
  });
});
