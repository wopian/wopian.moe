"""Exercise real release scripts with Docker extraction mocked, never started."""
import fcntl
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import tempfile
import time
import unittest

SOURCE = Path(__file__).resolve().parents[1] / 'deployment' / 'hetzner'


class ReleaseTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory(prefix='wopian-test-')
        self.root = Path(self.temporary.name)
        self.host = self.root / 'host'
        shutil.copytree(SOURCE, self.host)
        self.site = self.host / 'sites' / 'wopian'
        self.registry = self.root / 'registry'
        self.registry.mkdir()
        self.commands = self.root / 'commands'
        self.commands.mkdir()
        docker = self.commands / 'docker'
        docker.write_text('''#!/bin/sh
set -eu
printf '%s\\n' "$*" >> "$MOCK_LOG"
case "$1" in
  pull) [ "${MOCK_FAIL:-}" != pull ] ;;
  image) printf 'sha256:%s\\n' "$MOCK_DIGEST" ;;
  create) printf '%s\\n' fixture ;;
  cp) [ "${MOCK_FAIL:-}" != extraction ]; cp -a "$MOCK_REGISTRY/$MOCK_DIGEST/." "$3" ;;
  rm) : ;;
  *) printf '%s\\n' 'Unexpected Docker command' >&2; exit 1 ;;
esac
''')
        docker.chmod(0o755)
        self.log = self.root / 'docker.log'
        self.environment = {**os.environ, 'PATH': str(self.commands) + os.pathsep + os.environ['PATH'],
                            'MOCK_REGISTRY': str(self.registry), 'MOCK_LOG': str(self.log)}

    def tearDown(self):
        self.temporary.cleanup()

    def release(self, character, asset=None, build_id=None):
        digest = character * 64
        build_id = build_id or digest
        root = self.registry / digest
        root.mkdir()
        content = {'index.html': '<h1>Home</h1>', 'concerts/event/index.html': '<h1>Event</h1>',
                   '404.html': '<h1>Outside the frame.</h1>',
                   '_nuxt/' + (asset or character + '.js'): 'console.log("' + character + '")',
                   '_nuxt/builds/latest.json': json.dumps({'id': build_id, 'timestamp': ord(character)}),
                   '_nuxt/builds/meta/' + build_id + '.json': json.dumps({'id': build_id, 'revision': character})}
        for name, text in content.items():
            target = root / name
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text(text)
        manifest = {'formatVersion': 1, 'routes': ['/', '/concerts/event'],
                    'files': {name: hashlib.sha256((root / name).read_bytes()).hexdigest() for name in content}}
        (root / 'release-manifest.json').write_text(json.dumps(manifest))
        return digest

    def run_update(self, digest, failure='', rollback=False):
        result = subprocess.run(['sh', str(self.host / 'update-wopian.sh')] + (['--rollback'] if rollback else []),
                                env={**self.environment, 'MOCK_DIGEST': digest, 'MOCK_FAIL': failure},
                                capture_output=True, text=True)
        if result.returncode and not failure:
            self.fail(result.stderr)
        return result

    def current(self):
        return os.readlink(self.site / 'current')

    def test_activation_unchanged_update_and_rollback(self):
        first, second = self.release('a'), self.release('b')
        self.run_update(first)
        self.assertEqual(self.current(), 'releases/' + first)
        self.run_update(first)
        self.assertEqual(self.log.read_text().count('create '), 1)
        self.run_update(second)
        self.assertEqual(self.current(), 'releases/' + second)
        self.assertEqual(os.readlink(self.site / 'previous'), 'releases/' + first)
        self.assertTrue((self.site / 'assets/_nuxt/a.js').is_file())
        self.assertTrue((self.site / 'assets/_nuxt/b.js').is_file())
        self.run_update(second, rollback=True)
        self.assertEqual(self.current(), 'releases/' + first)
        self.assertEqual(os.readlink(self.site / 'previous'), 'releases/' + second)
        self.assertNotIn('start ', self.log.read_text())

    def test_failed_download_or_extraction_preserves_current(self):
        first, second = self.release('a'), self.release('b')
        self.run_update(first)
        for failure in ('pull', 'extraction'):
            with self.subTest(failure=failure):
                self.assertNotEqual(self.run_update(second, failure).returncode, 0)
                self.assertEqual(self.current(), 'releases/' + first)
                self.assertEqual(list((self.site / 'releases').glob('.stage-*')), [])

    def test_latest_manifest_follows_activation_and_rollback(self):
        first, second = self.release('a'), self.release('b')
        self.run_update(first)
        shared_latest = self.site / 'assets/_nuxt/builds/latest.json'
        self.assertFalse(shared_latest.exists())
        # Old deployments left this mutable file in the retained asset directory.
        shared_latest.write_text((self.site / 'current/_nuxt/builds/latest.json').read_text())
        self.run_update(second)
        self.assertEqual(json.loads((self.site / 'current/_nuxt/builds/latest.json').read_text())['id'], second)
        self.assertEqual(json.loads(shared_latest.read_text())['id'], first)
        for digest in (first, second):
            self.assertTrue((self.site / 'assets/_nuxt/builds/meta' / (digest + '.json')).is_file())
        self.run_update(second, rollback=True)
        self.assertEqual(json.loads((self.site / 'current/_nuxt/builds/latest.json').read_text())['id'], first)
        old = time.time() - 31 * 24 * 60 * 60
        os.utime(shared_latest, (old, old))
        self.run_update(first)
        self.assertFalse(shared_latest.exists())

    def test_corrupt_file_preserves_current(self):
        first, second = self.release('a'), self.release('b')
        self.run_update(first)
        (self.registry / second / 'index.html').write_text('corrupt')
        result = self.run_update(second, 'validation')
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('Checksum mismatch', result.stderr)
        self.assertEqual(self.current(), 'releases/' + first)

    def test_concurrent_run_skips_pull_and_activation(self):
        first, second = self.release('a'), self.release('b')
        self.run_update(first)
        before = self.log.read_text()
        with (self.site / 'update.lock').open('w') as lock:
            fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
            result = self.run_update(second)
        self.assertIn('already running', result.stdout)
        self.assertEqual(self.log.read_text(), before)
        self.assertEqual(self.current(), 'releases/' + first)

    def test_asset_collision_preserves_current(self):
        first, second = self.release('a', 'same.js'), self.release('b', 'same.js')
        self.run_update(first)
        result = self.run_update(second, 'collision')
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('Immutable asset collision', result.stderr)
        self.assertEqual(self.current(), 'releases/' + first)

    def test_versioned_manifest_collision_preserves_current(self):
        first = self.release('a')
        second = self.release('b', build_id=first)
        self.run_update(first)
        result = self.run_update(second, 'collision')
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('Immutable asset collision: _nuxt/builds/meta/' + first + '.json', result.stderr)
        self.assertEqual(self.current(), 'releases/' + first)
        self.assertEqual(json.loads((self.site / 'current/_nuxt/builds/latest.json').read_text())['id'], first)

    def test_retention_protects_current_and_previous(self):
        digests = [self.release(character) for character in 'abcd']
        for digest in digests[:3]:
            self.run_update(digest)
        old = time.time() - 31 * 24 * 60 * 60
        for path in (self.site / 'releases').iterdir():
            os.utime(path, (old, old))
        for path in (self.site / 'assets/_nuxt').iterdir():
            os.utime(path, (old, old))
        self.run_update(digests[2])
        self.assertFalse((self.site / 'releases' / digests[0]).exists())
        self.assertFalse((self.site / 'assets/_nuxt/a.js').exists())
        for character, digest in zip('bc', digests[1:3]):
            self.assertTrue((self.site / 'releases' / digest).is_dir())
            self.assertTrue((self.site / 'assets/_nuxt' / (character + '.js')).is_file())
        self.run_update(digests[3])
        self.assertEqual(self.current(), 'releases/' + digests[3])

    def test_unlisted_files_and_symlinks_fail_validation(self):
        first, second = self.release('a'), self.release('b')
        self.run_update(first)
        extra = self.registry / second / 'extra.txt'
        extra.write_text('unlisted')
        self.assertNotEqual(self.run_update(second, 'validation').returncode, 0)
        extra.unlink()
        extra.symlink_to('/etc/passwd')
        self.assertNotEqual(self.run_update(second, 'validation').returncode, 0)
        self.assertEqual(self.current(), 'releases/' + first)


if __name__ == '__main__':
    unittest.main()
