import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import devServer from '@hono/vite-dev-server';
import cloudflareAdapter from '@hono/vite-dev-server/cloudflare';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
    if (mode === 'client') {
        // Client bundle configuration
        return {
            plugins: [react()],
            build: {
                outDir: 'dist/static',
                rollupOptions: {
                    input: './src/client.tsx',
                    output: {
                        entryFileNames: 'client.js',
                    },
                },
            },
        };
    }

    // Server/Worker configuration
    return {
        plugins: [
            react(),
            devServer({
                entry: 'src/index.tsx',
                adapter: cloudflareAdapter,
            }),
        ],
        build: {
            outDir: 'dist',
            minify: true,
            rollupOptions: {
                input: './src/index.tsx',
                output: {
                    entryFileNames: 'index.js',
                    format: 'es',
                },
                external: ['__STATIC_CONTENT_MANIFEST'],
            },
        },
        resolve: {
            alias: {
                '@': resolve(__dirname, './src'),
            },
        },
        assetsInclude: ['**/*.wasm'],
    };
});
