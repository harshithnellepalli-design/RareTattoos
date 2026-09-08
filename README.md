# Rare Tattoo Studio

A static marketing and booking website for Rare Tattoo Studio, including a customer-facing landing page and an admin dashboard for managing tattoo designs, pricing, and appointment bookings.

## Technologies

- Plain HTML, CSS, and vanilla JavaScript — no build step or framework
- Browser `localStorage` / `sessionStorage` for storing designs, bookings, and the admin session

## Pages

- `index.html` — public site: portfolio, styles, pricing, and a booking form
- `admin.html` — admin dashboard (demo login: `admin` / `admin123`) for managing designs and viewing/updating bookings

## Run locally

Open `index.html` directly in a browser, or serve the folder with any static file server.

## Note on data persistence

Designs and bookings are currently stored in the browser's `localStorage`, so data does not sync between a customer's device and the admin dashboard. This is fine for a demo/prototype, but a production version would need a shared backend (e.g. Netlify Database) so bookings made by customers are visible to the admin from any device.
