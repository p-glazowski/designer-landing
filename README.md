# designer-landing

A demo landing page for an interior design studio. It's visuals only, with no backend. The copy is in Polish, and the studio name ("Pracownia"), projects and hours are placeholders.

- **Intro:** a plaster brushstroke paints the word "ślad" and wipes the dark away.
- **Hero:** two dimmed photographs light up wherever the cursor drags across them.
- **Work index:** large project names with a fixed photo frame that wipes between projects.
- **Process:** four full-screen panels with sticky words over photo and video.
- **Moodboard:** smear across material samples to build your own set.

Built with Vite, React, TypeScript, GSAP (ScrollTrigger) and Lenis. The brush effects are plain 2D canvas, and everything falls back to static content under `prefers-reduced-motion`.

```bash
npm install
npm run dev
```

Projects are in `src/data.js`, which feeds the home section and the pages at `/realizacje` and `/realizacje/<slug>`. Because those are real addresses, the host has to serve `index.html` for any path. Other placeholder text lives in `src/content.ts`. Photos and clips are free stock from Unsplash and Pexels, kept in `public/media` and credited in the footer.

To publish the current checkout to GitHub Pages (https://p-glazowski.github.io/designer-landing/):

```bash
npm run deploy
```
