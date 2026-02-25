import { defineConfig } from 'vitest/config'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import { fileURLToPath, URL } from 'url'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  plugins: [
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    viteReact(),
  ],
  test: {
    globals: false,
    environment: 'node',
  },
})
