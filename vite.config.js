// vite.config.js
export default {
    root: '.',
    publicDir: 'public',
    server: {
        port: 3000
    },
    build: {
        outDir: 'dist',
        rollupOptions: {
            input: {
                main: '/index.html',
                map: '/src/map.html',
                global_overview: '/src/global_overview.html',
                map3d: '/src/map3d.html'
            }
        }
    }
}