#!/bin/sh
set -eu

script_directory=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
site_directory=${WOPIAN_SITE_DIRECTORY:-$script_directory/sites/wopian}
image=${WOPIAN_STATIC_IMAGE:-ghcr.io/wopian/wopian.moe/static:latest}
validator="$script_directory/tools/wopian/validate-release.py"
mode=${1:-update}

fail() { printf '%s\n' "$1" >&2; exit 1; }
case "$mode" in update|--rollback) ;; *) fail 'Usage: sh update-wopian.sh [--rollback]' ;; esac
for command in python3 flock realpath; do command -v "$command" >/dev/null || fail "Missing command: $command"; done
site_directory=$(realpath -m -- "$site_directory")
case "$site_directory" in /|/root|/srv|"$script_directory") fail 'Unsafe site directory' ;; esac
mkdir -p -- "$site_directory/releases" "$site_directory/assets/_nuxt"
exec 9>"$site_directory/update.lock"
flock -n 9 || { printf '%s\n' 'WOPIAN update already running.'; exit 0; }

current=$(readlink "$site_directory/current" || true)
previous=$(readlink "$site_directory/previous" || true)
valid_target() {
  case "$1" in releases/*) digest=${1#releases/} ;; *) return 1 ;; esac
  [ ${#digest} -eq 64 ] || return 1
  case "$digest" in *[!0-9a-f]*) return 1 ;; esac
}
[ -z "$current" ] || valid_target "$current" || fail 'Invalid current release link'
[ -z "$previous" ] || valid_target "$previous" || fail 'Invalid previous release link'
container=
stage=
cleanup() {
  if [ -n "$container" ]; then docker rm "$container" >/dev/null 2>&1 || true; fi
  case "$stage" in "$site_directory"/releases/.stage-*) rm -rf -- "$stage" ;; esac
  rm -f -- "$site_directory/.current.$$" "$site_directory/.previous.$$"
}
trap cleanup EXIT
trap 'exit 1' HUP INT TERM

if [ "$mode" = '--rollback' ]; then
  [ -n "$previous" ] || fail 'No previous WOPIAN release'
  target=$previous
else
  command -v docker >/dev/null || fail 'Missing command: docker'
  docker pull "$image" >/dev/null
  image_id=$(docker image inspect --format '{{.Id}}' "$image")
  digest=${image_id#sha256:}
  target="releases/$digest"
  valid_target "$target" || fail 'Invalid Docker image ID'
  if [ "$target" = "$current" ]; then
    printf '%s\n' 'WOPIAN already current.'
    python3 "$validator" prune "$site_directory"
    exit 0
  fi
  if [ ! -d "$site_directory/$target" ]; then
    stage=$(mktemp -d "$site_directory/releases/.stage-XXXXXX")
    container=$(docker create --entrypoint /unused "$image")
    docker cp "$container:/site/." "$stage/"
    python3 "$validator" validate "$stage"
    mv -- "$stage" "$site_directory/$target"
    stage=
  fi
fi

python3 "$validator" assets "$site_directory/$target" "$site_directory/assets"
if [ -n "$current" ] && [ "$current" != "$target" ]; then
  ln -s -- "$current" "$site_directory/.previous.$$"
  mv -Tf -- "$site_directory/.previous.$$" "$site_directory/previous"
fi
ln -s -- "$target" "$site_directory/.current.$$"
mv -Tf -- "$site_directory/.current.$$" "$site_directory/current"
python3 "$validator" prune "$site_directory"
printf '%s\n' "WOPIAN active: $target"
