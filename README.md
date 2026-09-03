# SimpleRosterAI website

Marketing site for SimpleRosterAI, AI nurse duty rostering for Indian hospitals.
Astro 5, Tailwind, Svelte 5.

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # dist/ + placeholder check
npm test           # rostering engine tests
npm run smoke      # route + banned-term gate over dist/
```

Before launch, replace every `TODO_` value in `src/site.ts`. Netlify and Vercel
both run the production build with `SITE_ENV=production` set, so an unfilled
placeholder fails the deploy build; locally, run
`SITE_ENV=production npm run build` to check the same gate.

## Assets

- `python scripts/build-template.py` — regenerate the roster template xlsx
- `python scripts/build-social.py` — regenerate the OG image
- `python scripts/build-icons.py` — regenerate favicons/app icons
- Launch video: sibling folder `../srai-launch-video` (Remotion); renders live
  into `public/videos/`.
