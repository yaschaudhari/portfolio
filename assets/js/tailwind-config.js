/* Shared Tailwind (Play CDN) config — mirrors Stitch DESIGN.md tokens.
   Load AFTER the Tailwind CDN script on every page. */
tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#10141a",
        surface: "#10141a",
        "surface-dim": "#10141a",
        "surface-bright": "#353940",
        "surface-container-lowest": "#0a0e14",
        "surface-container-low": "#181c22",
        "surface-container": "#1c2026",
        "surface-container-high": "#262a31",
        "surface-container-highest": "#31353c",
        "surface-variant": "#31353c",
        "on-surface": "#dfe2eb",
        "on-surface-variant": "#bcc8d0",
        "on-background": "#dfe2eb",
        "inverse-surface": "#dfe2eb",
        outline: "#86929a",
        "outline-variant": "#3d484f",
        "surface-tint": "#6dd2ff",
        primary: "#96dcff",
        "on-primary": "#003547",
        "primary-container": "#00c6ff",
        "on-primary-container": "#004f67",
        secondary: "#d2bbff",
        "secondary-container": "#6800e4",
        tertiary: "#28f280",
        error: "#ffb4ab"
      },
      borderRadius: { DEFAULT: "0.125rem", lg: "0.25rem", xl: "0.5rem", full: "0.75rem" },
      spacing: {
        "margin-desktop": "48px",
        "margin-mobile": "16px",
        "container-max": "1280px",
        gutter: "24px",
        unit: "4px"
      },
      maxWidth: { "container-max": "1280px" },
      fontFamily: {
        "display-lg": ["Space Grotesk", "sans-serif"],
        "display-lg-mobile": ["Space Grotesk", "sans-serif"],
        "headline-md": ["Space Grotesk", "sans-serif"],
        "headline-sm": ["Space Grotesk", "sans-serif"],
        "body-lg": ["Inter", "sans-serif"],
        "body-md": ["Inter", "sans-serif"],
        "code-sm": ["JetBrains Mono", "monospace"],
        "label-caps": ["JetBrains Mono", "monospace"]
      },
      fontSize: {
        "display-lg": ["64px", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "700" }],
        "display-lg-mobile": ["40px", { lineHeight: "1.2", fontWeight: "700" }],
        "headline-md": ["32px", { lineHeight: "1.2", fontWeight: "600" }],
        "headline-sm": ["24px", { lineHeight: "1.3", fontWeight: "600" }],
        "body-lg": ["18px", { lineHeight: "1.6", fontWeight: "400" }],
        "body-md": ["16px", { lineHeight: "1.5", fontWeight: "400" }],
        "code-sm": ["14px", { lineHeight: "1.4", fontWeight: "500" }],
        "label-caps": ["12px", { lineHeight: "1", letterSpacing: "0.1em", fontWeight: "700" }]
      },
      animation: {
        draw: "draw 1.5s ease-in-out forwards",
        marquee: "marquee 28s linear infinite"
      },
      keyframes: {
        draw: { "0%": { strokeDasharray: "0, 1000" }, "100%": { strokeDasharray: "1000, 0" } },
        marquee: { "0%": { transform: "translateX(0%)" }, "100%": { transform: "translateX(-50%)" } }
      }
    }
  }
};
