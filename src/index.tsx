import { Hono } from 'hono';
import { renderToReadableStream } from 'react-dom/server';
import { App } from './App';

type Bindings = {
    ENVIRONMENT: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// Serve static assets
app.get('/static/*', async (c) => {
    return c.notFound();
});

// Handle all routes with React SSR
app.get('*', async (c) => {
    const url = new URL(c.req.url);

    const stream = await renderToReadableStream(
        <html lang="ja">
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <title>Soku-p - Privacy-First Image Converter</title>
                <meta
                    name="description"
                    content="Convert images securely in your browser. No uploads, no servers - complete privacy with WASM-powered conversion."
                />
                <link rel="stylesheet" href="/static/globals.css" />
            </head>
            <body>
                <div id="root">
                    <App path={url.pathname} />
                </div>
                <script type="module" src="/static/client.js"></script>
            </body>
        </html>,
        {
            bootstrapScriptContent: `window.__INITIAL_PATH__ = "${url.pathname}";`,
        }
    );

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/html; charset=utf-8',
        },
    });
});

export default app;
