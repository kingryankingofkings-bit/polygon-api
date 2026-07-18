// @app:user-owned — brand identity. Edit freely. `site.ts` re-exports
// siteName/siteDescription; `manifest.ts` + `opengraph-image.tsx` read `brandVisual`.

export const siteName = 'Babylon The Path Publishing';
export const siteDescription =
  'AI-powered publishing services for independent authors. Manuscript analysis, ISBN registration, formatting, and bookstore distribution.';

// PWA + social-share colors. HEX only (the oklch() tokens in globals.css aren't
// readable here) — set to match your brand seed.
export const brandVisual = {
  /** PWA browser-UI / status-bar color. */
  themeColor: '#b45309',
  /** PWA splash + install background. */
  backgroundColor: '#fefcf8',
  /** Social-share (OG/Twitter) image. */
  og: {
    background: '#1c1208',
    foreground: '#fef3c7',
    /** Second line under the site name; '' hides it. */
    tagline: 'AI-powered publishing services for independent authors',
  },
} as const;
