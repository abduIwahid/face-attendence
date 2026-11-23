# DESIGN — Face Attendance System

> **System change (2026-11-23, ADR-011):** Wadi ordered the frontend rebuilt
> from scratch in the Aurora design system ("face-attendance waly website ka
> frontend scratch se new bnaya, ye aurora ki puri library ko use kr ke").
> Aurora supersedes the stone/green system this file previously fixed
> (ADR-010). Tokens below are the Aurora baseline (library:
> `~/workspace/aurora-library/INDEX.md`), recreated in this project's own
> Tailwind stack — no MUI, no copied code or assets.

## Rules (non-negotiable)
- Solid colours only. NO gradients, no purple/blue "AI glow", no glassmorphism.
- White base + ONE accent (Aurora blue). Status colours (success/warning/danger) are semantics, not brand.
- Depth from the one soft layered shadow (Aurora's `sm` recipe, scaled for deeper levels).
- No hardcoded colours in components — tokens only.
- Mobile-first: the primary device is a student's phone. Camera screens are designed phone-first.

## Palette tokens (Aurora baseline)
| Token | Value | Role |
|---|---|---|
| `--background` | #FFFFFF | page background |
| `--surface` | #FFFFFF | cards, panels |
| `--surface-muted` | #F6F8FB | section bands, skeletons, table header |
| `--surface-filled` | #EDF2F8 | filled inputs (Aurora/MUI filled style) |
| `--surface-filled-hover` | #E4ECF5 | filled input hover |
| `--border` | #E5E7EB | card/input borders, dividers |
| `--border-strong` | #D0D7E2 | stronger dividers, camera oval fallback |
| `--text-primary` | #1B2124 | headings, body |
| `--text-secondary` | #4D595E | secondary text, labels |
| `--accent` | #3385F0 | primary buttons, links, active nav, focus rings |
| `--accent-strong` | #2B71CC | accent hover, accent text on white |
| `--accent-soft` | #EAF3FD | secondary buttons, icon chips, active sidenav |
| `--success` | #16A34A | PRESENT status (chips, result panel, stat card) |
| `--success-strong` | #166534 | success text on soft |
| `--success-soft` | #F0FDF4 | success fills |
| `--warning` | #D97706 | warning text |
| `--warning-soft` | #FFFBEB | warning fills |
| `--danger` | #DC2626 | FAILED status, errors |
| `--danger-soft` | #FEF2F2 | error fills |

Accent usage: primary buttons, links, active nav, focus rings, icon chips. Status colours appear only where a status is being reported (PRESENT/FAILED, match results, form errors).

## Typography
- **Family:** Plus Jakarta Sans for everything (Aurora's one typeface), weights 400/500/600/700/800, self-hosted via `next/font/google` (files are served from the app itself; no runtime font CDN).
- Scale (Aurora): H1 42px/700 · H2 32px/700 · H3 24px/700 · H4 18px/700 · body 14–16px/400, line-height ~1.5. The hero headline uses fluid `clamp()` sizing per the standing responsiveness rule.

## Spacing / radius / breakpoints
- Spacing rhythm (Aurora scale): 8 / 16 / 40 / 72 / 128, with 4/12/24 steps inside components.
- Radius: 8px on buttons, cards and inputs (Aurora); pills (9999) for chips and the camera oval guide only.
- Breakpoints: 640 / 768 / 1024 / 1280. Layout: single column on phone; teacher area switches to the sidenav shell ≥1024; the log table scrolls inside its own region below its natural width.
- Shadows (Aurora's layered `sm`, scaled): `--shadow-sm` 0 1px 2px rgb(27 33 36/.05), 0 4px 14px rgb(27 33 36/.05); `--shadow-md` adds 0 10px 24px /.07; `--shadow-lg` 0 16px 36px /.09; `--shadow-xl` 0 24px 48px /.12.

## CSS variables (live in app/globals.css)
```css
:root{
  --background:#FFFFFF; --surface:#FFFFFF; --surface-muted:#F6F8FB;
  --surface-filled:#EDF2F8; --surface-filled-hover:#E4ECF5;
  --border:#E5E7EB; --border-strong:#D0D7E2;
  --text-primary:#1B2124; --text-secondary:#4D595E;
  --accent:#3385F0; --accent-strong:#2B71CC; --accent-soft:#EAF3FD;
  --success:#16A34A; --success-strong:#166534; --success-soft:#F0FDF4;
  --warning:#D97706; --warning-soft:#FFFBEB;
  --danger:#DC2626; --danger-soft:#FEF2F2;
  --shadow-sm:0 1px 2px rgb(27 33 36/.05), 0 4px 14px rgb(27 33 36/.05);
  --shadow-md:0 2px 4px rgb(27 33 36/.05), 0 10px 24px rgb(27 33 36/.07);
  --shadow-lg:0 4px 8px rgb(27 33 36/.05), 0 16px 36px rgb(27 33 36/.09);
  --shadow-xl:0 24px 48px rgb(27 33 36/.12);
  --radius:8px;
}
```

## Tailwind mapping (as built — Tailwind v4, CSS-first)
The app runs Tailwind v4: there is no `tailwind.config.ts`. The tokens above are mapped in `app/globals.css` via CSS variables + `@theme inline` (colours incl. `field`/`field-hover` for filled inputs, shadows, and the font stack wired to the `--font-jakarta` variable that `app/layout.tsx` sets via `next/font/google`).

## Component states (every component ships all applicable states)
| Component | States |
|---|---|
| Button | primary (accent solid, white text) / hover (accent-strong) / secondary (accent-soft bg, accent-strong text) / focus-visible (2px accent ring) / disabled (surface-muted bg, secondary text) / loading (spinner + label kept) |
| Input | Aurora filled style: pale filled field, no border, floating label (label sits inside the field, floats to the top on focus/fill — `components/FloatingInput.tsx`) / hover (filled-hover) / focus (accent ring) / error (message below in danger) / disabled |
| Card | default (surface, 1px border, shadow-sm) / interactive hover (`.hover-lift`: lift + shadow-lg) |
| Stat card | label (uppercase, secondary) + big number (status colour for present/failed, primary for totals) |
| Table | header surface-muted, uppercase micro-labels; row hover surface-muted; PRESENT/FAILED as soft chips (success/danger); distance always shown with unit |
| Nav | landing: text links + Log in + primary CTA · teacher sidenav: active = accent-soft fill + accent-strong text; mobile = top bar + horizontal pill row |
| Auth | Aurora split-screen: branding panel (mark + check visual) left, open form column right (no card) |
| Camera view | states: requesting permission / denied (instructions) / no face / multiple faces / face locked (oval guide) / capturing |
| Empty state | icon + one-line reason + one action |
| Skeleton | surface-muted blocks, pulse animation, same dimensions as real content |
| Error state | what failed + why if known + retry button; never a raw stack/error string |
| Toast/result | PRESENT panel = success-soft + success text; FAILED panel = danger-soft + danger text; always text + icon, never colour alone |

## Icons
Lucide only (one library). No emoji as UI icons.

## Accessibility (WCAG AA)
- Contrast: text-primary on white ≈ 15.9:1; accent-strong (#2B71CC) on white ≈ 4.9:1 — accent text uses accent-strong; status text uses the strong variants on their soft fills.
- Visible focus on everything interactive; full keyboard path for forms, table and export.
- Camera flow never relies on colour alone: match results are text + icon, not just a coloured oval.
- Form labels always visible (floating labels are real `<label>` elements, never placeholder-only).
- Tap targets ≥ 44px tall (standing responsiveness rule; fluid `clamp()` sizing, no overflow 320–1920px).
