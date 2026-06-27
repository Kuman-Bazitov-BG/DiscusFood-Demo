// ─────────────────────────────────────────────────────────────
//  Demo / test-mode configuration.
//  Enabled by setting VITE_DEMO_MODE=true in the demo deployment's
//  environment (Netlify). In production this stays unset/false, so
//  none of the demo UI shows.
// ─────────────────────────────────────────────────────────────

/** True when the app runs as the public portfolio DEMO (test mode). */
export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true'

/** Stripe test card surfaced in the demo banner so visitors can try checkout. */
export const DEMO_TEST_CARD = '4242 4242 4242 4242'
