---
name: Kinetic Engineering
colors:
  surface: '#10141a'
  surface-dim: '#10141a'
  surface-bright: '#353940'
  surface-container-lowest: '#0a0e14'
  surface-container-low: '#181c22'
  surface-container: '#1c2026'
  surface-container-high: '#262a31'
  surface-container-highest: '#31353c'
  on-surface: '#dfe2eb'
  on-surface-variant: '#bcc8d0'
  inverse-surface: '#dfe2eb'
  inverse-on-surface: '#2d3137'
  outline: '#86929a'
  outline-variant: '#3d484f'
  surface-tint: '#6dd2ff'
  primary: '#96dcff'
  on-primary: '#003547'
  primary-container: '#00c6ff'
  on-primary-container: '#004f67'
  inverse-primary: '#006685'
  secondary: '#d2bbff'
  on-secondary: '#3e008e'
  secondary-container: '#6800e4'
  on-secondary-container: '#d2bbff'
  tertiary: '#28f280'
  on-tertiary: '#003918'
  tertiary-container: '#00d36c'
  on-tertiary-container: '#005427'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#bfe9ff'
  primary-fixed-dim: '#6dd2ff'
  on-primary-fixed: '#001f2a'
  on-primary-fixed-variant: '#004d65'
  secondary-fixed: '#eaddff'
  secondary-fixed-dim: '#d2bbff'
  on-secondary-fixed: '#25005a'
  on-secondary-fixed-variant: '#5900c6'
  tertiary-fixed: '#62ff96'
  tertiary-fixed-dim: '#00e475'
  on-tertiary-fixed: '#00210b'
  on-tertiary-fixed-variant: '#005226'
  background: '#10141a'
  on-background: '#dfe2eb'
  surface-variant: '#31353c'
typography:
  display-lg:
    fontFamily: Space Grotesk
    fontSize: 64px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-sm:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  code-sm:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: 0.1em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
  container-max: 1280px
---

## Brand & Style

This design system is built for a high-performance developer portfolio, blending the utility of a flight cockpit with the sleekness of modern technical SaaS. The brand personality is precise, authoritative, and unapologetically technical. It is designed to evoke a sense of digital craftsmanship and engineering rigor.

The aesthetic follows a **Technical Minimalism** approach combined with **Cyber-Glassmorphism**. Key characteristics include:
- **Precision-Driven Layouts:** Every pixel serves a structural purpose, utilizing high-contrast dividers and monospaced indicators to suggest a data-rich environment.
- **Luminous Glassmorphism:** Surfaces use deep, translucent layers that maintain legibility while providing a sense of depth and modernism.
- **Neon-Linear Accents:** Interactive elements utilize 1px strokes and electric gradients to simulate high-tech instrumentation.

## Colors

The palette is rooted in a deep "Obsidian Blue" base, providing a high-contrast canvas for electric primary accents.

- **Surface Strategy:** The background (`#05070f`) is the foundation. Surface elements use `#0d1117` with semi-transparency to allow background textures or gradients to subtly bleed through.
- **Functional Accents:** The Electric Cyan (`#00c6ff`) is reserved for primary actions, progress indicators, and active states. Deep Violet (`#7b2ff7`) is used for secondary visual interest and depth in gradients.
- **Feedback Loop:** Success and Warning colors are highly saturated to ensure instant recognition against the dark backdrop, mimicking dashboard alert systems.

## Typography

The typographic hierarchy prioritizes clarity and technical flair.

- **Headlines:** Space Grotesk provides a geometric, futuristic feel for large headers. Letter spacing should be tightened slightly for larger sizes.
- **Body:** Inter is used for all long-form text to ensure maximum readability and a professional SaaS aesthetic.
- **Labels & Data:** JetBrains Mono is the workhorse for all metadata, status badges, and code snippets. Use the `label-caps` style for section headers and navigational labels to reinforce the "instrument panel" look.

## Layout & Spacing

The layout is built on a rigid 12-column grid system that emphasizes alignment and technical structure.

- **Grid Model:** Use a fluid grid with a maximum container width of 1280px. Gutters are fixed at 24px to maintain consistent "air" between high-contrast cards.
- **Sectioning:** Divide the page into clear, bordered modules. Use horizontal and vertical rules (1px, color: `#1a212e`) to separate content sections, mimicking blueprint lines.
- **Mobile Adaptation:** On mobile, columns collapse to a single stack. Reduce side margins to 16px and utilize horizontal scrolling for data tables or code blocks to preserve information density without breaking the layout.

## Elevation & Depth

This system avoids traditional shadows in favor of **Luminance and Border-Depth**.

- **Surface Tiers:** 
  - Tier 1 (Base): `#05070f`
  - Tier 2 (Card): `#0d1117` with a 1px solid border of `#1a212e`.
  - Tier 3 (Interactive): Hovering over a card increases the border brightness to the Primary color (`#00c6ff`) and adds a subtle `box-shadow: 0 0 15px rgba(0, 198, 255, 0.15)`.
- **Backdrop Blur:** Use `backdrop-filter: blur(12px)` on all floating or overlapping elements (navbars, modals) to maintain the glassmorphism effect.

## Shapes

The shape language is sharp and industrial. While the base `roundedness` is set to `1` (Soft - 4px), many structural elements should remain at `0` (Sharp) to convey engineering precision.

- **Buttons & Inputs:** Use 4px corner radius.
- **Section Dividers & Container Outlines:** Use 0px (Sharp) corners.
- **Status Indicators:** Small circles (full round) are permissible only for "Live" or "Active" status dots to contrast against the otherwise angular UI.

## Components

- **Buttons:**
  - **Primary:** Solid `#00c6ff` or Gradient background with black text. Sharp 4px corners.
  - **Ghost:** 1px Primary color border with transparent background. On hover, apply a subtle cyan outer glow.
- **Technical Cards:** 
  - Background: `#0d1117` at 80% opacity. 
  - Header: Top border in secondary color (`#7b2ff7`) with a monospaced "Serial Number" or "Index" in the top right corner.
- **Inputs:** 
  - Dark background (`#05070f`), 1px border. Focus state changes border to Primary color with a "scanning" line animation if possible.
- **Status Badges:** 
  - Use `label-caps` typography. Backgrounds should be low-opacity versions of the status color (e.g., 10% Success color) with a 1px solid border of the full-opacity color.
- **Progress Bars:** 
  - Ultra-thin (2px - 4px height). Background track: `#1a212e`. Fill: Primary-to-Secondary gradient.