# Image credits

## Original SVG illustrations

The following files in `frontend/public/cars/` are original SVG artwork created for the Auto Yard demo (simple geometric silhouettes). They are not photographs and do not depict real vehicles or third-party brands.

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

- **Manrope** — headings, model names, and prices. [SIL Open Font License 1.1](https://openfontlicense.org). Self-hosted via `@fontsource-variable/manrope@5.3.0` (latin subset).
- **Inter** — body copy, labels, inputs, and buttons. [SIL Open Font License 1.1](https://openfontlicense.org). Self-hosted via `@fontsource-variable/inter@5.3.0` (latin subset).

Font files are bundled at build time; the app does not request Google Fonts or other third-party font CDNs.

## Photographs

No photograph files are bundled in this repository. Optional admin image URLs may point to external `https://` assets or files you add under `frontend/public/cars/`.

## Adding assets

Place new files under `frontend/public/cars/` and reference them with a site-relative path such as `/cars/your-file.jpg` in the admin Image URL field, or leave Image URL empty to use the built-in category illustration.
