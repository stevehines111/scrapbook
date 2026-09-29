# Scrapbook

Lay out your own photos on a sheet, print the sheet on a Canon PIXMA PRO-100,
cut the photos out and glue them into a physical scrapbook. Replaces doing this in Lightroom.
Used on a Windows desktop, a shared MacBook and a Windows school laptop, so it is a web page with
nothing to install. Hosted on GitHub Pages: https://stevehines111.github.io/scrapbook/

## Decisions (Steve's)
- Freeform layout: pick the sheet, drop photos, drag, resize, crop, nest, print. Packing only on the Auto organize button.
- Sheet sizes: 13 × 19 (A3+), 8.5 × 11 (Letter), 4 × 6.
- Photos come in as files, a Google Photos album zip, or picked straight from Google Photos (the Google Photos button).
- Public static page. Photos never leave the computer: no uploads, no server, no analytics. Google Photos come from
  Google straight to the browser (or through the relay on your own Google account, stored nowhere, if it is turned on).

## Stack
- One file, `index.html`: HTML, CSS and JS inline. No build step, no framework.
- JSZip (cdnjs) and heic2any (jsdelivr), loaded only when a zip or HEIC photo arrives, with SRI hashes.
- DM Sans from Google Fonts, system font fallback.
- Layout model is in inches. Each photo: x, y, w, h, rotation (0/90/180/270), crop (zoom >= 1, pan -1..1).
  The image always covers its frame.
- Images: ~400px tray thumbnails, ~2000px on-screen previews, the original file for printing.
- `samples/`: 8 picsum.photos images (Unsplash license), used by "Try sample photos".
- `relay/Code.gs`: optional Google Apps Script relay for Google Photos downloads (below). Not deployed.

## Google Photos
- Google Cloud project `scrapbook-510121`: Photos Picker API on, OAuth app in Testing mode with two approved test users.
  Web Client ID (public): `513388922895-t19kimvqn3g27m9he4lflflnn8ldbn1b.apps.googleusercontent.com`.
  Authorized origins: `https://stevehines111.github.io` and `http://localhost:8000` only. Scope: `photospicker.mediaitems.readonly`.
- The button (tray empty state, and under Add photos) shows only on those two origins. `?gp=test` also shows it on
  localhost / 127.0.0.1 for mocked tests; it changes nothing on the real origins.
- Sign-in: Google Identity Services token client (`accounts.google.com/gsi/client`, loaded only on those origins; no SRI,
  Google does not version it). First connect in a page session shows the account chooser. Token in memory only, reused
  until it expires. `Switch account` in the panel forces the chooser.
- Picking: creates a Picker session and opens `pickerUri/autoclose` in a new tab. Sign-in and the tab open synchronously
  inside a click; after a sign-in, the panel's `Pick photos` button is the fresh click. Polls at Google's interval, paused
  while the tab is hidden, until photos are picked or Google's timeout.
- Bringing them in: photos only (videos skipped), each downloaded at its own width and height (`=w{w}-h{h}`, a JPEG even
  for HEIC originals) with the bearer token, 4 at a time, into the normal import. The session is deleted after.
- Direct download from `lh3.googleusercontent.com` with the Authorization header is not yet proven in a real browser
  (a Chrome probe on a made-up lh3 path, 2026-09-29, was refused at the CORS preflight). If it fails as a network/CORS error: with `RELAY_URL` set, downloads go through the relay; with it empty (the default),
  a `Google Photos download blocked` toast and the exact error in the console.
- Relay (`relay/Code.gs`): a text/plain POST `{ url, token }` (no CORS preflight); refuses any host but
  `lh3.googleusercontent.com`; fetches with the caller's own token; returns `{ ok, mimeType, data }` (base64). Stores
  nothing, no secrets. Runs on the deploying account's Apps Script quota. To turn it on:
  1. script.google.com → New project → paste `relay/Code.gs` over `Code.gs` → Save.
  2. Deploy → New deployment → type Web app. Execute as: Me. Who has access: Anyone. Deploy, authorize when asked.
  3. Copy the web app URL (ends in `/exec`) → set `RELAY_URL` in `index.html` → commit.
- Checked with Google mocked (Playwright routes on port 8101). Not established until a real sign-in: the direct download,
  and Family Link on a supervised teen account.

## Auto organize
Top-bar button that packs the current sheet's photos into the safe area (the 0.25 in inset). It guarantees:
- Sizes and crops kept. Nothing shrinks or gets re-cropped.
- Guillotine layout: every cut runs straight across the remaining piece, so a paper trimmer separates everything.
- Edge to edge from the top-left of the safe area. A photo may turn 90° (frame and image together).
- Best of many sort, fit and split rules: most photos on the sheet, then fewest turned photos (upright looks right
  on screen), then the largest empty rectangle. Same input, same result.
- Overflow goes to new sheets of the same size and orientation, right after the current one. A photo too big for the
  safe area either way round (e.g. Full sheet) stays where it is.
- One undo step puts everything back, including removing added sheets.

## The print-size check (the one that matters)
A wrong physical print size is the risk. Print sets `@page { size: <W>in <H>in; margin: 0 }` and draws the
sheet in real inches with full-resolution images. To check after any change to printing: serve the folder,
drive it with Playwright + installed Chrome, place a photo, set it to 4×6, and `page.pdf({ preferCSSPageSize: true })`.
The page must be exactly 936 × 1368 pt (13 × 19), 612 × 792 pt (8.5 × 11) or 288 × 432 pt (4 × 6), landscape
swapped, and the 4×6 photo 288 × 432 pt within 1 pt. Last run 2026-09-29 (after Auto organize): all exact.
Keep test scripts and node_modules out of this repo.

## Out of scope for now
Saving projects between sessions, captions or text, stickers or backgrounds, color profiles, phone layout.
