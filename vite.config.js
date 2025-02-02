import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    server: {
        port: 3000,
        open: false
    },
    build: {
        outDir: 'dist',
        assetsDir: 'assets'
    },
    publicDir: 'public'
})