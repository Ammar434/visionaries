import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    server: {
        port: 3000,
        open: false
    },
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
        rollupOptions: {
            output: {
                manualChunks: {
                    'd3': ['d3'],
                    'vendor': ['papaparse']
                }
            }
        },
        minify: 'terser',
        sourcemap: true
    },
    publicDir: 'public',
    base: '/visionaries/',
    resolve: {
        alias: {
            '@': resolve(__dirname, './src')
        }
    }
})