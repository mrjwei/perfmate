# Base Design System

A **neutral, professional base design system** built to be used standalone *and* to be forked into brand-specific child systems. It is implemented around the **Tailwind CSS + shadcn/ui** token contract so that any project already using that stack can adopt or override it with zero translation.

> **Namespace:** `DesignSystem_9708b8` — in card/kit HTML, read components via `const { Button } = window.DesignSystem_9708b8`.

## Context

There is no external brand behind this system — it is the *default*. Every decision optimizes for **neutrality and re-skinnability**: hue-free greys, a single accent-restrained palette, a conventional type scale, and the exact semantic token names shadcn ships (`--background`, `--primary`, `--muted`, `--ring`, …). A child system re-skins by editing the **semantic aliases** in `tokens/colors.css` (and optionally the `--radius` and font knobs) — the component layer never hard-codes a colour.

**Sources:** none. This is an original, from-scratch base system. No codebase, Figma, or deck was provided.

---

## CONTENT FUNDAMENTALS

How copy is written across this system (labels, descriptions, empty states, marketing):

- **Voice:** plain, calm, professional. Favor clarity over personality. Never cute, never hype.
- **Person:** address the user as **you**; refer to the product/company as **we** sparingly. "You've used 92% of your quota."
- **Casing:** **Sentence case** everywhere — buttons, titles, menu items, table headers as overlines are the one exception (uppercase + wide tracking). Never Title Case buttons.
- **Tone of buttons:** verb-first, specific. "Save changes", "Upgrade", "View all" — not "Submit" or "OK".
- **Numbers & units:** concrete and compact. "$12 / mo", "2h ago", "+3".
- **Punctuation:** no exclamation marks in UI copy; periods on full-sentence descriptions, omitted on fragments/labels.
- **Emoji:** **never** in the base system. (A child brand may opt in, but the default is none.)
- **Status language:** Active / Pending / Failed / Draft — short, single words, paired with a colour-coded `Badge`.
- **Vibe:** the dependable interior of a serious B2B product. "Boring on purpose" so the content stands out, not the chrome.

---

## VISUAL FOUNDATIONS

- **Colour:** hue-free neutral greyscale (`--neutral-50…950`, oklch with chroma 0). The only saturated colours are status accents — blue (info), green (success), amber (warning), red (destructive) — used in small doses. Light and dark themes share one token contract; `.dark` on any ancestor flips them.
- **Primary:** near-black in light mode (`--neutral-900`), near-white in dark. High-emphasis actions are solid; everything else is bordered or ghost.
- **Type:** **Geist** (sans) + **Geist Mono**. A neutral grotesque — professional, legible, opinion-free. Headings are semibold with tight tracking (−0.02em); body is 16px / 1.5; overlines are uppercase 12px with +0.08em tracking.
- **Spacing:** strict **4px grid** (`--space-*`). Generous control padding, calm section rhythm.
- **Backgrounds:** flat fills only. No gradients, no imagery, no patterns or textures in the base. Surfaces separate via a 1px `--border` first, soft shadow second.
- **Borders:** 1px `--border` is the primary separator. It does most of the structural work; shadows are a secondary cue.
- **Shadows / elevation:** deliberately **soft and low-contrast** (`--shadow-xs…xl`), neutral black at low alpha. Cards use `sm`; popovers/dialogs use `lg`/`xl`. Never coloured shadows.
- **Corner radius:** driven by a single `--radius` knob (10px default) with derived `sm/md/lg/xl/2xl/full`. Controls use `md`, cards use `lg`, pills/avatars use `full`.
- **Cards:** `var(--card)` fill, 1px border, `--radius-lg`, `--shadow-sm`. No heavy elevation, no coloured left-border accents.
- **Animation:** quick and restrained. `--duration-fast 120ms` for hovers, `base 180ms` for toggles, `slow 260ms` for progress/width. Easing is `--ease-out` (cubic-bezier(0.16,1,0.3,1)). **No bounces, no decorative loops** (except the loading-Skeleton shimmer).
- **Hover states:** subtle background shift — ghost/outline pick up `--accent`; solid buttons darken ~12% via `color-mix`. Links drop to 0.8 opacity.
- **Press states:** a small `scale(0.98)` on buttons. No colour flash.
- **Focus:** a soft 3px ring in `--ring` (or `--destructive` on invalid fields), offset for buttons. Always visible for keyboard users.
- **Transparency / blur:** used sparingly — `color-mix` tints for status surfaces, semi-transparent borders in dark mode. No glassmorphism by default.
- **Imagery vibe:** none shipped; the system is image-free so child brands supply their own art direction.

---

## ICONOGRAPHY

- **Set:** **Lucide** (the icon set shadcn pairs with). 24×24 viewBox, **1.8–2px** stroke, round caps and joins, no fill. Outline style only.
- **Delivery:** icons are inlined as SVG `<path>` data inside components and kit screens (check, chevron, search, status glyphs, nav glyphs) so they inherit `currentColor` and need no runtime dependency. For broader coverage in production, install `lucide-react` or link Lucide from CDN — match the 1.8–2px outline weight.
- **Emoji:** never used as iconography.
- **Unicode glyphs:** not used as icons.
- **Logo:** `assets/logo-mark.svg` (rounded-square monogram) and `assets/logo-wordmark.svg` (mark + "Base"). Both are **monochrome `currentColor`**, so they recolour with text and work on light or dark. These are neutral placeholders — a child brand should replace them.

> **Substitution flag:** the closest-match icon paths are hand-inlined from the Lucide vocabulary rather than imported from a pinned Lucide package. If you want exact Lucide parity, point me at a `lucide-react` version and I'll align.

---

## VISUAL / FONT SUBSTITUTIONS (please confirm)

- **Fonts are loaded from Google Fonts CDN** (`tokens/fonts.css`), not self-hosted binaries — so the compiler reports 0 bundled `@font-face`. For offline/self-hosted use, supply Geist + Geist Mono `woff2` files and I'll swap the `@import` for local `@font-face` rules.

---

## INDEX / MANIFEST

Root:
- `styles.css` — **the single entry point** consumers link. `@import` lines only.
- `base.css` — minimal reset + element defaults bound to tokens.
- `readme.md` — this guide. · `SKILL.md` — Agent-Skills front-matter for Claude Code.

`tokens/`:
- `fonts.css` · `colors.css` (neutral scale + semantic aliases + `.dark`) · `typography.css` · `spacing.css` · `radius.css` · `elevation.css` (shadows + motion).

`components/` (read via `window.DesignSystem_9708b8`):
- `forms/` — Button, Input, Textarea, Label, Checkbox, Switch, RadioGroup, Select
- `display/` — Card (+Header/Title/Description/Content/Footer), Badge, Avatar, Separator
- `feedback/` — Alert, Progress, Skeleton
- `navigation/` — Tabs

`ui_kits/`:
- `console/` — a B2B admin console (sidebar, topbar, dashboard with stat cards + table, settings form). Interactive: switch sections, toggle light/dark, switch tabs. Composes the primitives — start here (`index.html`).

`guidelines/` — foundation specimen cards (Colors, Type, Spacing, Brand) shown in the Design System tab.

`assets/` — `logo-mark.svg`, `logo-wordmark.svg`.

Generated (do not edit): `_ds_bundle.js`, `_ds_manifest.json`, `_adherence.oxlintrc.json`.
