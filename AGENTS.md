# AGENTS.md

## Project overview
ProCV Studio — a single-page, client-side CV maker. The **entire app is one file: `index.html`** (~1240 lines) with no framework and no build step:

- Tailwind CSS Play CDN (`cdn.tailwindcss.com`)
- FontAwesome and Google Fonts, both via CDN
- Vanilla JS for all interactivity (tabs, dynamic form lists, template/theme switching, zoom, print, `localStorage`)
- No backend, no API, no database, no dependencies to install

Because every asset comes from a CDN, the rendered page needs outbound internet access from the browser; without it the page still loads but is unstyled and the icons are missing.

## Running in the sandbox
- `docker-compose.base44.yml` runs `nginx:alpine` on host port 3000 (container port 80).
- `index.html` is bind-mounted read-only to `/site/index.html` and served from there, so edits are picked up without a rebuild.
- The checkout root is mode `0700`, which the nginx worker user cannot traverse, so app files are mounted **individually** — add another `:ro` volume in `docker-compose.base44.yml` for any new asset directory (e.g. `./css`, `./js`).
- `.base44/nginx.conf` overrides the nginx server block: `/` serves `index.html`; anything not mounted (the rest of the checkout, `.git`, `AGENTS.md`, the Base44 setup files) returns 404.
- No secrets are required (`.base44/environment.json` has an empty `secrets` list and `/run/base44/app.env` carries no keys).
- Healthcheck: `wget -q --spider http://127.0.0.1/` (not `localhost` — inside the container that resolves to `::1`, where nginx, bound to IPv4, refuses the connection).

## Gotchas
- **No live-reload dev server exists**, so after an edit call `reload_preview` (a browser reload is enough — nginx reads the file from disk on each request).
- `index.html` must stay a valid HTML document: it begins with `<!DOCTYPE html>` and ends with `</html>`. Commit `26224d3` shipped it wrapped in Markdown code fences (` ```html ` on line 1 and ` ``` ` on the last line), which made the served page start with stray text, forced the browser into quirks mode, and is what broke the app. If the preview ever shows literal ` ```html ` text, that is the cause.
- Verify changes with `curl -s http://localhost:3000/ | head` and by loading `/` in the preview; there are no tests and no build to run.
