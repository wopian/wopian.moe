import { readdir } from 'node:fs/promises'
import { join, relative, resolve } from 'node:path'

export async function albumRoutes(contentDirectory: string): Promise<string[]> {
  const root = resolve(contentDirectory)
  const routes = ['/', '/concerts', '/cosplay', '/motorsport', '/other', '/software']
  async function visit(directory: string) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name)
      if (entry.isDirectory()) await visit(path)
      else if (entry.isFile() && entry.name.endsWith('.md')) {
        routes.push(`/${relative(root, path).replaceAll('\\', '/').replace(/\.md$/, '')}`)
      }
    }
  }
  await visit(root)
  return routes.sort()
}
