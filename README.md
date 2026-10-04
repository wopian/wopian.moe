# WOPIAN photography

Concert, cosplay, and motorsport portfolio built with Nuxt, Nuxt Content, and
Nuxt UI. Markdown remains the source of album metadata and photograph URLs.

## Local development

Use Bun **1.4.2**, pinned in `.bun-version`, CI, and Docker. Dependency installs
retain the three-day release-age policy in `bunfig.toml`.

```sh
bun install --frozen-lockfile
bun run dev
```

Curate homepage photographs in `shared/portfolio.ts`. Each showcase defines its
genre, existing album path, original CDN photograph, and focal position. Keep
album Markdown under `content/<category>/`. Blank covers and null photograph
entries are normalized. Listings show only populated albums; empty albums keep
their existing URLs.

## Static production build

```sh
bun run typecheck
bun test
bun run build
bun run preview
```

`build` runs `nuxt generate`, then checks every Markdown route and writes a
SHA-256 release manifest. Current content produces **69 page-specific
`index.html` files**, including empty albums, plus a complete custom `404.html`.
Copy all of `.output/public` to the static host. Preserve `_nuxt`,
`__nuxt_content`, payload files, SQL dumps, and WASM assets.
No application server or runtime image processor is required.

`preview` serves only generated files on `127.0.0.1:3000`, including directory
redirects and genuine 404 responses. Set `PORT` when port 3000 is occupied.
Run `bun scripts/check-static-http.ts http://127.0.0.1:3000` against the preview
or a local Caddy instance to check every route and browser content asset over HTTP.

All photographs load directly from original CDN URLs. No Nuxt Image or IPX
processing runs. Gallery links work without JavaScript. Nuxt Content
queries during interactive navigation run in browser SQLite.

## Publication

CI type-checks, tests, generates, and verifies the website. It uploads a static
archive and publishes a file-only image:

```text
ghcr.io/wopian/wopian.moe/static:latest
ghcr.io/wopian/wopian.moe/static:sha-<commit>
```



Canonical domain: `https://wopian.me`. Keep host redirects from `.moe` and `www`.
