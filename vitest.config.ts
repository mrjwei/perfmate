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
    },
  },
  ssr: {
    // Without this, Vite treats next-intl as an external SSR dependency and
    // loads it via Node's native resolver (bypassing the alias above, which
    // only applies to Vite-resolved imports), reintroducing the same
    // "next/navigation" resolution failure under Vitest.
    noExternal: ['next-intl'],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts']
  }
})
