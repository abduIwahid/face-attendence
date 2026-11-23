# DESIGN — Face Attendance System

## Rules (non-negotiable)
- Solid colours only. NO gradients, no purple/blue "AI glow", no glassmorphism.
- Near-black/white base + ONE accent (green — "present / verified" semantics).
- Depth from shadows only (4 levels below).
- No hardcoded colours in components — tokens only.
- Mobile-first: the primary device is a student's phone. Camera screens are designed phone-first.

## Palette tokens
| Token | 50 | 100 | 300 | 500 (base) | 700 | 900 |
|---|---|---|---|---|---|---|
| `--background` | #FFFFFF | #FAFAF9 | — | — | — | #0C0A09 (dark surface alt) |
| `--surface` | #FFFFFF | #F5F5F4 | #E7E5E4 | — | — | #1C1917 |
| `--border` | #F5F5F4 | #E7E5E4 | #D6D3D1 | #A8A29E | — | — |
| `--text-primary` | — | — | — | #1C1917 | — | #0C0A09 |
| `--text-secondary` | — | — | — | #57534E | #44403C | — |
| `--accent` (green) | #F0FDF4 | #DCFCE7 | #86EFAC | #22C55E | #15803D | #14532D |
| `--success` | #F0FDF4 | #DCFCE7 | #86EFAC | #16A34A | #166534 | #14532D |
| `--warning` | #FFFBEB | #FEF3C7 | #FCD34D | #D97706 | #92400E | #78350F |
| `--danger` | #FEF2F2 | #FEE2E2 | #FCA5A5 | #DC2626 | #991B1B | #7F1D1D |

Accent usage: primary buttons, MATCHED/PRESENT states, focus rings, active nav. Nothing else gets accent colour.

## Typography
- **Body/UI:** system stack — `"Helvetica Neue", Helvetica, Arial, sans-serif`. Zero load cost, native feel on phones; consistency is carried by the type scale, not a brand font. (Decision: no self-hosted font in v1 — camera pages must load fast.)
- **Display:** same stack, weight 700, tight tracking. One family total.
- Scale (px): 12 / 14 / 16 (base) / 20 / 24 / 32 / 40. Weights: 400 / 500 / 600 / 700. Line heights: 1.25 headings, 1.5 body.

## Spacing / radius / breakpoints
- Spacing: 4px base — 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64.
- Radius: 0 / 4 / 8 / 12 / 9999 (pills + the camera oval guide only).
- Breakpoints: 640 / 768 / 1024 / 1280. Layout: single column on phone; teacher table goes full-width ≥1024.
- Shadows: `--shadow-sm` 0 1px 2px rgb(0 0 0/.06); `--shadow-md` 0 4px 12px rgb(0 0 0/.08); `--shadow-lg` 0 12px 24px rgb(0 0 0/.10); `--shadow-xl` 0 24px 48px rgb(0 0 0/.12).

## CSS variables (drop into globals.css)
```css
:root{
  --background:#FFFFFF; --surface:#FFFFFF; --surface-muted:#F5F5F4;
  --border:#E7E5E4; --border-strong:#D6D3D1;
  --text-primary:#1C1917; --text-secondary:#57534E;
  --accent:#22C55E; --accent-strong:#15803D; --accent-soft:#F0FDF4;
  --success:#16A34A; --warning:#D97706; --danger:#DC2626;
  --shadow-sm:0 1px 2px rgb(0 0 0/.06); --shadow-md:0 4px 12px rgb(0 0 0/.08);
  --shadow-lg:0 12px 24px rgb(0 0 0/.10); --shadow-xl:0 24px 48px rgb(0 0 0/.12);
  --radius:8px;
}
```

## Tailwind mapping (as built — Tailwind v4, CSS-first; corrected 2026-11-23, session 05)
The app runs Tailwind v4: there is no `tailwind.config.ts`. The tokens above are mapped in `app/globals.css` via CSS variables + `@theme inline` (colours, shadows, font stack) — the v3 config snippet below is kept as the token reference only.

```ts
// Reference only (v3 idiom) — live mapping lives in app/globals.css.
theme: { extend: {
  colors: {
    background: "var(--background)", surface: "var(--surface)",
    "surface-muted": "var(--surface-muted)", border: "var(--border)",
    primary: "var(--text-primary)", secondary: "var(--text-secondary)",
    accent: { DEFAULT: "var(--accent)", strong: "var(--accent-strong)", soft: "var(--accent-soft)" },
    success: "var(--success)", warning: "var(--warning)", danger: "var(--danger)",
  },
  boxShadow: { sm: "var(--shadow-sm)", md: "var(--shadow-md)", lg: "var(--shadow-lg)", xl: "var(--shadow-xl)" },
  fontFamily: { sans: ['"Helvetica Neue"','Helvetica','Arial','sans-serif'] },
}}
```

## Component states (every component ships all applicable states)
| Component | States |
|---|---|
| Button | default (accent solid, white text) / hover (accent-strong) / focus-visible (2px accent ring, offset 2px) / disabled (surface-muted bg, secondary text) / loading (spinner + label kept, width fixed) |
| Input | default (border) / focus (accent border + ring) / error (danger border + message below) / disabled |
| Card | default (surface, border, shadow-sm) / interactive hover (shadow-md) |
| Modal | overlay solid rgb(0 0 0/.5); panel surface, radius 12, shadow-xl; Esc + overlay click close |
| Toast | success (accent-soft bg, success text) / error (danger soft bg) / info (surface-muted); auto-dismiss 4s, role="status" |
| Table | header surface-muted; row hover surface-muted; MATCHED/PRESENT = success text; FAILED = danger text; distance always shown with unit |
| Nav | default / active (accent text + 2px underline) / focus-visible ring |
| Camera view | states: requesting permission / denied (instructions) / no face / multiple faces / face locked (oval guide turns accent) / capturing |
| Empty state | icon + one-line reason + one action (e.g. "No attendance yet today — be the first to verify") |
| Skeleton | surface-muted blocks, pulse animation, same dimensions as real content |
| Error state | what failed + why if known + retry button; never a raw stack/error string |

## Icons
Lucide only (one library). No emoji as UI icons.

## Accessibility (WCAG AA)
- Contrast: text-primary on white ≈ 15.9:1; accent-strong (#15803D) on white ≈ 4.6:1 — use accent-strong (not accent) for text.
- Visible focus on everything interactive; full keyboard path for forms, table and export.
- Camera flow never relies on colour alone: match results are text + icon, not just a green oval.
- Alt text on all images; form labels always visible (no placeholder-only labels).
- Tap targets ≥ 44px tall (standing responsiveness rule; fluid `clamp()` sizing, no overflow 320–1920px).
