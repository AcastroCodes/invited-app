import { defineConfig, loadEnv } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd());
    const devDomain = env.VITE_DEV_DOMAIN || 'localhost';

    return {
        plugins: [
            laravel({
                input: ['resources/css/app.css', 'resources/js/app.jsx'],
                refresh: true,
            }),
            react(),
            tailwindcss(),
            basicSsl(),
        ],
        server: {
            host: '0.0.0.0',
            https: true,
            cors: true,
            strictPort: true,
            headers: {
                'Cross-Origin-Opener-Policy': 'same-origin',
                'Cross-Origin-Embedder-Policy': 'require-corp',
            },
            hmr: {
                host: devDomain,
            },
            proxy: {
                '/api': `http://127.0.0.1:8081`,
                '/sanctum': `http://127.0.0.1:8081`,
                '/storage': `http://127.0.0.1:8081`,
                '^/(?!(resources|node_modules|@vite|@react-refresh|vendor))': {
                    target: `http://127.0.0.1:8081`,
                    changeOrigin: true,
                    xfwd: true,
                },
            },
        },
        optimizeDeps: {
            exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util'],
        },
    };
});

