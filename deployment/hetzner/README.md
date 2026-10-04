# Static WOPIAN delivery

These files mirror the personal-site deployment in `zeepkist/zeepkist-hetzner`.
The portfolio build publishes only HTML, CSS, JavaScript, and Nuxt Content browser
assets. Photographs load directly from CDN originals. Caddy serves files directly.
No application container runs.

## Host layout

`sites/wopian/releases/<image-id>` contains each verified website. Relative
`current` and `previous` symlinks select releases inside the read-only Caddy mount.
`assets/_nuxt` retains immutable JavaScript, CSS, and WASM files for 30 days after
their last deployment. Current and previous assets remain protected regardless of age.

Versioned Nuxt build metadata under `_nuxt/builds/meta` also stays immutable.
`_nuxt/builds/latest.json` changes each build and stays inside its release.
Caddy serves this pointer from `current` with `Cache-Control: no-cache`, so
activation and rollback switch it atomically with the HTML. In the `wopian.me`
site block, keep this exact route before the `handle /_nuxt/*` asset route:

```caddyfile
handle /_nuxt/builds/latest.json {
    root * /srv/wopian/current
    header Cache-Control "no-cache"
    file_server
}
```

Old shared copies of `latest.json` are bypassed and expire through normal pruning.

The updater needs Docker, Python 3.9 or newer, `flock`, and GNU coreutils.
It pulls `ghcr.io/wopian/wopian.moe/static:latest`, creates a stopped temporary
container, and copies `/site`. It never starts the image. SHA-256 verification
checks every file and every rendered route before activation.

## First rollout

Publish the portfolio workflow on `master` first. Copy the Hetzner repository
changes to `/root/zeepkist`. Keep the old `wopian` container running until Caddy passes checks.

```sh
cd /root/zeepkist
sh ./update-wopian.sh
docker compose run --rm --no-deps caddy caddy validate --config /etc/caddy/Caddyfile
docker compose up -d --no-deps --force-recreate caddy
curl -f https://wopian.me/
curl -f https://wopian.me/concerts/2026-02-01-exwhyz-in-the-uk/
curl -I https://wopian.me/does-not-exist/
```

Confirm missing page returns HTTP 404. Test original photography links, genre
controls, and lightbox. Then remove the old application container only:

```sh
docker stop wopian
docker rm wopian
```

Install the single entry from `wopian.cron` using `crontab -e`. Do not replace
existing backup or other deployment jobs. Updates check GHCR every five minutes.
Do not use `docker compose down` or `--remove-orphans` for this site migration.

If GHCR package is private, log Docker into GHCR with existing host credentials
before running updater. Deployment does not add an SSH credential to GitHub.

## Recovery

```sh
cd /root/zeepkist
sh ./update-wopian.sh --rollback
```

Rollback swaps current and previous releases without restarting Caddy. For a
lasting rollback, pause the cron entry or pin a previous commit image first;
otherwise the next successful poll deploys `latest` again.

```sh
WOPIAN_STATIC_IMAGE=ghcr.io/wopian/wopian.moe/static:sha-<commit> sh ./update-wopian.sh
```

`WOPIAN_SITE_DIRECTORY` overrides the default site directory for testing. Keep
the Caddy bind mount and root paths aligned when changing it. Release validation,
pull, and extraction failures leave current release active. Updater lock prevents
concurrent activation. Logs go to `wopian-update.log` through cron redirection.
