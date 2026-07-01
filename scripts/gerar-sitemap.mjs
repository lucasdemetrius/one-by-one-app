// Arquivo: scripts/gerar-sitemap.mjs
// Descrição: Gera public/sitemap.xml e public/robots.txt a partir das rotas públicas
//            fixas + dos slugs dos artigos (extraídos de src/recursos/conteudo/artigos.ts).
//            Roda automaticamente antes do build (npm "prebuild") — assim o sitemap
//            fica sempre em sincronia com os artigos, sem manutenção manual.
//
//            Domínio: variável de ambiente SITE_URL (padrão https://teambox.com.br).

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const RAIZ = resolve(__dirname, '..')
const SITE_URL = (process.env.SITE_URL || 'https://teambox.com.br').replace(/\/$/, '')

// Rotas públicas fixas que queremos indexar (sem as telas utilitárias de login).
const ROTAS_FIXAS = ['/', '/conteudo']

// Extrai os slugs dos artigos direto do arquivo-fonte (robusto a mudanças de conteúdo).
function lerSlugs() {
  const arquivo = resolve(RAIZ, 'src/recursos/conteudo/artigos.ts')
  const texto = readFileSync(arquivo, 'utf8')
  const slugs = []
  const re = /slug:\s*'([^']+)'/g
  let m
  while ((m = re.exec(texto)) !== null) slugs.push(m[1])
  return slugs
}

const hoje = new Date().toISOString().slice(0, 10)
const slugs = lerSlugs()
const urls = [...ROTAS_FIXAS, ...slugs.map((s) => `/conteudo/${s}`)]

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${SITE_URL}${u}</loc>
    <lastmod>${hoje}</lastmod>
    <changefreq>weekly</changefreq>
  </url>`,
  )
  .join('\n')}
</urlset>
`

const robots = `# robots.txt — TeamBOX
User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`

writeFileSync(resolve(RAIZ, 'public/sitemap.xml'), sitemap)
writeFileSync(resolve(RAIZ, 'public/robots.txt'), robots)

console.log(`[sitemap] ${urls.length} URLs geradas (${slugs.length} artigos) → public/sitemap.xml + robots.txt`)
