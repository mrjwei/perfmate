import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths"
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  resolve: {
    alias: {
      // next-intl's navigation module imports the bare specifier
      // 'next/navigation' (no extension); Next ships no "exports" map for
      // it, so Vite's ESM resolver can't find it under Vitest without an
      // explicit alias to the concrete file.
      'next/navigation': path.resolve(dirname, 'node_modules/next/navigation.js'),
      // next-auth's env.js imports the bare 'next/server' specifier the
      // same way — same missing-exports-map issue, same fix.
      'next/server': path.resolve(dirname, 'node_modules/next/server.js'),
    },
  },
  ssr: {
    // Without this, Vite treats next-intl/next-auth as external SSR
    // dependencies and loads them via Node's native resolver (bypassing the
    // aliases above, which only apply to Vite-resolved imports),
    // reintroducing the same "next/navigation"/"next/server" resolution
    // failures under Vitest.
    noExternal: ['next-intl', 'next-auth'],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts']
  }
})
