import { defineConfig } from 'vite'
import devServer from '@hono/vite-dev-server'
import { cloudflareAdapter } from '@hono/vite-dev-server/cloudflare'
import wasm from 'vite-plugin-wasm'
import topLevelAwait from 'vite-plugin-top-level-await'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  if (mode === 'client') {
    return {
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
        },
      },
      plugins: [react(), wasm(), topLevelAwait()],
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
      },
    },
    plugins: [
      devServer({
        entry: 'src/index.tsx',
        adapter: cloudflareAdapter,
      }),
      wasm(),
      topLevelAwait(),
    ],
    ssr: {
      target: 'webworker',
      noExternal: true,
    },
    build: {
      ssr: true,
      target: 'esnext',
      rollupOptions: {
        input: 'src/index.tsx',
        output: {
          entryFileNames: '_worker.js',
        }
      },
    },
  }
})
