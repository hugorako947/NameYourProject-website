// =============================================================================
// Fond animé du site (purement décoratif) — le style est dans globals.css
// (.site-bg). Sa couleur suit la vibe choisie : voir SearchForm → --glow.
// =============================================================================

export function SiteBackground() {
  return (
    <div aria-hidden className="site-bg">
      <span className="site-bg-vignette" />
      <span className="site-bg-glow" />
      <span className="site-bg-orb site-bg-orb--a" />
      <span className="site-bg-orb site-bg-orb--b" />
      <span className="site-bg-dots" />
    </div>
  );
}
