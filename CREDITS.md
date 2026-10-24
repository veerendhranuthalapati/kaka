# Image credits

## Original SVG illustrations

The following files in `frontend/public/cars/` are original SVG artwork created for the Auto Yard demo (side-view line-art silhouettes). They are not photographs and do not depict real vehicles or third-party brands.

- `coupe-01.svg`
- `ev-01.svg`
- `hatch-01.svg`
- `placeholder.svg`
- `sedan-01.svg`
- `sedan-02.svg`
- `suv-01.svg`
- `suv-02.svg`
- `truck-01.svg`
- `wagon-01.svg`

## Typography

- **Sora** — titles, prices, and large numerals. [SIL Open Font License 1.1](https://openfontlicense.org). Self-hosted via `@fontsource-variable/sora@5.3.0` (latin subset).
- **Inter** — body copy, labels, inputs, buttons, and tabular spec values. [SIL Open Font License 1.1](https://openfontlicense.org). Self-hosted via `@fontsource-variable/inter@5.3.0` (latin subset).

Font files are bundled at build time; the app does not request Google Fonts or other third-party font CDNs.

## Photographs

Demo vehicle JPEGs live in `frontend/public/cars/` and are listed with authors and licences in `frontend/src/data/car-photos.json`. The in-app **Photo credits** page (`/credits`) renders the same manifest. Images are from **Wikimedia Commons**, resized for web display; they may show a different model year or trim than the sample specifications.

Category fallback photos (no make/model in the manifest) are used only when an admin vehicle has no `imageUrl`.

## Adding assets

Place new files under `frontend/public/cars/` and reference them with a site-relative path such as `/cars/your-file.jpg` in the admin Image URL field, or leave Image URL empty to use the built-in category illustration.
