# Κρεοπωλείο Λιακόπουλος — website

Static website for Κρεοπωλείο Λιακόπουλος (Αγίας Παρασκευής 34, Άγιοι Ανάργυροι).
Plain HTML, CSS and a small vanilla-JS file: no build step, no dependencies.

## Pages

| File            | Page                                                                    |
| --------------- | ----------------------------------------------------------------------- |
| `index.html`    | Αρχική: hero, categories, interactive beef-cut chart, vacuum, team, hours |
| `products.html` | Προϊόντα: fresh meats board, premium cuts, παρασκευάσματα, τυριά & ζυμαρικά, vacuum |
| `about.html`    | Η ομάδα: team photo, story, values, gallery, Google rating             |
| `contact.html`  | Επικοινωνία: address, phones, live hours, Google map                   |

## Structure

```
assets/
  css/style.css   all styles (colours and fonts are CSS variables at the top)
  js/main.js      mobile menu, scroll reveals, live open/closed status, cut chart
  img/            optimised WebP photos, favicon, og.jpg (social share image)
_originals/       the original uploaded photos (not published by GitHub Pages)
```

## Preview locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Publish with GitHub Pages

Settings → Pages → *Deploy from a branch* → `main` / `(root)`.
Folders that start with `_` (like `_originals/`) are skipped by GitHub Pages.

## Things to update

- **Opening hours** appear in three places: the `SCHEDULE` object in `assets/js/main.js` (drives the
  live "Ανοιχτά / Κλειστά" badge), the hours tables in the HTML pages, and the footer.
- **Phones:** 210 261 3180 · 693 401 8961 (search for `tel:` to change them).
- **Logo:** the header uses a gold bull-horn mark drawn after the logo on the shop wall, plus
  the name in type. To use the official logo file instead, add it as `assets/img/logo.svg`
  (or a transparent `.png`) and swap the `<a class="brand">` contents in each page.
- **Photos:** to replace one, export it as WebP (~900px wide) into `assets/img/` with the same name.
