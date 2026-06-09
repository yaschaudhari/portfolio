# Yash Chaudhari — Portfolio Site — Design Spec

Date: 2026-06-09

## Goal
A distinctive, production-grade developer portfolio for Yash Santosh Chaudhari —
Healthcare SaaS developer, AI tooling builder, and CAD/CAM automation engineer.
Built from the user's Stitch design ("Kinetic Engineering" — dark cockpit aesthetic).

## Decisions (approved)
- **Stack:** Static HTML site, no framework. Tailwind via CDN now; compile to a
  static CSS file as a pre-launch polish pass.
- **Hosting:** Netlify.
- **Screenshots:** Dedicated project detail pages with captioned lightbox galleries.
  Kogmed (17 shots) now; DocTecq scaffolded for later shots.
- **CAD/CAM:** Text-only "In Development" card, no detail page yet.
- **Contact:** Netlify Forms with email fallback (yashchaudhari5055@gmail.com).
- **Resume:** Links to a `resume.pdf` placeholder until the real file is dropped in.

## Aesthetic (from Stitch DESIGN.md — honored faithfully)
- Technical Minimalism + Cyber-Glassmorphism. Obsidian-blue base (#10141a),
  electric cyan primary (#00c6ff), violet secondary (#7b2ff7).
- Type: Space Grotesk (display), Inter (body), JetBrains Mono (labels/code).
- WebGL particle-grid shader background, custom cursor, glass cards, scroll reveals,
  typewriter hero, stat counters, skills marquee, vanilla-tilt cards.

## Content correctness (CRITICAL)
The Stitch export invented tech stacks that are NOT the user's. Replace all of them
with the user's real stack and real project copy:
- Real skills: Python, Flask, REST APIs, MySQL, Auth, Web Scraping, Automation,
  AI Tool Dev, Gemini API, Prompt Engineering, Fusion 360, CAD/CAM, CNC, VMC.
- Kogmed & DocTecq are PHP + MySQL + Bootstrap 5 + Chart.js + vanilla JS
  (per Kogmed_Portfolio/README.md). Kogmed adds Razorpay, FullCalendar.
- Use the user's supplied About Me, Featured Projects, and Technical Skills copy
  verbatim (lightly trimmed for layout). No invented metrics presented as fact.

## File structure
```
index.html                 landing (refined Stitch single-page)
projects/kogmed.html       detail + 17-shot captioned lightbox gallery
projects/doctecq.html      detail, gallery scaffolded for later shots
assets/css/styles.css      custom animations/components (beyond Tailwind)
assets/js/main.js          cursor, typewriter, reveal, counters, tilt, lightbox
assets/img/kogmed/*        17 screenshots + CAPTIONS.md
resume.pdf                 placeholder
netlify.toml               build/headers config
```

## Sections (index.html)
1. Loader (YC draw) → 2. Nav (Projects/Skills/Projects/Contact + Resume)
3. Hero (typewriter: Healthcare SaaS / AI Tooling / CAD-CAM) → 4. About ("System Overview")
5. Featured Projects ("Key Deployments": Kogmed, DocTecq, CAD/CAM) with real tags + links
6. Skills ("Technical Arsenal": marquee + 4 category cards, real skills)
7. Contact (Netlify form + email) → Footer.

## Accessibility / quality
- prefers-reduced-motion respected. Custom cursor only on fine pointers; native
  cursor on touch. Alt text on all screenshots. Lighthouse-clean, no console errors.

## Out of scope (later)
- DocTecq screenshots, CAD/CAM detail page, real resume PDF, custom domain,
  Tailwind compile step (final polish).
