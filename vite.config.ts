import { defineConfig } from 'vite'
import devServer from '@hono/vite-dev-server'
import { cloudflareAdapter } from '@hono/vite-dev-server/cloudflare'
import wasm from 'vite-plugin-wasm'
import topLevelAwait from 'vite-plugin-top-level-await'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig(({ mode }) => {
  if (mode === 'client') {
    return {
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
        },
      },
      plugins: [react(), wasm(), topLevelAwait()],
      optimizeDeps: {
        exclude: ['@silvia-odwyer/photon'],
      },
      build: {
        rollupOptions: {
          input: './src/client.tsx',
          output: {
            entryFileNames: 'static/client.js',
            chunkFileNames: 'static/[name].js',
            assetFileNames: 'static/[name].[ext]',
          },
        },
      },
    }
  }

  return {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        'react-dom/server': path.resolve(__dirname, 'node_modules/react-dom/server.browser.js'),
      },
    },
    plugins: [
      react(),
      devServer({
        entry: 'src/index.tsx',
        adapter: cloudflareAdapter,
      }),
      wasm(),
      topLevelAwait(),
    ],
    optimizeDeps: {
      include: ['react', 'react-dom', 'react/jsx-dev-runtime', 'react/jsx-runtime', 'react-dom/server'],
      exclude: ['@silvia-odwyer/photon'],
    },
    ssr: {
      target: 'webworker',
      noExternal: true,
      optimizeDeps: {
        include: ['react', 'react-dom', 'react/jsx-dev-runtime', 'react/jsx-runtime', 'react-dom/server'],
      },
    },
    build: {
      ssr: true,
      target: 'esnext',
      emptyOutDir: false,
      rollupOptions: {
        input: 'src/index.tsx',
        output: {
          entryFileNames: '_worker.js',
        }
      },
    },
  }
})
