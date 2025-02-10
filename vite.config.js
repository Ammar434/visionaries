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
            input: {
                main: resolve(__dirname, 'index.html'),
                global: resolve(__dirname, 'src/global_overview.html'),
                sunburst: resolve(__dirname, 'src/accident_sequences.html'),
            },
            output: {
                // chunkFileNames: 'assets/js/[name]-[hash].js',
                // entryFileNames: 'assets/js/[name]-[hash].js',
                // assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
            }
        },
        minify: 'esbuild',
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