# Styling Template 

This document extracts the visual language of the authentication pages (`/login`, `/register`) into a reusable template so the rest of FoodOrder can share the same styling. It is a reference for the frontend owner (Member 5 coordinates shared-style edits) and for anyone building menu, cart, checkout or order screens.

Source of truth:

- `client/src/index.css` — all styles live in one global stylesheet (Tailwind is imported, but the UI currently uses hand-written component classes).
- `client/src/pages/Login/index.tsx` — single-column auth form.
- `client/src/pages/Register/index.tsx` — two-column auth form with full-width fields.
- `client/src/components/auth/AuthShowcase.tsx` — decorative brand panel.
- `client/src/layouts/AuthLayout.tsx` — auth shell wrapper.

Rules:

- Keep using plain semantic class names (`.auth-card`, `.field`, `.button`) rather than inline arbitrary Tailwind utilities. Mixing both makes the design inconsistent.
- Add new shared classes in `client/src/index.css`; do not create per-page stylesheets unless a page needs truly local art.
- Auth pages are the visual benchmark: warm cream background, terracotta primary, editorial serif headings, soft rounded cards.

---

## 1. Design tokens

These values are already used by the auth pages. Promote them to CSS custom properties (see section 7) so every page references the same palette.

### Colour palette

| Token | Value | Usage |
| --- | --- | --- |
| `--color-bg` | `#fbf8f2` | Page and auth shell background |
| `--color-surface` | `#ffffff` | Cards, panels, placed content |
| `--color-surface-warm` | `#fffdf9` | Input background |
| `--color-surface-muted` | `#fffaf4` | Secondary buttons, pills, cart chip |
| `--color-surface-accent` | `#fdf2e6` | Radial highlight on form panel |
| `--color-cream` | `#fff4df` | Text and art on the terracotta panel |
| `--color-primary` | `#9b3f27` | Primary buttons, links, brand mark |
| `--color-primary-hover` | `#7f3220` | Primary hover |
| `--color-primary-deep` | `#7c2f1e` | Showcase gradient middle |
| `--color-primary-deeper` | `#5f2417` | Showcase gradient end |
| `--color-accent` | `#9b4e36` | Eyebrows and kickers |
| `--color-accent-soft` | `#f0c49b` | Eyebrow on dark showase |
| `--color-text` | `#29241e` | Headings and body text |
| `--color-text-muted` | `#746d62` | Subtitles, helper copy |
| `--color-text-soft` | `#928b80` | Footnotes, small labels |
| `--color-label` | `#4b4238` | Form labels |
| `--color-placeholder` | `#a89f92` | Input placeholders |
| `--color-border` | `#eee8dd` | Card and panel borders |
| `--color-border-input` | `#e6dacb` | Input borders |
| `--color-border-warm` | `#dfc4a7` | Hover border on cards |
| `--color-focus` | `#c28155` | Focus outline and input focus ring |
| `--color-error` | `#b23a2a` | Error text |
| `--color-error-border` | `#c0392b` | Invalid input border |
| `--color-notice-border` | `#c39349` | Notice left border |
| `--color-notice-bg` | `#fbf5e9` | Notice background |
| `--color-success-leaf` | `#7e8a59` | Decorative leaves |
| `--color-success-leaf-alt` | `#96a06c` | Decorative leaves |

### Typography

| Role | Font | Size | Notes |
| --- | --- | --- | --- |
| Body | `Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif` | `0.9rem`–`0.94rem` | Set on `:root`; line-height `1.6`–`1.75` |
| Display / H1 | `Georgia, "Times New Roman", serif` | `clamp(2.8rem, 6vw, 5rem)` | Weight `500`, `letter-spacing: -0.055em` |
| Auth title | Georgia serif | `clamp(1.8rem, 2.6vw, 2.35rem)` | Weight `500`, `letter-spacing: -0.04em` |
| Section H2 | Georgia serif | `1.65rem` (auth showcase: `clamp(2.2rem, 3.8vw, 3.5rem)`) | Weight `500` |
| Eyebrow / kicker | Inter | `0.66rem`–`0.68rem` | Uppercase, weight `750`, `letter-spacing: 0.12em`–`0.14em` |
| Label | Inter | `0.82rem` | Weight `700` |
| Input | Inter | `0.9rem` | Inherits body font |
| Helper / error | Inter | `0.75rem` | Error line-height `1.35` |
| Footnote | Inter | `0.72rem` | `letter-spacing: 0.02em` |

### Spacing, radius, elevation, motion

| Token | Value | Usage |
| --- | --- | --- |
| Radius small | `0.6rem` | Inputs |
| Radius control | `0.65rem` | Buttons |
| Radius card | `1.15rem` | Auth card |
| Radius panel | `1.3rem` | Hero and large surfaces |
| Radius pill | `99px` | Cart chip, status pills |
| Shadow card | `0 24px 60px rgba(88, 52, 30, 0.09)` | Auth card |
| Shadow art | `0 24px 60px rgba(40, 16, 8, 0.35)` | Showcase plate |
| Focus ring | `0 0 0 3px rgba(194, 129, 85, 0.18)` | Input focus |
| Transition | `0.15s ease` | Border, shadow, background, transform |

Layout scale comes from `clamp()`: page padding `clamp(1rem, 5vw, 5rem)`, card padding `clamp(1.5rem, 3vw, 2.25rem)`, section padding `clamp(2rem, 4vw, 3.5rem)`.

---

## 2. Auth page layout template

The auth route uses two nested wrappers, both reusable for any full-height split screen.

```tsx
<main className="auth-shell">
  <section className="auth-page">
    <AuthShowcase eyebrow="..." title="..." description="..." />
    <div className="auth-form-panel">
      <div className="auth-card">...</div>
    </div>
  </section>
</main>
```

- `.auth-page` — `display: grid; grid-template-columns: 1.05fr 1fr; height: 100dvh; overflow: hidden;` The left column is decorative, the right column is the form.
- `.auth-form-panel` — centers the card, allows vertical scrolling, paints a radial cream highlight: `radial-gradient(circle at 100% 0%, #fdf2e6 0, #fbf8f2 45%)`.
- `.auth-card` — `width: min(28rem, 100%)`, white surface, soft border and shadow. Register uses `.auth-card-wide` (`min(42rem, 100%)`).
- `.auth-showcase` — terracotta gradient panel with oversized circles and a plate illustration. It is fully decorative (`aria-hidden` on the art) and hidden below `900px`.

Non-auth pages should not reuse `.auth-page`; they belong in `.page-shell`. Only reuse `.auth-card`-style surfaces (see section 6).

---

## 3. Form recipe

The auth form is the canonical form template for checkout, login and profile screens.

```tsx
<form className="auth-form" onSubmit={handleSubmit} noValidate>
  <div className="auth-field">
    <label className="auth-label" htmlFor="email">Email address</label>
    <input
      className="auth-input"
      id="email"
      name="email"
      type="email"
      autoComplete="email"
      aria-invalid={Boolean(errors.email)}
      aria-describedby={errors.email ? 'email-error' : undefined}
    />
    {errors.email ? (
      <p className="auth-error" id="email-error" role="alert">{errors.email}</p>
    ) : null}
  </div>

  <button className="auth-submit" type="submit">Log in</button>
</form>
```

For multi-column layouts add `.auth-form-grid` to the form and `.auth-field-full` to each field that must span both columns (used by the terms checkbox and submit button on Register).

Component classes:

| Class | Purpose |
| --- | --- |
| `.auth-form` | Vertical flex stack, `gap: 0.9rem` |
| `.auth-form-grid` | Two-column grid, `gap: 0.85rem 1rem` |
| `.auth-field` | Label + control + error column, `gap: 0.35rem` |
| `.auth-field-full` | `grid-column: 1 / -1` |
| `.auth-label` | Bold `0.82rem` label |
| `.auth-input` | Full-width warm-white input with focus and invalid states |
| `.auth-error` | Red `0.75rem` message |
| `.auth-submit` | Full-width terracotta button, hover darkens, active nudges down `1px` |
| `.auth-terms` | Checkbox row with muted copy |
| `.auth-checkbox` | `1rem` square, `accent-color: #9b3f27` |

Interaction states:

- Input focus: `border-color: #c28155` and `box-shadow: 0 0 0 3px rgba(194, 129, 85, 0.18)`.
- Input invalid: `border-color: #c0392b` via `[aria-invalid="true"]`; always pair with `aria-describedby` and `role="alert"`.
- Global keyboard focus: `:focus-visible { outline: 3px solid #c28155; outline-offset: 3px; }`.
- Buttons: `transition: background 0.15s ease, transform 0.15s ease`.
- Links: `.auth-link` is terracotta and underlined on hover; `.text-link` is the smaller global equivalent.

---

## 4. Typography recipe

```tsx
<p className="auth-kicker">Welcome back</p>
<h1 className="auth-title">Log in to SwiftBite</h1>
<p className="auth-subtitle">Sign in to access your account and continue ordering.</p>
```

- `.auth-kicker` / `.eyebrow` / `.auth-eyebrow` — all uppercase micro-labels. Use `.eyebrow` on light pages, `.auth-eyebrow` only on the dark showcase.
- `.auth-title` — card-level display heading (Georgia, `500`, tight tracking).
- `.auth-subtitle` — muted supporting sentence, max one or two lines.
- Section headings outside auth use `h2 { font-family: Georgia }` at `1.65rem`; large hero copy uses the global `h1` clamp.
- Never use pure black; the darkest text is `#29241e`.

---

## 5. Supporting patterns

### Card / surface

```css
.card-surface {
  border: 1px solid #eee8dd;
  border-radius: 1.15rem;
  background: #fff;
  box-shadow: 0 24px 60px rgba(88, 52, 30, 0.09);
  padding: clamp(1.5rem, 3vw, 2.25rem);
}
```

Existing equivalents: `.panel` (760px max, 1rem radius), `.area-card` (0.85rem radius, hover lift), `.auth-card`.

### Notice / inline message

Reuse `.notice` (global) or `.auth-notice` for a softer inline variant. Both use a `3px` left border in `#c39349`, background `#fbf5e9`, and a bold first line.

### Pills and chips

`border: 1px solid` warm border, `border-radius: 99px`, warm-white background, small bold text. Existing: `.status-pill`, `.cart-link`.

### Decorative art

The plate + leaf motif (`.auth-plate`, `.auth-leaf`, `.plate`, `.leaf`) is the brand illustration. Reuse the same shapes, rotation (`-12deg` to `-14deg`) and cream/olive palette for empty states, hero panels and 404 art. Always mark purely decorative nodes `aria-hidden="true"`.

### Brand mark

`.brand-mark` is a `2.1rem` rounded square with a Georgia italic `f`, terracotta on cream. On dark panels `.auth-brand .brand-mark` inverts to cream on terracotta.

---

## 6. Integrating the template across the project

### Recommended mapping

| Auth class | Promote to shared class | Existing global class to align with |
| --- | --- | --- |
| `.auth-card` | `.card-surface` | `.panel`, `.area-card` |
| `.auth-title` | `.display-title` | `h1`, `h2` |
| `.auth-kicker` | `.eyebrow` | `.eyebrow` |
| `.auth-subtitle` | `.lede` | `.hero-copy > p` |
| `.auth-input` | `.field-input` | — |
| `.auth-label` | `.field-label` | — |
| `.auth-field` | `.field` | — |
| `.auth-error` | `.field-error` | — |
| `.auth-submit` | `.button.primary` | `.button.primary` |
| `.auth-link` | `.text-link` | `.text-link` |
| `.auth-notice` | `.notice` | `.notice` |

Keep `.auth-page`, `.auth-showcase`, `.auth-art`, `.auth-brand` and `.auth-card-wide` auth-only. They define a split-screen composition that does not fit inside `.page-shell`.

### Applying to feature pages

- **Menu (`/meals`)** — `.page-shell` + section heading + `.area-grid`-style responsive grid. Meal cards use the `.area-card` recipe (white surface, `0.85rem` radius, `hover translateY(-2px)`), a `0.66rem` uppercase task/meta label, Georgia title, muted body copy and a `.text-link` call to action.
- **Cart** — use `.card-surface` list rows with dividers in `#eee8dd`; quantity controls and totals use `.button` variants; totals emphasis uses `.auth-title`-sized Georgia type sparingly.
- **Checkout** — reuse the full form recipe (`.auth-form`, `.auth-field`, `.auth-input`, `.auth-error`, `.auth-submit`). Single-column form inside a `.card-surface`; limit width to `min(42rem, 100%)`.
- **Orders / Order details** — same surface + eyebrow + muted metadata combo. Status is a `.status-pill`; timeline nodes use the leaf/terracotta accent.
- **404 / empty states** — `.panel` + `.eyebrow` + large serif heading + `.button.primary`, optionally with the plate illustration.

Page skeleton for a new feature route:

```tsx
<section className="page-shell">
  <header className="section-heading">
    <div>
      <p className="eyebrow">Menu</p>
      <h2>Choose your next meal</h2>
    </div>
    <span className="status-pill">Available today</span>
  </header>

  <div className="area-grid">{/* cards */}</div>
</section>
```

---

## 7. Proposed token layer

Add these variables to `client/src/index.css` and replace repeated literals progressively. Values are taken directly from the existing auth styles.

```css
:root {
  --font-body: Inter, ui-sans-serif, system-ui, -apple-system,
    BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-display: Georgia, "Times New Roman", serif;

  --color-bg: #fbf8f2;
  --color-surface: #fff;
  --color-surface-warm: #fffdf9;
  --color-surface-muted: #fffaf4;
  --color-cream: #fff4df;

  --color-primary: #9b3f27;
  --color-primary-hover: #7f3220;
  --color-accent: #9b4e36;
  --color-accent-soft: #f0c49b;

  --color-text: #29241e;
  --color-text-muted: #746d62;
  --color-text-soft: #928b80;
  --color-label: #4b4238;

  --color-border: #eee8dd;
  --color-border-input: #e6dacb;
  --color-focus: #c28155;

  --color-error: #b23a2a;
  --color-error-border: #c0392b;

  --radius-input: 0.6rem;
  --radius-control: 0.65rem;
  --radius-card: 1.15rem;
  --radius-panel: 1.3rem;
  --radius-pill: 99px;

  --shadow-card: 0 24px 60px rgba(88, 52, 30, 0.09);
  --focus-ring: 0 0 0 3px rgba(194, 129, 85, 0.18);
  --transition-base: 0.15s ease;
}
```

Example refactor: `.auth-input` becomes `border: 1px solid var(--color-border-input); background: var(--color-surface-warm); border-radius: var(--radius-input);`, `:focus` uses `var(--color-focus)` and `var(--focus-ring)`, and `[aria-invalid="true"]` uses `var(--color-error-border)`.

Do this incrementally, one component family at a time, and verify with `npm run build` after each pass. Do not rename existing classes across pages in one sweep; add the shared class first, migrate call sites, then remove the auth-specific duplicate.

---

## 8. Responsive rules

Breakpoints currently defined (`client/src/index.css`):

| Breakpoint | Behaviour |
| --- | --- |
| `max-width: 900px` | Auth split collapses to one column, showcase hides, form panel takes `min-height: 100dvh`; `.area-grid` drops to 2 columns; hero becomes `1fr 0.8fr` |
| `max-width: 700px` | Header wraps, nav scrolls horizontally; hero becomes single column |
| `max-width: 640px` | Register form grid becomes one column; auth card padding drops to `1.35rem` |
| `max-width: 480px` | Grids become one column; footer and status stacks vertically |
| `min-width: 901px and max-height: 780px` | Auth card compresses: title `1.7rem`, tighter paddings and gaps |

Guidelines:

- Prefer `clamp()` for fluid type and spacing over adding breakpoints.
- Collapse two-column forms at `640px`; collapse split layouts at `900px`.
- Keep tap targets at least `2.4rem` tall (buttons are `0.82rem` padding).
- Respect `min-width: 320px` set on `body`.

---

## 9. Accessibility requirements

- Every input needs a visible `<label>` with a matching `htmlFor`/`id`; do not rely on placeholders.
- Invalid inputs set `aria-invalid="true"` and reference the error with `aria-describedby`.
- Error messages use `role="alert"` so screen readers announce them.
- Section landmarks use `aria-labelledby` pointing at the page title (`login-title`, `register-title`).
- Decorative art is `aria-hidden="true"`; the brand link keeps readable text.
- Never remove the global `:focus-visible` outline; it is the primary keyboard affordance.
- Maintain contrast: terracotta `#9b3f27` on cream `#fff4df` and `#29241e` on `#fbf8f2` are the approved combinations.

---

## 10. Migration checklist

- [ ] Add the token layer to `client/src/index.css`.
- [ ] Introduce shared aliases (`.field-input`, `.field-label`, `.card-surface`, `.display-title`, `.lede`) alongside the existing auth classes.
- [ ] Migrate `Login` and `Register` to the shared aliases; keep the auth layout classes unchanged.
- [ ] Apply the card and heading recipe to `Home`, `Meals`, `Cart`, `Checkout`, `Orders`, `OrderDetails` and `NotFound`.
- [ ] Reuse the form recipe for Checkout fields.
- [ ] Replace raw colour literals in new code with tokens.
- [ ] Verify responsive behaviour at `900px`, `700px`, `640px` and `480px`.
- [ ] Run `npm run lint`, `npm run typecheck` and `npm run build` from `client/`.
- [ ] Confirm no feature route is described as working ordering behaviour until its assigned task exists.

---

## 11. Reference

| Selector | Location |
| --- | --- |
| Auth section (`/* Auth pages */`) | `client/src/index.css:433` |
| `.auth-shell` | `client/src/index.css:434` |
| `.auth-page` | `client/src/index.css:438` |
| `.auth-showcase` | `client/src/index.css:445` |
| `.auth-eyebrow` | `client/src/index.css:494` |
| `.auth-art` / `.auth-plate` | `client/src/index.css:517` |
| `.auth-form-panel` | `client/src/index.css:576` |
| `.auth-card` / `.auth-card-wide` | `client/src/index.css:583` |
| `.auth-kicker` | `client/src/index.css:594` |
| `.auth-title` | `client/src/index.css:602` |
| `.auth-form` / `.auth-form-grid` | `client/src/index.css:632` |
| `.auth-input` | `client/src/index.css:656` |
| `.auth-error` | `client/src/index.css:680` |
| `.auth-submit` | `client/src/index.css:686` |
| `.auth-switch` / `.auth-link` | `client/src/index.css:707` |
| Auth responsive rules | `client/src/index.css:735` |
| Global primitives (`.brand`, `.button`, `.panel`, `.notice`, `:focus-visible`) | `client/src/index.css:38`–`381` |
| Login page markup | `client/src/pages/Login/index.tsx` |
| Register page markup | `client/src/pages/Register/index.tsx` |
| Showcase component | `client/src/components/auth/AuthShowcase.tsx` |
