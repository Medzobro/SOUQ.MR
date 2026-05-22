# SOUQ.MR — Design System & UI Reference

This file is the **single source of truth** for the SOUQ.MR marketplace UI/UX. Any new page, component, or feature MUST follow this design language.

The full reference React implementation is saved at: `design-reference/souq-mr-ui.jsx` — refer to it for exact markup, class names, and interactions.

#[[file:../../design-reference/souq-mr-ui.jsx]]

---

## 1. Brand Identity

- **Name:** SOUQ.MR
- **Tagline (AR):** السوق المحلي الأول في موريتانيا
- **Language:** Arabic-first (RTL). All user-facing text is in Arabic. Use `direction: rtl; text-align: right;` for content blocks.
- **Currency:** MRU (أوقية موريتانية)
- **Locale focus:** Mauritania (cities: نواكشوط، نواذيبو، روصو، ...)

## 2. Color Palette (Dark Theme)

```js
const theme = {
  bg:        "#0A0A0F",  // Page background
  bgCard:    "#12121A",  // Card background
  bgCard2:   "#1A1A26",  // Elevated card
  accent:    "#FF6B35",  // Primary orange (CTAs, highlights)
  accent2:   "#FFB347",  // Secondary orange (gradients)
  gold:      "#F0C040",  // Gold accent (logo gradient, hover)
  text:      "#F0EDE8",  // Primary text
  textMuted: "#8A8799",  // Secondary text, labels
  border:    "#2A2A3A",  // Borders, dividers
  green:     "#2ECC71",  // Success, verified badges
};
```

**Signature gradient:** `linear-gradient(135deg, #FF6B35, #FFB347)` for primary buttons.
**Logo gradient:** `linear-gradient(135deg, #FF6B35, #F0C040)` (orange → gold), text-clipped.

## 3. Typography

- **UI / Body:** `'Cairo', sans-serif` (weights 300, 400, 600, 700, 900)
- **Display / Logo / Numbers:** `'Bebas Neue', sans-serif` (logo, hero title, stat numbers)
- Both loaded from Google Fonts.
- **Hero title size:** `clamp(56px, 10vw, 96px)`, line-height 0.95, letter-spacing 2px.

## 4. Layout Patterns

- **Top Nav (`.nav`):** Fixed, blurred translucent (`rgba(10,10,15,0.85)` + `backdrop-filter: blur(20px)`), 1px bottom border. Hidden on `auth` page.
- **Bottom Nav (`.bottom-nav`):** Fixed mobile-style nav with 5 items. Center "+" button is elevated (`margin-top: -20px`) with the orange gradient. Hidden on `auth` page.
- **Hero:** Full-viewport (`min-height: 100vh`), radial gradient background + subtle 40px grid overlay at 4% opacity. Right-side floating stat cards (hidden on mobile ≤700px).
- **Sections:** `padding: 60px 20px`. Section headers have RTL Arabic title with the keyword in `${theme.accent}` color, plus a "see all" link on the left.
- **Page bottom padding:** Always reserve `paddingBottom: 80px` to clear the bottom nav.

## 5. Component Conventions

### Buttons
- `.btn-primary` — orange gradient, white text, 50px radius, glow shadow on hover.
- `.btn-outline` — transparent with border, hover turns gold.
- `.btn-nav` — small ghost button in top nav.
- `.btn-chat` — small pill with `rgba(255,107,53,0.1)` tint, used inside cards.

### Cards
- All cards: `background: bgCard`, `border: 1px solid border`, `border-radius: 16-20px`.
- Hover: `transform: translateY(-3px to -4px)` + accent border + shadow.
- Product cards have a 180px image header with `product-badge` (top-right) and `product-fav` heart button (top-left).

### Forms (Auth)
- Inputs: full-width, RTL, `bg: theme.bg`, 12px radius, focus ring `0 0 0 3px rgba(255,107,53,0.1)`.
- Tab switcher: pill toggle with active gradient background.
- Role selector: 2-column grid (مشتري / بائع) with icon + label.

### Badges
- `.product-badge` — solid accent orange pill.
- `.verified-badge` — green tinted pill `✅ موثق`.
- `.hero-badge` — orange tinted pill with pulsing dot animation.

## 6. Pages (Routing State)

The app uses a single `page` state in the root `App` component. Pages:

| Page key | Component | Description |
|---|---|---|
| `home` | `HomePage` | Hero, search, categories grid, products grid |
| `auth` | `AuthPage` | Login / Register tabs, role selector, phone+password |
| `store` | `StorePage` | Cover, profile, stats, tabs (products / about / reviews) |
| `product` | `ProductPage` | Gallery, details, tags, description, seller mini-card, CTAs |

Bottom nav `+` button → `auth` page (post-auth would go to "add listing").

## 7. Categories (Seed)

```
📱 إلكترونيات | 🚗 سيارات | 👕 ملابس | 🏠 عقارات | 🔧 خدمات | 🛋️ أثاث
```

Cats grid: 6 columns desktop, 3 columns mobile (≤700px).

## 8. Iconography

- Currently uses **emoji** as visual icons (📱🚗🏠💬⭐ etc.) — do NOT replace with icon libraries unless explicitly requested. Emojis match the playful, local feel.

## 9. Accessibility & RTL Rules

- All Arabic text blocks need `direction: rtl; text-align: right;`.
- Numbers (prices, stats) stay LTR — keep them in Bebas Neue or bold Cairo.
- Phone input placeholder: `🇲🇷  +222 XX XX XX XX`.

## 10. Responsive Breakpoints

Single breakpoint at `max-width: 700px`:
- `.cats-grid` → 3 columns
- `.hero-stats` → hidden
- `.hero-title` → 56px

---

**When asked to add a new page or feature:** match the established card style, color palette, RTL rules, and typography exactly. Reuse existing CSS classes from the reference file where possible.
