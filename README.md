# WOPIAN

## Requirements

- Bun 1.4.4

## Setup

```sh
bun install --frozen-lockfile
```

## Development

```sh
bun run dev
```

Open http://localhost:4002.

## Checks

```sh
bun run typecheck
bun test
bun run build
```

## Preview

Build first, then run:

```sh
bun run preview
```

Open http://127.0.0.1:3000.

## Photo metadata

```sh
bun run photos:metadata
bun run photos:metadata --refresh
```

Use `--refresh` after replacing photos at existing URLs.

## Contributing

- Run all checks before opening a pull request.
- Include updated `shared/generated/photo-dimensions.json` when changing photos.
