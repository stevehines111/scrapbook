# Scrapbook

Lay out your own photos on a sheet, print the sheet on a Canon PIXMA PRO-100,
cut the photos out and glue them into a physical scrapbook. Replaces doing this in Lightroom.
Used on a Windows desktop, a shared MacBook and a Windows school laptop, so it is a web page with
nothing to install. Hosted on GitHub Pages: https://stevehines111.github.io/scrapbook/

## Decisions (Steve's)
- Freeform layout: pick the sheet, drop photos, drag, resize, crop, nest, print. Packing only on the Auto organize button.
- Sheet sizes: 13 × 19 (A3+), 8.5 × 11 (Letter), 4 × 6.
- Photos come in as files or a Google Photos album zip. No Google login or API.
- Public static page. Photos never leave the computer: no uploads, no server, no analytics.

## Stack
- One file, `index.html`: HTML, CSS and JS inline. No build step, no framework.
- JSZip (cdnjs) and heic2any (jsdelivr), loaded only when a zip or HEIC photo arrives, with SRI hashes.
- DM Sans from Google Fonts, system font fallback.
- Layout model is in inches. Each photo: x, y, w, h, rotation (0/90/180/270), crop (zoom >= 1, pan -1..1).
  The image always covers its frame.
- Images: ~400px tray thumbnails, ~2000px on-screen previews, the original file for printing.
- `samples/`: 8 picsum.photos images (Unsplash license), used by "Try sample photos".

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
Saving projects between sessions, captions or text, stickers or backgrounds, Google Photos login or picker,
color profiles, phone layout.
