import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { existsSync } from 'fs';
import { join } from 'path';
import path from 'path'; // Import du module path


// https://vitejs.dev/config/
export default defineConfig({
    resolve: {
        alias: {
            '@common': path.resolve(__dirname, '../common/src')
        },
    },
    plugins: [
        react(),
        {
            name: 'control-md-files',
            configureServer(server) {
                server.middlewares.use((req, res, next) => {
                    if (! req.url.endsWith('.md')) {
                        next();
                        return;
                    }
                    const filePath = join(process.cwd(), 'public', req.url);
                    if (existsSync(filePath)) {
                        next();
                        return;
                    }
                    res.statusCode = 404;
                    res.end('Not Found');
                });
            }
        }
    ],
    server: {
        host: "0.0.0.0",
        port: 9000,
        strictPort: true,
        proxy: {
            '/api': {
                target: 'http://localhost:9101', // backend address
            },
            '/locales/common': {
                target: 'http://localhost:9101', // backend address
            },
            '/swagger.json': {
                target: 'http://localhost:9101', // backend address
            },
            '/api-docs': {
                target: 'http://localhost:9101', // backend address
            },
        }
    }
});
