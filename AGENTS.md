# AGENTS.md

## Architecture

Static site, no build tooling. Three top-level HTML pages share `styles.css` and `app.js`:

- `index.html` — public landing page (hero, portfolio gallery, styles, pricing, booking form)
- `admin.html` — self-contained admin dashboard with its own inline `<script>` (duplicates some of `app.js`'s data helpers rather than importing them, since there's no bundler)
- `app.js` — logic for the public page only: renders gallery/pricing from stored designs, handles the booking form submit

## Data model

Designs and bookings are read/written directly to `localStorage`/`sessionStorage` as JSON (keys: `rare_designs`, `rare_bookings`, `rare_admin`). There is no backend — this means data is per-browser and does not sync between a customer and the admin dashboard on different devices.

## Non-obvious decisions

- Admin auth is a hardcoded demo credential check (`admin` / `admin123`) with a `sessionStorage` flag — not real authentication. Do not treat this as secure.
- `admin.html` re-declares `defaultDesigns` and the `D()`/`B()` storage helpers inline instead of sharing `app.js`, to keep the admin page fully self-contained.
- If persistence needs to be shared across devices, migrate `rare_designs`/`rare_bookings` to Netlify Database (see the `netlify-database` skill) and replace the direct `localStorage` calls with API calls to Netlify Functions.
