# Assets — Snapir Design

This folder is reserved for static assets. The main logo files are in the root project directory.

## Logo Files (root directory)

| File                  | Used where              | Notes                                     |
|-----------------------|-------------------------|-------------------------------------------|
| `logo-with-text.svg`  | Navbar, Footer          | Full logo with company name — primary use |
| `logo-with-text.png`  | Fallback / social       | PNG version for Open Graph / email        |
| `logo.svg`            | Favicon / icon contexts | Icon-only version without text            |

## Replacing the Logo

1. **Navbar & Footer**: Replace `logo-with-text.svg` in the root folder with your new file,
   keeping the same filename. The `<img>` tag in `index.html` references it as `./logo-with-text.svg`.

2. **Fallback text**: If the SVG fails to load, the text "SNAPIR DESIGN" is shown automatically.
   You can change this in `index.html` in the `.logo-fallback` span elements.

3. **Footer**: The footer logo has `filter: brightness(0) invert(1)` applied in CSS to make it
   white on the dark footer background. Remove or adjust this filter in `style.css`
   (selector: `.footer-logo`) if your logo already has a white version.

## Adding an OG Image

Place a `og-image.png` (1200×630px) in this `assets/` folder and update the Open Graph
meta tag in `index.html`:

```html
<meta property="og:image" content="./assets/og-image.png">
```

## Adding a Favicon

Place a `favicon.ico` or `favicon.svg` here, then add to `<head>` in `index.html`:

```html
<link rel="icon" type="image/svg+xml" href="./assets/favicon.svg">
<link rel="icon" type="image/x-icon"  href="./assets/favicon.ico">
```
