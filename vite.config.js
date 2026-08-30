import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// API_PROXY_TARGET lets this point at a local backend (docker-compose) or
// stay pointed at the live one; defaults to the deployed backend so `npm
// run dev` works with zero setup.
const target = process.env.API_PROXY_TARGET || 'http://golahmar.osdl.ir'

// Proxies API paths to the Django backend so the browser sees one origin
// even in dev, matching prod (Ingress does the same split there) -- this is
// what lets session-cookie auth and CSRF work with no CORS setup at all.
const API_PATHS = ['/cluster', '/app', '/namespace', '/backup', '/auth', '/admin', '/docs', '/schema', '/healthz', '/static']

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: Object.fromEntries(
      API_PATHS.map((path) => [path, { target, changeOrigin: true }]),
    ),
  },
})
