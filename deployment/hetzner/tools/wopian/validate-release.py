#!/usr/bin/env python3
"""Validate file-only releases and manage retained immutable assets."""
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import re
import shutil
import sys
import tempfile
import time


def safe_file(root, name):
    relative = PurePosixPath(name)
    if not name or relative.is_absolute() or '..' in relative.parts or '\\' in name:
        raise ValueError('Invalid manifest path')
    path = root.joinpath(*relative.parts)
    if not path.resolve().is_relative_to(root.resolve()) or path.is_symlink():
        raise ValueError('Release path escapes directory')
    return path


def validate(root):
    if not root.is_dir() or root.is_symlink():
        raise ValueError('Release directory missing or is a symlink')
    manifest = json.loads((root / 'release-manifest.json').read_text())
    if manifest.get('formatVersion') != 1 or not manifest.get('files') or '/' not in manifest.get('routes', []):
        raise ValueError('Invalid release manifest')
    if any(path.is_symlink() for path in root.rglob('*')):
        raise ValueError('Release contains a symlink')
    for name, expected in manifest['files'].items():
        path = safe_file(root, name)
        if not re.fullmatch(r'[0-9a-f]{64}', expected) or not path.is_file():
            raise ValueError('Missing file or invalid checksum: ' + name)
        if hashlib.sha256(path.read_bytes()).hexdigest() != expected:
            raise ValueError('Checksum mismatch: ' + name)
    actual = {path.relative_to(root).as_posix() for path in root.rglob('*') if path.is_file()}
    if actual != set(manifest['files']) | {'release-manifest.json'}:
        raise ValueError('Release contains unlisted files')
    for route in manifest['routes']:
        if not route.startswith('/') or '?' in route or '#' in route or '..' in PurePosixPath(route).parts:
            raise ValueError('Invalid route')
        name = route.strip('/') + '/index.html' if route != '/' else 'index.html'
        if name not in manifest['files'] or '<h1' not in safe_file(root, name).read_text():
            raise ValueError('Missing rendered page: ' + route)
    if '404.html' not in manifest['files'] or not any(name.startswith('_nuxt/') for name in manifest['files']):
        raise ValueError('Missing static assets or 404 page')
    return manifest


def is_immutable_asset(name):
    # Nuxt's latest build pointer changes at each release activation.
    return name.startswith('_nuxt/') and name != '_nuxt/builds/latest.json'


def publish_assets(release, assets):
    manifest = validate(release)
    assets.mkdir(parents=True, exist_ok=True)
    if assets.is_symlink():
        raise ValueError('Asset directory must not be a symlink')
    for name, expected in manifest['files'].items():
        if not is_immutable_asset(name):
            continue
        target = safe_file(assets, name)
        target.parent.mkdir(parents=True, exist_ok=True)
        if target.exists():
            if hashlib.sha256(target.read_bytes()).hexdigest() != expected:
                raise ValueError('Immutable asset collision: ' + name)
            os.utime(target, None)
            continue
        with tempfile.NamedTemporaryFile(dir=target.parent, prefix='.asset-', delete=False) as handle:
            temporary = Path(handle.name)
        try:
            shutil.copyfile(release / name, temporary)
            temporary.chmod(0o644)
            os.replace(temporary, target)
        finally:
            temporary.unlink(missing_ok=True)


def prune(site):
    cutoff = time.time() - 30 * 24 * 60 * 60
    protected = set()
    protected_assets = set()
    for name in ('current', 'previous'):
        link = site / name
        if link.is_symlink():
            protected.add(link.resolve())
            manifest = json.loads((link / 'release-manifest.json').read_text())
            protected_assets.update(name for name in manifest['files'] if is_immutable_asset(name))
    releases = site / 'releases'
    for release in releases.iterdir():
        if re.fullmatch(r'[0-9a-f]{64}', release.name) and release.is_dir() and not release.is_symlink():
            if release.resolve() not in protected and release.stat().st_mtime < cutoff:
                shutil.rmtree(release)
    for asset in (site / 'assets' / '_nuxt').rglob('*'):
        name = asset.relative_to(site / 'assets').as_posix()
        if name not in protected_assets and asset.is_file() and not asset.is_symlink() and asset.stat().st_mtime < cutoff:
            asset.unlink()


if __name__ == '__main__':
    try:
        action = sys.argv[1]
        if action == 'validate':
            validate(Path(sys.argv[2]).resolve())
        elif action == 'assets':
            publish_assets(Path(sys.argv[2]).resolve(), Path(sys.argv[3]))
        elif action == 'prune':
            prune(Path(sys.argv[2]).resolve())
        else:
            raise ValueError('Unknown action')
    except (ValueError, OSError, KeyError, TypeError, IndexError) as error:
        print('WOPIAN release validation failed: ' + str(error), file=sys.stderr)
        sys.exit(1)
