# Plan – Landing Page Refresh

## Status legend
- `[ ]` not started
- `[p]` in progress
- `[d]` done
- `[b]` blocked
- `[r]` in review
- `[t]` testing/QA
- `[h]` on hold

## Goals
- Build a simple, scrollable landing page (hero, features, metrics, CTA, footer) with reliable animations.
- Use existing MUI + Framer motion patterns; keep it lightweight and responsive.

## Tasks
1. `[d]` Hero: static heading/subtext + CTA, subtle background shape; remove fragile animations.
2. `[d]` Features: 3–4 cards (icon + title + copy) with robust fade-in on scroll (`initial/whileInView` + viewport options).
3. `[d]` Metrics/secondary section: small stats row to break up page and show scroll continuity.
4. `[d]` CTA band near footer: button linking to signup/login.
5. `[d]` Animation reliability: use per-element triggers (no parent-dependent variants that leave opacity 0); tune viewport thresholds.
6. `[d]` Theming/responsiveness: consistent spacing, works on mobile/desktop; ensure assets load (no leading-space paths).
