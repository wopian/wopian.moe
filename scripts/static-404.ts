import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

export async function writeStatic404(root: string) {
  const homepage = await readFile(join(root, 'index.html'), 'utf8')
  const styles = [...homepage.matchAll(/<link[^>]*rel="stylesheet"[^>]*>/g)].map(match => match[0]).join('')
  // Nuxt's default 404 fallback is an SPA shell. Caddy needs a complete error document.
  await writeFile(join(root, '404.html'), `<!DOCTYPE html>
<html lang="en" class="dark"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#0b0b0d"><meta name="robots" content="noindex"><title>Page not found — WOPIAN</title>${styles}</head>
<body><a class="skip-link" href="#main-content">Skip to content</a><header class="site-header"><div class="header-inner flex items-center"><a href="/" class="wordmark">WOPIAN<span class="brand-dot" aria-hidden="true"></span></a><nav class="primary-nav" aria-label="Photography"><a class="nav-link" href="/concerts/">Concerts</a><a class="nav-link" href="/cosplay/">Cosplay</a><a class="nav-link" href="/motorsport/">Motorsport</a></nav></div></header><main id="main-content" class="page-shell error-page"><p class="eyebrow">404 / Page not found</p><h1>Outside the frame.</h1><p>This page could not be found. There is plenty more to explore.</p><a href="/" class="outline-link">Back to the portfolio</a></main><footer class="site-footer page-shell"><nav class="footer-bottom" aria-label="More photography"><a href="/concerts/">Concerts</a><a href="/cosplay/">Cosplay</a><a href="/motorsport/">Motorsport</a><a href="/other/">Other photography</a><a href="/software/">Software</a></nav></footer></body></html>\n`)
}
