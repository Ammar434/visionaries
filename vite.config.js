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
                // Organize output files into directories
                chunkFileNames: 'js/[name]-[hash].js',
                entryFileNames: 'js/[name]-[hash].js',
                assetFileNames: ({ name }) => {
                    if (/\.css$/.test(name ?? '')) {
                        return 'css/[name]-[hash][extname]';
                    }
                    if (/\.(png|jpe?g|gif|svg|webp)$/.test(name ?? '')) {
                        return 'images/[name]-[hash][extname]';
                    }
                    return 'assets/[name]-[hash][extname]';
                }
            }
        },
        minify: 'esbuild',
        sourcemap: true
    },
    base: './',
    publicDir: 'public',
    resolve: {
        alias: {
            '@': resolve(__dirname, './src'),
            '@styles': resolve(__dirname, './styles'),
            '@images': resolve(__dirname, './images'),
            '@public': resolve(__dirname, './public')
        }
    },
    css: {
        preprocessorOptions: {
        },
        modules: {
            scopeBehavior: 'local',
            localsConvention: 'camelCase'
        }
    }
});