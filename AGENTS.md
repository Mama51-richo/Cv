# AGENTS.md

## Project Overview
ProCV Studio — a single-page static CV maker app. The entire app is one `index.html` file (~1243 lines) using:
- Tailwind CSS (via CDN `cdn.tailwindcss.com`)
- FontAwesome icons (via CDN)
- Google Fonts (Inter, Playfair Display, Roboto)
- Vanilla JavaScript for all interactivity (no build step, no framework)

## Architecture
- No backend, no API, no database — fully client-side.
- No dependencies to install; no build step required.
- All state is in-browser (localStorage for persistence).

## Running in the Sandbox
- Served via `nginx:alpine` on host port 3000 (mapped to container port 80).
- `docker-compose.base44.yml` bind-mounts `index.html` into the nginx html directory.
- No secrets required.
- Health check: `wget --spider http://localhost:80/`

## Editing
- Edit `index.html` directly; changes appear on reload (no live-reload dev server, so call `reload_preview` after edits).
