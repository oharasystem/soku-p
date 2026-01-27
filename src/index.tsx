import { Hono } from 'hono'
import { serveStatic } from 'hono/cloudflare-workers'
import { renderToReadableStream } from 'react-dom/server'
import App from './App'
import { isValidFormat } from './lib/constants'
import { generateMetadata, SEOData } from './lib/seo'

const app = new Hono()

app.use('/static/*', serveStatic({ root: './' }))

// Helper to render the HTML
async function renderHtml(c: any, initialData: { source?: string, target?: string }, seo: SEOData) {
  const stream = await renderToReadableStream(
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        {seo.jsonLd && (
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: seo.jsonLd }} />
        )}

        {/* Inject Initial Data for Hydration */}
        <script dangerouslySetInnerHTML={{ __html: `window.__INITIAL_DATA__ = ${JSON.stringify(initialData)}` }} />

        {import.meta.env.PROD ? (
          <>
            <link rel="stylesheet" href="/static/index.css" />
            <script type="module" src="/static/client.js"></script>
          </>
        ) : (
          <>
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
          <App initialSource={initialData.source} initialTarget={initialData.target} />
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
  // split on LAST occurrence of '-to-' or just first?
  // format is simple: 'heic-to-jpg'. 'source' shouldn't contain '-to-' usually.
  const parts = slug.split('-to-')

  // Validation: must have exactly 2 parts
  if (parts.length !== 2) {
    return c.redirect('/')
  }

  const [source, target] = parts

  // Validation: Check supported formats
  if (!isValidFormat(source, target)) {
    return c.redirect('/')
  }

  const seo = generateMetadata(source, target)

  return renderHtml(c, { source, target }, seo)
})

// Default/Catch-all Route
app.get('*', async (c) => {
  // Default SEO
  const seo: SEOData = {
    title: 'Soku-p',
    description: 'Client-side image conversion powered by WebAssembly. Private, fast, and secure.',
    jsonLd: ''
  }

  return renderHtml(c, {}, seo)
})

export default app
