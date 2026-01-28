import { Hono } from 'hono'
import { renderToReadableStream } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server'
import App from './App'
import { SUPPORTED_INPUTS, SUPPORTED_OUTPUTS, isValidFormat } from './lib/constants'
import { generateMetadata, SEOData } from './lib/seo'

const app = new Hono()

const BASE_URL = 'https://soku-p.solooo.dev'

// Sitemap.xml for SEO
app.get('/sitemap.xml', (c) => {
  const urls: { loc: string; priority: string; changefreq: string }[] = []

  // Top page
  urls.push({ loc: '/', priority: '1.0', changefreq: 'weekly' })

  // Privacy page
  urls.push({ loc: '/privacy', priority: '0.3', changefreq: 'monthly' })

  // All valid conversion pages
  for (const source of SUPPORTED_INPUTS) {
    for (const target of SUPPORTED_OUTPUTS) {
      if (isValidFormat(source, target)) {
        urls.push({
          loc: `/convert/${source}-to-${target}`,
          priority: '0.8',
          changefreq: 'monthly'
        })
      }
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${BASE_URL}${u.loc}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`

  return c.text(xml, 200, {
    'Content-Type': 'application/xml'
  })
})

// robots.txt for SEO
app.get('/robots.txt', (c) => {
  return c.text(`User-agent: *
Allow: /

Sitemap: ${BASE_URL}/sitemap.xml
`, 200, {
    'Content-Type': 'text/plain'
  })
})

// ads.txt for AdSense
app.get('/ads.txt', (c) => {
  return c.text(`google.com, pub-3860710971355910, DIRECT, f08c47fec0942fa0
`, 200, {
    'Content-Type': 'text/plain'
  })
})

// Helper to render the HTML
async function renderHtml(c: any, initialData: { source?: string, target?: string }, seo: SEOData) {
  const stream = await renderToReadableStream(
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/png" href="/favicon.png" />
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <meta property="og:url" content={`${BASE_URL}${c.req.path}`} />
        <meta property="og:image" content={`${BASE_URL}/ogp.png`} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={seo.title} />
        <meta property="og:description" content={seo.description} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={`${BASE_URL}/ogp.png`} />
        {seo.jsonLd && (
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: seo.jsonLd }} />
        )}

        {/* Inject Initial Data for Hydration */}
        <script dangerouslySetInnerHTML={{ __html: `window.__INITIAL_DATA__ = ${JSON.stringify(initialData)}` }} />

        {import.meta.env.PROD ? (
          <>
            <link rel="stylesheet" href="/static/client.css" />
            <script type="module" src="/static/client.js"></script>
          </>
        ) : (
          <>
            <link rel="stylesheet" href="/src/index.css" />
            <script type="module" dangerouslySetInnerHTML={{
              __html: `
              import RefreshRuntime from "/@react-refresh"
              RefreshRuntime.injectIntoGlobalHook(window)
              window.$RefreshReg$ = () => {}
              window.$RefreshSig$ = () => (type) => type
              window.__vite_plugin_react_preamble_installed__ = true
            ` }} />
            <script type="module" src="/@vite/client"></script>
            <script type="module" src="/src/client.tsx"></script>
          </>
        )}
      </head>
      <body>
        <div id="root">
          <StaticRouter location={c.req.path}>
            <App initialSource={initialData.source} initialTarget={initialData.target} />
          </StaticRouter>
        </div>
      </body>
    </html>
  )
  return c.body(stream, {
    headers: {
      'Content-Type': 'text/html; charset=UTF-8',
      'Transfer-Encoding': 'chunked',
    },
  })
}

// Dynamic Route for SEO
app.get('/convert/:slug', async (c) => {
  const slug = c.req.param('slug')
  const parts = slug.split('-to-')

  if (parts.length !== 2) {
    // If invalid slug format, redirect to home or let router handle it?
    // Current logic redirects.
    return c.redirect('/')
  }

  const [source, target] = parts

  if (!isValidFormat(source, target)) {
    return c.redirect('/')
  }

  const seo = generateMetadata(source, target)

  return renderHtml(c, { source, target }, seo)
})

// Default/Catch-all Route
app.get('*', async (c) => {
  // Check if it's a privacy page or others for SEO metadata
  // For now simple default SEO.
  const seo: SEOData = {
    title: 'Soku-p | 無料・安全な画像変換ツール',
    description: 'WebAssemblyを使用した高速・安全なクライアントサイド画像変換ツール。JPG, PNG, WebP, HEICなどに対応。登録不要、完全無料。',
    jsonLd: ''
  }

  // We can customize title based on path if needed
  if (c.req.path === '/privacy') {
    seo.title = 'プライバシーポリシー | Soku-p';
  }

  return renderHtml(c, {}, seo)
})

export default app
