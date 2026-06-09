# Yash Santosh Chaudhari — Portfolio

A static developer portfolio. Dark "cockpit" aesthetic (Technical Minimalism +
Cyber-Glassmorphism) built from a Stitch design.

**Healthcare SaaS Developer · AI Tooling Builder · CAD/CAM Automation Engineer**

## Stack
- Plain HTML + CSS + vanilla JS (no framework, no build step)
- Tailwind via Play CDN (see "Production polish" below)
- WebGL shader background, custom cursor, scroll reveals, screenshot lightbox
- Fonts: Space Grotesk · Inter · JetBrains Mono

## Structure
```
index.html              Landing page
projects/kogmed.html    Kogmed — capabilities + 17-shot captioned gallery/lightbox
projects/doctecq.html   DocTecq PMS — capabilities + gallery scaffold (add shots later)
assets/css/styles.css   Custom styles
assets/js/main.js       Shader, cursor, typewriter, reveals, counters, lightbox
assets/js/tailwind-config.js  Shared Tailwind tokens (mirror of Stitch DESIGN.md)
assets/js/vanilla-tilt.min.js Vendored (no external CDN)
assets/img/kogmed/      Product screenshots + CAPTIONS.md
netlify.toml            Deploy + security headers
```

## Run locally
Any static server, e.g.:
```
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy (Netlify)
1. Push this folder to a GitHub repo.
2. In Netlify: **Add new site → Import from Git**, pick the repo.
3. Build command: *(none)* · Publish directory: `.`
4. The contact form is wired for **Netlify Forms** (`name="contact"`, `data-netlify="true"`).
   Submissions appear under the site's **Forms** tab.

## TODO before launch
- [ ] Replace `resume.pdf` with the real résumé.
- [ ] Add a real `assets/img/og-cover.png` (social share, 1200×630).
- [ ] Add DocTecq screenshots to `assets/img/doctecq/` and fill the gallery in `projects/doctecq.html`.
- [ ] **Production polish:** compile Tailwind to a static CSS file (Tailwind standalone CLI)
      and drop the `cdn.tailwindcss.com` script to remove its console warning.
- [ ] Optional: custom domain.
