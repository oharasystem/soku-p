import { Hono } from 'hono'
import { serveStatic } from 'hono/cloudflare-workers'
import { renderToReadableStream } from 'react-dom/server'
import App from './App'

const app = new Hono()

app.use('/static/*', serveStatic({ root: './' }))

app.get('*', async (c) => {
  const stream = await renderToReadableStream(
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Soku-p</title>
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
        <div id="root"><App /></div>
      </body>
    </html>
  )
  return c.body(stream, {
    headers: {
      'Content-Type': 'text/html; charset=UTF-8',
      'Transfer-Encoding': 'chunked',
    },
  })
})

export default app
