import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [ react() ],
    server: {
		host: "0.0.0.0",
		port: 9000,
		strictPort: true,
        proxy: {
            '/api': {
                target: 'http://localhost:9101', // backend address
            }
        }
	}
})
