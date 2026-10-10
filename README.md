# The Jackbox Megapicker

Source code and rebuild for The Jackbox Megapicker launcher (Vue 3 + TypeScript + Vite + Electron) with Russian and English localization support.

## Requirements

- Node.js 18+
- Steam client running in the background

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Initialize .env and steam_appid.txt
npm run setup

# 3. Build the frontend
npm run build:renderer

# 4. Start the application
npm run start:app
```

For frontend development with Hot Module Replacement (HMR):
```bash
npm run dev:renderer
```

## Packaging app.asar (for Steam)

To apply changes directly to your local Steam installation:
```bash
npm run repack
```
This builds the frontend and packs the app into `../app.asar`, maintaining native Steamworks binaries in `app.asar.unpacked`.

## Creating Source Archive

```bash
npm run archive
```
Packages a clean source code zip archive (excluding `node_modules`, scratch files, and caches) into the game root directory.

## Project Structure

- `src/renderer/` — Application frontend (Vue 3 components, styles, game assets, views).
- `src/renderer/locales/` — Localization dictionaries (`en.json`, `es.json`).
- `src/shared/` — Shared TypeScript types and data schemas.
- `.vite/build/` — Electron main process (`main.js`, `preload.js`) and native Steamworks binaries.
- `.vite/renderer/` — Compiled production renderer bundle.
- `scripts/` — Utility scripts (`repack.js`, `archive.js`).
