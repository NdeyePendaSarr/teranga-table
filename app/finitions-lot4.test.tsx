import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import { Footer } from "@/components/Footer";
import { site } from "@/content/site";

describe("pied de page : pas de lien vers un réseau social inexistant", () => {
  it("le restaurant est fictif : aucun lien Instagram, Facebook ou TikTok", () => {
    const html = renderToString(<Footer />);
    expect(html).not.toMatch(/instagram|facebook|tiktok/i);
    expect("instagram" in site).toBe(false);
  });
});
